const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  sku: String,
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  variants: [variantSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);