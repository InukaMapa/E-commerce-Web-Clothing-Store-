const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const producerController = require("../controllers/producer.controller");

// Middleware to ensure producer only
const producerAuth = auth(["producer"]);

// Product Management
router.get("/products", producerAuth, producerController.getMyProducts);

// Order Management
router.get("/orders", producerAuth, producerController.getMyOrders);
router.put("/orders/:id/status", producerAuth, producerController.updateOrderStatus);

module.exports = router;
