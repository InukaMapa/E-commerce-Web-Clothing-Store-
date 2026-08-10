const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String, required: true },
  address: { type: String },
  materialCategory: { type: String, default: "Fabric" },
  suppliedMaterials: { type: String },
  paymentTerms: { type: String, default: "Net 30" },
  status: { type: String, default: "Active" },
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", SupplierSchema);
