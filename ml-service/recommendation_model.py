import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

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

    if user_id not in matrix.index:
        return []

    similar_users = similarity_df[user_id].sort_values(
        ascending=False
    )[1:3]

    recommended = []

    for other in similar_users.index:

        products = matrix.loc[other]

        for product in products.index:

            if products[product] > 0 and matrix.loc[user_id][product] == 0:
                recommended.append(product)

    return list(set(recommended))