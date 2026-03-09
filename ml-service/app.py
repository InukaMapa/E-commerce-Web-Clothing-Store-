from fastapi import FastAPI
from recommendation_model import recommend_products

app = FastAPI()

@app.get("/recommendations")

def get_recommendations(userId:str):

    recs = recommend_products(userId)

    return {
        "userId": userId,
        "recommendedProducts": recs
    }