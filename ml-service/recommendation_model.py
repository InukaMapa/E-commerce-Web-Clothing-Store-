import os
import re
import time
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
from bson import ObjectId

# Global cache variables
_cached_data = None
_last_fetch_time = 0
CACHE_EXPIRATION_SECONDS = 60

# Load MongoDB URI from backend/.env
def get_mongodb_uri():
    try:
        # Check current directory first, then parent directories
        for base_path in [os.getcwd(), os.path.dirname(__file__), os.path.join(os.path.dirname(__file__), "..")]:
            dotenv_path = os.path.join(base_path, "backend", ".env")
            if os.path.exists(dotenv_path):
                with open(dotenv_path, "r") as f:
                    for line in f:
                        match = re.match(r"^\s*MONGODB_URI\s*=\s*['\"]?(.*?)['\"]?\s*$", line)
                        if match:
                            return match.group(1)
    except Exception as e:
        print("Error reading .env:", e)
    return None

def fetch_data_from_mongodb():
    uri = get_mongodb_uri()
    if not uri:
        print("MONGODB_URI not found in env, using CSV fallback.")
        return None
    
    try:
        # Set a low timeout so we don't hang if DB is unreachable
        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=3000)
        # Verify connection
        client.admin.command('ping')
        db = client["test"]
        
        # Fetch approved products first so we only recommend active ones
        approved_products = set()
        for p in db.products.find({"status": "approved"}, {"_id": 1}):
            approved_products.add(str(p["_id"]))
            
        orders = list(db.orders.find({"status": {"$ne": "cancelled"}}, {"user": 1, "items.productId": 1}))
        
        if not orders:
            print("No orders found in MongoDB, using CSV fallback.")
            return None
            
        data = []
        for o in orders:
            user_id = str(o.get("user")) if o.get("user") else None
            if not user_id:
                continue
            items = o.get("items", [])
            for item in items:
                prod_id = str(item.get("productId")) if item.get("productId") else None
                if prod_id and (not approved_products or prod_id in approved_products):
                    data.append({"userId": user_id, "productId": prod_id})
                    
        if not data:
            print("No valid user purchase data found in MongoDB orders, using CSV fallback.")
            return None
            
        return pd.DataFrame(data)
    except Exception as e:
        print(f"Failed to fetch data from MongoDB: {e}. Using CSV fallback.")
        return None

def get_recommendation_matrix():
    global _cached_data, _last_fetch_time
    now = time.time()
    if _cached_data is None or (now - _last_fetch_time) > CACHE_EXPIRATION_SECONDS:
        df_db = fetch_data_from_mongodb()
        if df_db is not None:
            df = df_db
            is_mock_val = False
            print(f"Successfully loaded {len(df)} purchases from MongoDB.")
        else:
            csv_path = os.path.join(os.path.dirname(__file__), "user_purchases_large.csv")
            df = pd.read_csv(csv_path)
            is_mock_val = True
            print(f"Loaded {len(df)} mock purchases from CSV.")
            
        # Build matrix and similarity
        if not df.empty:
            matrix_val = pd.pivot_table(
                df,
                index="userId",
                columns="productId",
                aggfunc=len,
                fill_value=0
            )
            similarity_val = cosine_similarity(matrix_val)
            similarity_df_val = pd.DataFrame(
                similarity_val,
                index=matrix_val.index,
                columns=matrix_val.index
            )
        else:
            matrix_val = pd.DataFrame()
            similarity_df_val = pd.DataFrame()
            
        _cached_data = (matrix_val, similarity_df_val, is_mock_val, df)
        _last_fetch_time = now
        
    return _cached_data

def get_popular_products(is_mock, df, matrix):
    """Fallback: recommend popular products based on buy count."""
    try:
        if not is_mock:
            uri = get_mongodb_uri()
            if uri:
                client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=2000)
                db = client["test"]
                pipeline = [
                    {"$match": {"status": {"$ne": "cancelled"}}},
                    {"$unwind": "$items"},
                    {"$group": {"_id": "$items.productId", "count": {"$sum": "$items.quantity"}}},
                    {"$sort": {"count": -1}},
                    {"$limit": 6}
                ]
                results = list(db.orders.aggregate(pipeline))
                top_ids = []
                for r in results:
                    p_id = r.get("_id")
                    if p_id:
                        p = db.products.find_one({"_id": p_id, "status": "approved"}, {"_id": 1})
                        if p:
                            top_ids.append(str(p_id))
                if top_ids:
                    return top_ids
                
                # Fallback to random approved products
                approved = list(db.products.find({"status": "approved"}, {"_id": 1}).limit(6))
                if approved:
                    return [str(p["_id"]) for p in approved]
        
        # Mock popular items from CSV
        return df["productId"].value_counts().index[:6].tolist()
    except Exception as e:
        print("Error getting popular products:", e)
        if not matrix.empty:
            return list(matrix.columns[:6])
        return []

def recommend_products(user_id):
    matrix, similarity_df, is_mock, df = get_recommendation_matrix()
    
    # If the matrix is empty or user is not in index, return popular products
    if matrix.empty or user_id not in matrix.index:
        return get_popular_products(is_mock, df, matrix)

    # Find similar users
    similar_users = similarity_df[user_id].sort_values(
        ascending=False
    )
    
    # Filter out the user themselves
    similar_users = similar_users[similar_users.index != user_id]
    similar_users = similar_users[similar_users > 0].head(5)

    if similar_users.empty:
        return get_popular_products(is_mock, df, matrix)

    recommended = []
    user_purchased = set(matrix.columns[matrix.loc[user_id] > 0])

    for other in similar_users.index:
        other_purchases = matrix.loc[other]
        for product in other_purchases.index:
            if other_purchases[product] > 0 and product not in user_purchased:
                recommended.append(product)

    recommended_unique = list(set(recommended))
    
    # Pad with popular products if needed
    if len(recommended_unique) < 4:
        popular = get_popular_products(is_mock, df, matrix)
        for p in popular:
            if p not in user_purchased and p not in recommended_unique:
                recommended_unique.append(p)
                if len(recommended_unique) >= 6:
                    break

    return recommended_unique[:6]