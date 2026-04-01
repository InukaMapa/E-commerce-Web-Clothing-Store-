const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAlerts,
  getKPIs,
  getSalesTrend,
  getTopProducts,
} = require("../controllers/dashboard.controller");

// Protected: Admin and Producers only
router.get("/alerts", auth(["admin", "producer"]), getAlerts);
router.get("/kpis", auth(["admin", "producer"]), getKPIs);
router.get("/sales-trend", auth(["admin", "producer"]), getSalesTrend);
router.get("/top-products", auth(["admin", "producer"]), getTopProducts);

module.exports = router;
