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
router.post("/send-design", auth(["customer", "admin", "producer"]), (req, res) => {
  // Temporary mock implementation in the router for quick persistence test
  console.log("🎨 Custom Design Ordered:", req.body);
  res.status(200).json({ success: true, message: "Design received by Slaughter Studio" });
});
router.get("/my", auth(["customer", "admin", "producer"]), getMyOrders);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get("/", auth(["admin"]), getAllOrders);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.put("/:id/status", auth(["producer", "admin"]), updateOrderStatus);

module.exports = router;
