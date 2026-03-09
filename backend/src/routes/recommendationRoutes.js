const express = require("express");
const axios = require("axios");
const Product = require("../models/Product");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Call ML API
    const response = await axios.get(
      "http://127.0.0.1:8000/recommendations",
      { params: { userId } }
    );

    const productIds = response.data.recommendedProducts;

    // Get product details from MongoDB
    const products = await Product.find({
      _id: { $in: productIds }
    });

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Recommendation error" });
  }
});

module.exports = router;