const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      variantId: mongoose.Schema.Types.ObjectId,
      variantName: String, // e.g., "M", "L", "32"
      variantSku: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["placed", "paid", "processing", "shipped", "completed", "cancelled"],
    default: "placed",
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);