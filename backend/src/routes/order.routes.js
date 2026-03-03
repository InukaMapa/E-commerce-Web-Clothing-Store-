const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// ── Customer ──────────────────────────────────────────────────────────────
router.post("/checkout", auth(["customer"]), checkout);
router.get("/my", auth(["customer"]), getMyOrders);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get("/", auth(["admin"]), getAllOrders);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.put("/:id/status", auth(["producer", "admin"]), updateOrderStatus);

module.exports = router;
