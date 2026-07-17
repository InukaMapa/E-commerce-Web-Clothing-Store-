const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { handleChat } = require("../controllers/chat.controller");

// Middleware to parse token optionally
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Invalid token, but we don't throw 401 since it's optional auth
    }
  }
  next();
};

router.post("/", optionalAuth, handleChat);

module.exports = router;
