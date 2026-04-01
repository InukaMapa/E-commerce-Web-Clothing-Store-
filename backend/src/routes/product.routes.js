const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

// ── Public ────────────────────────────────────────────────────────────────
router.get("/", getProducts);
router.get("/:id", getProduct);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.post("/", auth(["producer", "admin"]), createProduct);
router.put("/:id", auth(["producer", "admin"]), updateProduct);

// ── Admin only ────────────────────────────────────────────────────────────
router.delete("/:id", auth(["admin"]), deleteProduct);

module.exports = router;
