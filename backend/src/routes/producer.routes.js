const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const producerController = require("../controllers/producer.controller");

// Middleware to ensure producer only
const producerAuth = auth(["producer"]);

// Dashboard Stats
router.get("/dashboard", producerAuth, producerController.getProducerDashboard);

// Product Management
router.get("/products", producerAuth, producerController.getMyProducts);
router.post("/products", producerAuth, producerController.createProduct);
router.put("/products/:id", producerAuth, producerController.updateProduct);
router.delete("/products/:id", producerAuth, producerController.deleteProduct);
router.put("/products/:id/stock", producerAuth, producerController.updateStock);

// Order Management
router.get("/orders", producerAuth, producerController.getMyOrders);
router.put("/orders/:id/status", producerAuth, producerController.updateOrderStatus);

// Review Management
router.get("/reviews", producerAuth, producerController.getReviews);

module.exports = router;
