const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g., 'PRODUCT_UPDATE', 'STOCK_DEDUCTION', 'ORDER_STATUS_CHANGE'
  entityType: { type: String, required: true }, // 'Product', 'Order', 'User'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  before: { type: mongoose.Schema.Types.Mixed }, // Snapshot before change
  after: { type: mongoose.Schema.Types.Mixed },  // Snapshot after change
}, { timestamps: true });

// Index for fast dashboard/admin queries
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
