const mongoose = require("mongoose");

const SupplierPaymentSchema = new mongoose.Schema({
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: "Cash" },
  notes: { type: String },
});

module.exports = mongoose.model("SupplierPayment", SupplierPaymentSchema);
