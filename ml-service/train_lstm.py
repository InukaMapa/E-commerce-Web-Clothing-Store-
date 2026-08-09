import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

df = pd.read_csv("sales_data.csv")

product_df = df[df["productId"]=="P1"]

values = product_df["quantity"].values.reshape(-1,1)

scaler = MinMaxScaler()

scaled = scaler.fit_transform(values)

X=[]
y=[]

sequence_length = 7

for i in range(len(scaled)-sequence_length):

    X.append(scaled[i:i+sequence_length])
    y.append(scaled[i+sequence_length])

X = np.array(X)
y = np.array(y)

model = Sequential()

model.add(LSTM(50, return_sequences=True, input_shape=(7,1)))
model.add(LSTM(50))
model.add(Dense(1))

model.compile(
    optimizer="adam",
    loss="mean_squared_error"
)

model.fit(X,y,epochs=20,batch_size=16)

model.save("lstm_model.h5")

print("Model trained and saved")