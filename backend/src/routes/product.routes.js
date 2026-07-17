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

router.get("/search", (req, res, next) => {
  if (req.query.q) req.query.search = req.query.q;
  next();
}, getProducts);

router.get("/category/:category", (req, res, next) => {
  req.query.category = req.params.category;
  next();
}, getProducts);

router.get("/new", (req, res, next) => {
  req.query.sort = "newest";
  next();
}, getProducts);

router.get("/bestsellers", (req, res, next) => {
  req.query.sort = "name_asc"; // Fallback sort since there's no purchase count in schema
  next();
}, getProducts);

router.get("/sale", (req, res, next) => {
  // Let's filter products under $40 or containing sale tag
  req.query.maxPrice = req.query.maxPrice || 40;
  next();
}, getProducts);

router.get("/:id", getProduct);

// ── Producer / Admin ──────────────────────────────────────────────────────
router.post("/", auth(["producer", "admin"]), createProduct);
router.put("/:id", auth(["producer", "admin"]), updateProduct);

// ── Admin only ────────────────────────────────────────────────────────────
router.delete("/:id", auth(["admin"]), deleteProduct);

module.exports = router;
