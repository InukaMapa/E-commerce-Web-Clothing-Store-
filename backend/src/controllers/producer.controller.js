const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// ---------------------------------------------------------------------------
// Product Management (Own only)
// ---------------------------------------------------------------------------
exports.getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: req.user.id });
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Order Management (Related to own products)
// ---------------------------------------------------------------------------
exports.getMyOrders = async (req, res) => {
    try {
        // 1. Get IDs of products created by this producer
        const myProductIds = await Product.find({ createdBy: req.user.id }).distinct("_id");

        // 2. Find orders containing those products
        const orders = await Order.find({
            "items.productId": { $in: myProductIds }
        }).populate("user", "name email");

        // 3. (Optional) Filter items within each order to only show those belonging to this producer
        // Based on requirements, they usually see the whole order but focusing on their items.
        // Let's keep the full order but maybe flag their items.

        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    // Note: In a real multi-vendor system, order status is complex.
    // Here we'll allow producers to update the sub-status or the main status if they are the only vendor.
    // For simplicity, we'll just allow them to update the main status for now.
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        return res.status(200).json({ success: true, data: order });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
