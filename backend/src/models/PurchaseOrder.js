const mongoose = require("mongoose");

const PurchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  supplierName: { type: String, required: true },
  rawMaterialName: { type: String, required: true },
  rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterial", required: true },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0, default: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, default: "Unpaid" }, // "Paid", "Partially Paid", "Unpaid"
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);
