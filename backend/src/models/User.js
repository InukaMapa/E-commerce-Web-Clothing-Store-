const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["customer", "producer", "admin"],
    default: "customer",
  },
  status: {
    type: String,
    enum: ["active", "blocked", "pending"],
    default: "active",
  },
  producerProfile: {
    storeName: String,
    description: String,
    logo: String,
    isApproved: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);