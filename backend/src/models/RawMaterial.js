const mongoose = require("mongoose");

const RawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "Fabric" },
  unit: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  currentStock: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, default: 50 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  supplierName: { type: String, required: true },
  stockStatus: { type: String, default: "Available" },
  createdAt: { type: Date, default: Date.now },
});

// Update stock status before saving
RawMaterialSchema.pre("save", function() {
  if (this.currentStock === 0) {
    this.stockStatus = "Out of Stock";
  } else if (this.currentStock <= this.reorderLevel) {
    this.stockStatus = "Low Stock";
  } else {
    this.stockStatus = "Available";
  }
});

// Update stock status before update operations (findOneAndUpdate, updateOne, etc.)
RawMaterialSchema.pre("findOneAndUpdate", function() {
  const update = this.getUpdate();
  if (update && update.$set && typeof update.$set.currentStock !== "undefined") {
    const stock = update.$set.currentStock;
    const reorder = update.$set.reorderLevel !== "undefined" ? update.$set.reorderLevel : 50;
    if (stock === 0) {
      update.$set.stockStatus = "Out of Stock";
    } else if (stock <= reorder) {
      update.$set.stockStatus = "Low Stock";
    } else {
      update.$set.stockStatus = "Available";
    }
  }
});

module.exports = mongoose.model("RawMaterial", RawMaterialSchema);
