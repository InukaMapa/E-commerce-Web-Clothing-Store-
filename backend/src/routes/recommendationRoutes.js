const express = require("express");
const axios = require("axios");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    let products = [];
    let productIds = [];

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/recommendations",
        { 
          params: { userId },
          timeout: 2000 // 2 seconds timeout to keep backend fast
        }
      );
      productIds = response.data.recommendedProducts || [];
    } catch (apiError) {
      console.warn("ML recommendation service is offline or timed out. Falling back to default products.");
    }

    // Filter valid MongoDB ObjectIds
    const validObjectIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validObjectIds.length > 0) {
      products = await Product.find({
        _id: { $in: validObjectIds },
        status: "approved"
      });
    }

    // If no products match or service was offline, fallback to latest approved products
    if (products.length === 0) {
      products = await Product.find({ status: "approved" })
        .sort({ createdAt: -1 })
        .limit(6);
    }

    res.json(products);

  } catch (error) {
    console.error("Error in recommendation route:", error);
    try {
      const fallbackProducts = await Product.find({ status: "approved" }).limit(6);
      res.json(fallbackProducts);
    } catch (dbError) {
      res.status(500).json({ message: "Recommendation error", error: error.message });
    }
  }
});

module.exports = router;