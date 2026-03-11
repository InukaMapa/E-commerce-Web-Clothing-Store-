const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

// Middleware to ensure admin only
const adminAuth = auth(["admin"]);

// User Management
router.get("/users", adminAuth, adminController.getAllUsers);
router.put("/users/:id/status", adminAuth, adminController.updateUserStatus);

// Producer Management
router.get("/producers", adminAuth, adminController.getAllProducers);
router.put("/producers/:id/approve", adminAuth, adminController.approveProducer);

// Product Management
router.get("/products", adminAuth, adminController.getAllProducts);
router.put("/products/:id/status", adminAuth, adminController.updateProductStatus);

// Category Management
router.get("/categories", adminAuth, adminController.getCategories);
router.post("/categories", adminAuth, adminController.createCategory);

// Order Management
router.get("/orders", adminAuth, adminController.getAllOrders);

module.exports = router;
