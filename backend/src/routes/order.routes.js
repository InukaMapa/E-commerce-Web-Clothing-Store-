const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const CustomDesign = require("../models/CustomDesign");
const {
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");

// ── Customer / Testing ──────────────────────────────────────────────────────
router.post("/checkout", auth(["customer", "admin", "producer"]), checkout);

// ── Send Custom Design to Slaughter Studio ───────────────────────────────
router.post("/send-design", auth(["customer", "admin", "producer"]), async (req, res) => {
  try {
    const {
      designs,
      tshirtColor,
      size,
      quantity,
      previewImage,
      frontPreviewImage,
      backPreviewImage,
      submittedAt,
      sizeQuantities,
    } = req.body;

    const doc = await CustomDesign.create({
      user:              req.user?.id || req.user?._id,
      tshirtColor:       tshirtColor  || "white",
      size:              size         || "M",
      quantity:          quantity     || 1,
      designs:           designs      || {},
      previewImage:      previewImage      || "",
      frontPreviewImage: frontPreviewImage || "",
      backPreviewImage:  backPreviewImage  || "",
      sizeQuantities:    sizeQuantities    || {},
      submittedAt:       submittedAt ? new Date(submittedAt) : new Date(),
    });

    console.log("🎨 Custom Design saved:", doc._id);
    return res.status(200).json({
      success: true,
      message: "Design received by Slaughter Studio",
      data: doc,
    });
  } catch (err) {
    console.error("❌ send-design error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/my", auth(["customer", "admin", "producer"]), getMyOrders);

// ── Admin ─────────────────────────────────────────────────────────────────
router.get("/", auth(["admin"]), getAllOrders);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.put("/:id/status", auth(["producer", "admin"]), updateOrderStatus);

module.exports = router;
