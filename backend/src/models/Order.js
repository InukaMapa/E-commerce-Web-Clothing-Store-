const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      variantSku: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "processing", "completed", "cancelled"],
    default: "placed",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);