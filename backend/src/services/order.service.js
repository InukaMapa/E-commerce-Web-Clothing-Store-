const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const auditService = require("../services/audit.service");

// ---------------------------------------------------------------------------
// Checkout — validate stock, deduct inventory, create order (atomic)
// ---------------------------------------------------------------------------
exports.checkout = async (userId, items) => {
  // ── 1. Group items by productId for batch lookup ────────────────────────
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map();
  for (const p of products) productMap.set(p._id.toString(), p);

  // ── 2. Validate every line-item & build order items ─────────────────────
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw { status: 404, message: `Product ${item.productId} not found` };
    }

    const variant = product.variants.find((v) => v.sku === item.variantSku);
    if (!variant) {
      throw {
        status: 404,
        message: `Variant SKU "${item.variantSku}" not found on product "${product.name}"`,
      };
    }

    if (variant.stock < item.quantity) {
      throw {
        status: 400,
        message: `Insufficient stock for "${product.name}" (SKU: ${item.variantSku}). Available: ${variant.stock}, Requested: ${item.quantity}`,
      };
    }

    // Use the server-side price, never trust the client
    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;

    orderItems.push({
      productId: product._id,
      variantSku: item.variantSku,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // ── 3. Deduct stock atomically per variant ──────────────────────────────
  // Uses MongoDB's positional operator to target the exact variant sub-doc.
  // If any update fails (concurrent purchase drained stock), we throw.
  for (const item of orderItems) {
    const result = await Product.updateOne(
      {
        _id: item.productId,
        "variants.sku": item.variantSku,
        "variants.stock": { $gte: item.quantity },
      },
      { $inc: { "variants.$.stock": -item.quantity } }
    );

    if (result.modifiedCount === 0) {
      throw {
        status: 409,
        message: `Stock changed for SKU "${item.variantSku}" during checkout. Please try again.`,
      };
    }

    // ── Audit Log ─────────────────────────────────────────────────────────
    await auditService.logAction({
      actorUserId: userId,
      action: "STOCK_DEDUCTION",
      entityType: "Product",
      entityId: item.productId,
      after: { sku: item.variantSku, quantityDeducted: item.quantity },
    });
  }

  // ── 4. Create the order ─────────────────────────────────────────────────
  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount: Math.round(totalAmount * 100) / 100, // avoid floating-point drift
    status: "placed",
  });

  return order.toObject();
};

// ---------------------------------------------------------------------------
// List orders for a specific user (customer)
// ---------------------------------------------------------------------------
exports.listMy = async (userId, query) => {
  const { page = 1, limit = 10 } = query;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 50);
  const skip = (pageNum - 1) * limitNum;

  const filter = { user: userId };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("items.productId", "name images")
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

// ---------------------------------------------------------------------------
// List all orders (admin) — filter by date range & status
// ---------------------------------------------------------------------------
exports.listAll = async (query) => {
  const { page = 1, limit = 20, status, startDate, endDate } = query;
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (status) filter.status = status;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("user", "name email")
      .populate("items.productId", "name images")
      .lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

// ---------------------------------------------------------------------------
// Update order status (state-machine validation)
// ---------------------------------------------------------------------------
const VALID_TRANSITIONS = {
  placed: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["completed", "cancelled"],
  // completed & cancelled are terminal states
};

exports.updateStatus = async (orderId, newStatus, actorUserId) => {
  const order = await Order.findById(orderId);
  if (!order) return null;

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw {
      status: 400,
      message: `Cannot transition from "${order.status}" to "${newStatus}". Allowed: ${
        allowed ? allowed.join(", ") : "none (terminal state)"
      }`,
    };
  }

  const oldStatus = order.status;
  order.status = newStatus;
  await order.save();

  const updatedOrder = await Order.findById(orderId)
    .populate("user", "name email")
    .populate("items.productId", "name images")
    .lean();

  // ── Audit Log ─────────────────────────────────────────────────────────
  await auditService.logAction({
    actorUserId,
    action: "ORDER_STATUS_CHANGED",
    entityType: "Order",
    entityId: order._id,
    before: { status: oldStatus },
    after: { status: updatedOrder.status },
  });

  return updatedOrder;
};
