from fastapi import FastAPI
from recommendation_model import recommend_products

app = FastAPI()

# Root route (optional but useful)
@app.get("/")
def home():
    return {"message": "Recommendation API is running"}

# Recommendation endpoint
@app.get("/recommendations")
def get_recommendations(userId: str):
    recs = recommend_products(userId)

    return {
        "userId": userId,
        "count": len(recs),
        "recommendedProducts": recs
    }