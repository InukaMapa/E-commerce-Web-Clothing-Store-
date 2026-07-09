const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const CustomDesign = require("../models/CustomDesign");
const XLSX = require("xlsx");

// User Management
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

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Producer Management
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

exports.suspendProducer = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "blocked" },
            { new: true }
        ).select("-password");
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Product Management
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate("createdBy", "name email");
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json({ success: true, data: product });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
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

// Category Management
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

// Order Management
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.productId", "name images price")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
            .populate("user", "name email")
            .populate("items.productId", "name images price");
        return res.status(200).json({ success: true, data: order });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Inventory & Stats
exports.getInventory = async (req, res) => {
    try {
        const products = await Product.find().select("name variants status");
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let match = { status: { $ne: "cancelled" } };
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            match.createdAt = {
                $gte: start,
                $lte: end
            };
        }

        const [userCount, producerCount, productCount, filteredOrderCount, filteredRevenue, lowStockProducts] = await Promise.all([
            User.countDocuments({ role: "customer" }),
            User.countDocuments({ role: "producer" }),
            Product.countDocuments(),
            Order.countDocuments(match),
            Order.aggregate([
                { $match: match },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Product.find({ "variants.stock": { $lte: 3 } }).select("name variants")
        ]);

        const alerts = [];
        lowStockProducts.forEach(p => {
            p.variants.forEach(v => {
                if (v.stock <= 3) {
                    alerts.push({
                        productId: p._id,
                        name: p.name,
                        sku: v.sku || 'N/A',
                        size: v.size,
                        color: v.color,
                        stock: v.stock
                    });
                }
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                totalUsers: userCount,
                totalProducers: producerCount,
                totalProducts: productCount,
                totalOrders: filteredOrderCount,
                totalRevenue: filteredRevenue[0]?.total || 0,
                lowStockAlerts: alerts
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.downloadFullReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let match = {};
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const orders = await Order.find(match).populate("user", "name email").lean();
    
    const data = orders.map(o => ({
      ID: o._id.toString(),
      Customer: o.user?.name || "Guest",
      Email: o.user?.email || "N/A",
      Status: o.status,
      Amount: o.totalAmount,
      Date: new Date(o.createdAt).toLocaleDateString()
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buf);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let match = { status: { $ne: "cancelled" } };
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            match.createdAt = { $gte: start, $lte: end };
        }

        const trend = await Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return res.status(200).json({ success: true, data: trend });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getProductAnalytics = async (req, res) => {
    try {
        const top = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    sold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 10 }
        ]);
        return res.status(200).json({ success: true, data: top });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ── Slaughter Studio — Custom Design Submissions ──────────────────────────
exports.getCustomDesigns = async (req, res) => {
    try {
        const designs = await CustomDesign.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: designs });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCustomDesignStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const design = await CustomDesign.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("user", "name email");
        if (!design) {
            return res.status(404).json({ success: false, message: "Design not found" });
        }
        return res.status(200).json({ success: true, data: design });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
