const Product = require("../models/Product");
const dashboardService = require("../services/dashboard.service");

/**
 * Helper to parse date range from query strings
 */
const getQueryDates = (from, to) => {
  const endDate = to ? new Date(to) : new Date();
  const startDate = from ? new Date(from) : new Date(new Date().setDate(endDate.getDate() - 30));
  
  // Set time to start/end of day for inclusive match
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// ---------------------------------------------------------------------------
// GET /api/dashboard/alerts  (admin / producer)
// ---------------------------------------------------------------------------
exports.getAlerts = async (req, res) => {
  try {
    // ── 1. Identify low stock variants ────────────────────────────────────
    // Fetch all products to filter variants by comparing fields in JS
    const allProducts = await Product.find().select("name variants price").lean();

    const alerts = [];
    for (const p of allProducts) {
      if (!p.variants) continue;
      for (const v of p.variants) {
        // Compare stock with threshold per variant
        if (v.stock <= (v.lowStockThreshold || 5)) {
          alerts.push({
            productId: p._id,
            productName: p.name,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            threshold: v.lowStockThreshold || 5,
            severity: v.stock === 0 ? "CRITICAL" : "LOW"
          });
        }
      }
    }

    // ── 2. High Demand Placeholder ────────────────────────────────────────
    // In a real system, you'd calculate this by checking order frequency 
    // over the last 24h/7d. For now, returning a static placeholder.
    const demand = [
      { productName: "Classic T-Shirt", trend: "UP", velocity: "12 units/hr" },
      { productName: "Denim Jacket", trend: "STABLE", velocity: "3 units/hr" }
    ];

    return res.status(200).json({
      success: true,
      message: "Dashboard alerts fetched successfully",
      data: {
        inventoryAlerts: alerts,
        marketDemand: demand
      }
    });

  } catch (err) {
    console.error("getAlerts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/dashboard/kpis
// ---------------------------------------------------------------------------
exports.getKPIs = async (req, res) => {
  try {
    const { from, to } = req.query;
    const { startDate, endDate } = getQueryDates(from, to);

    const kpis = await dashboardService.getSummaryKPIs(startDate, endDate);

    return res.status(200).json({
      success: true,
      message: "KPIs fetched successfully",
      data: kpis,
    });
  } catch (err) {
    console.error("getKPIs error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/dashboard/sales-trend
// ---------------------------------------------------------------------------
exports.getSalesTrend = async (req, res) => {
  try {
    const { from, to, groupBy = "day" } = req.query;
    const { startDate, endDate } = getQueryDates(from, to);

    if (!["day", "week", "month"].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid groupBy value. Use day, week, or month.",
        data: null,
      });
    }

    const trend = await dashboardService.getSalesTrend(startDate, endDate, groupBy);

    return res.status(200).json({
      success: true,
      message: "Sales trend fetched successfully",
      data: trend,
    });
  } catch (err) {
    console.error("getSalesTrend error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// ---------------------------------------------------------------------------
// GET /api/dashboard/top-products
// ---------------------------------------------------------------------------
exports.getTopProducts = async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;
    const { startDate, endDate } = getQueryDates(from, to);

    const products = await dashboardService.getTopProducts(startDate, endDate, parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Top products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("getTopProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};
