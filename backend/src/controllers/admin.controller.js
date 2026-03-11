const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "customer" }).select("-password");
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Producer Management
// ---------------------------------------------------------------------------
exports.getAllProducers = async (req, res) => {
    try {
        const producers = await User.find({ role: "producer" }).select("-password");
        return res.status(200).json({ success: true, data: producers });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.approveProducer = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { "producerProfile.isApproved": true, status: "active" },
            { new: true }
        ).select("-password");
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Product Management
// ---------------------------------------------------------------------------
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("createdBy", "name email");
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Category Management
// ---------------------------------------------------------------------------
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json({ success: true, data: categories });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        return res.status(201).json({ success: true, data: category });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Order Management
// ---------------------------------------------------------------------------
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email");
        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
