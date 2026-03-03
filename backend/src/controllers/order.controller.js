const mongoose = require("mongoose");
const orderService = require("../services/order.service");

// ---------------------------------------------------------------------------
// POST /api/orders/checkout  (customer only)
// ---------------------------------------------------------------------------
exports.checkout = async (req, res) => {
  try {
    const { items } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and must not be empty",
        data: null,
      });
    }

    for (let i = 0; i < items.length; i++) {
      const { productId, variantSku, quantity } = items[i];

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `items[${i}].productId is missing or invalid`,
          data: null,
        });
      }
      if (!variantSku || typeof variantSku !== "string") {
        return res.status(400).json({
          success: false,
          message: `items[${i}].variantSku is required`,
          data: null,
        });
      }
      if (!quantity || typeof quantity !== "number" || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({
          success: false,
          message: `items[${i}].quantity must be a positive integer`,
          data: null,
        });
      }
    }

    // ── Delegate to service ───────────────────────────────────────────────
    const order = await orderService.checkout(req.user.id, items);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    console.error("checkout error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/orders/my  (customer — own orders)
// ---------------------------------------------------------------------------
exports.getMyOrders = async (req, res) => {
  try {
    const result = await orderService.listMy(req.user.id, req.query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/orders  (admin — all orders with filters)
// ---------------------------------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const result = await orderService.listAll(req.query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/orders/:id/status  (producer / admin)
// ---------------------------------------------------------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
        data: null,
      });
    }

    const validStatuses = ["placed", "paid", "processing", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
        data: null,
      });
    }

    const order = await orderService.updateStatus(id, status, req.user.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: { order },
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};
