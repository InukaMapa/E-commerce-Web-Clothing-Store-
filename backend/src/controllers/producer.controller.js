const Review = require("../models/Review");

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------
exports.getProducerDashboard = async (req, res) => {
    try {
        const myProducts = await Product.find({ createdBy: req.user.id }).select("_id");
        const productIds = myProducts.map(p => p._id);

        const stats = await Promise.all([
            Product.countDocuments({ createdBy: req.user.id }),
            Order.countDocuments({ "items.productId": { $in: productIds } }),
            Order.countDocuments({ "items.productId": { $in: productIds }, status: "placed" }),
            Order.aggregate([
                { $match: { "items.productId": { $in: productIds }, status: { $ne: "cancelled" } } },
                { $unwind: "$items" },
                { $match: { "items.productId": { $in: productIds } } },
                { $group: { _id: null, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
            ])
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalProducts: stats[0],
                totalOrders: stats[1],
                pendingOrders: stats[2],
                totalRevenue: stats[3][0]?.revenue || 0
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

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

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create({ ...req.body, createdBy: req.user.id });
        return res.status(201).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
        if (!product) return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { variants } = req.body;
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            { variants },
            { new: true }
        );
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Order Management (Related to own products)
// ---------------------------------------------------------------------------
exports.getMyOrders = async (req, res) => {
    try {
        const myProductIds = await Product.find({ createdBy: req.user.id }).distinct("_id");
        const orders = await Order.find({
            "items.productId": { $in: myProductIds }
        }).populate("user", "name email").sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Check if user owns at least one item in the order to allow status update (simplified logic)
        const myProductIds = await Product.find({ createdBy: req.user.id }).distinct("_id");
        const order = await Order.findOne({ _id: req.params.id, "items.productId": { $in: myProductIds } });

        if (!order) return res.status(404).json({ success: false, message: "Order not found or unauthorized" });

        order.status = status;
        await order.save();

        return res.status(200).json({ success: true, data: order });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ---------------------------------------------------------------------------
// Review Management
// ---------------------------------------------------------------------------
exports.getReviews = async (req, res) => {
    try {
        const myProductIds = await Product.find({ createdBy: req.user.id }).distinct("_id");
        const reviews = await Review.find({ product: { $in: myProductIds } })
            .populate("product", "name")
            .populate("user", "name")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: reviews });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
