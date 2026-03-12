const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// ── Customer / Testing ──────────────────────────────────────────────────────
router.post("/checkout", auth(["customer", "admin", "producer"]), checkout);
router.get("/my", auth(["customer", "admin", "producer"]), getMyOrders);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get("/", auth(["admin"]), getAllOrders);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.put("/:id/status", auth(["producer", "admin"]), updateOrderStatus);

module.exports = router;
