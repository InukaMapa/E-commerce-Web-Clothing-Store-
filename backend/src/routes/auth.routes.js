const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", auth(), getMe);

module.exports = router;
