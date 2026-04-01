import pandas as pd
import numpy as np
from datetime import datetime, timedelta

products = ["P1","P2","P3","P4","P5"]

start_date = datetime(2024,1,1)

data = []

for product in products:

    for i in range(365):

        date = start_date + timedelta(days=i)

        demand = max(0, int(np.random.normal(20,5)))

        data.append({
            "date": date,
            "productId": product,
            "quantity": demand
        })

df = pd.DataFrame(data)

df.to_csv("sales_data.csv", index=False)

print("Sales dataset created")