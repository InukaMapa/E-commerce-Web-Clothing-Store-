import pandas as pd
import random

users = ["U1","U2","U3","U4","U5","U6"]
products = ["P1","P2","P3","P4","P5"]

data = []

for user in users:

    purchased = random.sample(products, random.randint(1,3))

    for p in purchased:

        data.append({
            "userId": user,
            "productId": p
        })

df = pd.DataFrame(data)

df.to_csv("user_purchases.csv", index=False)

print("User dataset created")