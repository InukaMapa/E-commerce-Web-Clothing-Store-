require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product");
const Order = require("./src/models/Order");
const dashboardService = require("./src/services/dashboard.service");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected...");

    console.log("--- Testing Dashboard Alerts logic ---");
    try {
      // The current getAlerts query
      const slowQuery = {
        "variants": {
          $elemMatch: {
            $expr: { $lte: ["$stock", "$lowStockThreshold"] }
          }
        }
      };
      console.log("Executing complex query:", JSON.stringify(slowQuery));
      const result = await Product.find(slowQuery).lean();
      console.log("Found:", result.length, "matching products");
    } catch (e) {
      console.error("ALERTS ERROR:", e.name, "-", e.message);
    }

    console.log("--- Testing Summary KPIs logic ---");
    try {
      const kpis = await dashboardService.getSummaryKPIs(new Date(0), new Date());
      console.log("KPIs:", kpis);
    } catch (e) {
      console.error("KPIS ERROR:", e.name, "-", e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("BOOT ERROR:", err);
    process.exit(1);
  }
})();
