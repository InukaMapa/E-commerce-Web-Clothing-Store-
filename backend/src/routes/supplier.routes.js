const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const supplierController = require("../controllers/supplier.controller");

// Middleware to ensure admin only
const adminAuth = auth(["admin"]);

// Supplier Routes
router.get("/suppliers", adminAuth, supplierController.getAllSuppliers);
router.get("/suppliers/:id", adminAuth, supplierController.getSupplierById);
router.post("/suppliers", adminAuth, supplierController.createOrUpdateSupplier);
router.delete("/suppliers/:id", adminAuth, supplierController.deleteSupplier);

// Raw Materials Routes
router.get("/raw-materials", adminAuth, supplierController.getAllRawMaterials);

// Purchase Orders Routes
router.get("/purchase-orders", adminAuth, supplierController.getAllPurchaseOrders);
router.post("/purchase-orders", adminAuth, supplierController.createPurchaseOrder);
router.post("/purchase-orders/:id/payments", adminAuth, supplierController.addPaymentToPO);

// Payments Routes
router.get("/payments", adminAuth, supplierController.getAllPayments);

module.exports = router;
