const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  sku: String,
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
});

const productSchema = new mongoose.Schema({
  productId: String,
  name: String,
  description: String,
  price: Number,
  images: [String],
  variants: [variantSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
  },
  category: {
    type: String,
    enum: ["T-Shirt", "Shirt", "Jeans", "Skirt", "Frock", ""],
    default: "",
  },
  gender: {
    type: String,
    enum: ["men", "women", "unisex", ""],
    default: "",
  },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);