const AuditLog = require("../models/AuditLog");

/**
 * Centrally log any system action
 * @param {Object} params
 * @param {string} params.actorUserId - ID of the user performing the action
 * @param {string} params.action - Descriptive string (e.g., 'PRODUCT_CREATED')
 * @param {string} params.entityType - 'Product', 'Order', etc.
 * @param {string} params.entityId - ID of the record being changed
 * @param {Object} [params.before] - State before changes
 * @param {Object} [params.after] - State after changes
 */
exports.logAction = async ({ actorUserId, action, entityType, entityId, before, after }) => {
  try {
    // Avoid circular refs or excessive data by cleaning objects if necessary
    const entry = new AuditLog({
      actorUserId,
      action,
      entityType,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : null,
      after: after ? JSON.parse(JSON.stringify(after)) : null,
    });
    await entry.save();
  } catch (err) {
    // We don't want an audit failure to crash the main request, 
    // but we should definitely log the error.
    console.error("Critical: Failed to save Audit Log:", err);
  }
};
