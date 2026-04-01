const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

// Middleware to ensure admin only
const adminAuth = auth(["admin"]);

// Dashboard & Reports
router.get("/dashboard-stats", adminAuth, adminController.getDashboardStats);
router.get("/inventory", adminAuth, adminController.getInventory);
router.get("/analytics/sales", adminAuth, adminController.getSalesAnalytics);
router.get("/analytics/products", adminAuth, adminController.getProductAnalytics);
router.get("/export-report", adminAuth, adminController.downloadFullReport);

// User Management
router.get("/users", adminAuth, adminController.getAllUsers);
router.put("/users/:id/block", adminAuth, adminController.updateUserStatus);
router.delete("/users/:id", adminAuth, adminController.deleteUser);

// Producer Management
router.get("/producers", adminAuth, adminController.getAllProducers);
router.put("/producers/:id/approve", adminAuth, adminController.approveProducer);
router.put("/producers/:id/suspend", adminAuth, adminController.suspendProducer);

// Product Management
router.get("/products", adminAuth, adminController.getAllProducts);
router.put("/products/:id", adminAuth, adminController.updateProduct);
router.delete("/products/:id", adminAuth, adminController.deleteProduct);
router.put("/products/:id/approve", adminAuth, adminController.updateProductStatus);

// Category Management
router.get("/categories", adminAuth, adminController.getCategories);
router.post("/categories", adminAuth, adminController.createCategory);

// Order Management
router.get("/orders", adminAuth, adminController.getAllOrders);
router.put("/orders/:id/status", adminAuth, adminController.updateOrderStatus);

module.exports = router;
