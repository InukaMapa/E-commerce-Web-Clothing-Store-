import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import hashlib

df = pd.read_csv("user_purchases_large.csv")

matrix = pd.pivot_table(
    df,
    index="userId",
    columns="productId",
    aggfunc=len,
    fill_value=0
)

similarity = cosine_similarity(matrix)

similarity_df = pd.DataFrame(
    similarity,
    index=matrix.index,
    columns=matrix.index
)

def recommend_products(user_id):
    active_user_id = user_id
    # If the user_id is a real MongoDB ObjectId or other user not in the mock dataset
    if user_id not in matrix.index:
        available_users = list(matrix.index)
        if available_users:
            # Deterministically map the user_id to one of the mock users
            hash_val = int(hashlib.md5(str(user_id).encode('utf-8')).hexdigest(), 16)
            user_idx = hash_val % len(available_users)
            active_user_id = available_users[user_idx]
        else:
            return ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]

    # Find similar users
    similar_users = similarity_df[active_user_id].sort_values(
        ascending=False
    )[1:4] # Top 3 similar users

    recommended = []

    for other in similar_users.index:
        products = matrix.loc[other]
        for product in products.index:
            if products[product] > 0 and matrix.loc[active_user_id][product] == 0:
                # Only include products that exist in our database (P1 to P41)
                try:
                    p_num = int(product.replace("P", ""))
                    if 1 <= p_num <= 41:
                        recommended.append(product)
                except ValueError:
                    pass

    # If no recommendations, fall back to a curated default set of existing products
    if not recommended:
        recommended = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]

    return list(set(recommended))[:10]