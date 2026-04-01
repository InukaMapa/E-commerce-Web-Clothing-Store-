const Order = require("../models/Order");
const mongoose = require("mongoose");

/**
 * Get core summary KPIs
 */
exports.getSummaryKPIs = async (startDate, endDate, producerId = null) => {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" },
  };

  if (producerId) {
    // If producerId is provided, we need to filter orders that contain items from this producer
    // and only sum the revenue for those items.
    const stats = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.createdBy": new mongoose.Types.ObjectId(producerId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderCount: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ["$totalRevenue", 2] },
          orderCount: { $size: "$orderCount" },
          avgOrderValue: {
            $cond: [
              { $gt: [{ $size: "$orderCount" }, 0] },
              { $round: [{ $divide: ["$totalRevenue", { $size: "$orderCount" }] }, 2] },
              0
            ]
          },
        },
      },
    ]);
    return stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
  }

  // Global stats for Admin
  const stats = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: { $round: ["$totalRevenue", 2] },
        orderCount: 1,
        avgOrderValue: { $round: ["$avgOrderValue", 2] },
      },
    },
  ]);

  return stats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };
};

/**
 * Get sales trend grouped by day, week, or month
 */
exports.getSalesTrend = async (startDate, endDate, groupBy, producerId = null) => {
  let dateId;

  if (groupBy === "day") {
    dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  } else if (groupBy === "week") {
    dateId = {
      $concat: [
        { $dateToString: { format: "%Y", date: "$createdAt" } },
        "-W",
        { $dateToString: { format: "%V", date: "$createdAt" } }
      ]
    };
  } else { // month
    dateId = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    }
  ];

  if (producerId) {
    pipeline.push(
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $match: { "product.createdBy": new mongoose.Types.ObjectId(producerId) } },
      {
        $group: {
          _id: { date: dateId, orderId: "$_id" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          revenue: { $sum: "$revenue" },
          orders: { $sum: 1 },
        },
      }
    );
  } else {
    pipeline.push(
      {
        $group: {
          _id: dateId,
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      }
    );
  }

  pipeline.push(
    { $sort: { "_id": 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: { $round: ["$revenue", 2] },
        orders: 1,
      },
    }
  );

  return Order.aggregate(pipeline);
};

/**
 * Get top selling products by revenue
 */
exports.getTopProducts = async (startDate, endDate, limit, producerId = null) => {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" }
  ];

  if (producerId) {
    pipeline.push({ $match: { "productDetails.createdBy": new mongoose.Types.ObjectId(producerId) } });
  }

  pipeline.push(
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$productDetails.name" },
        price: { $first: "$productDetails.price" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        name: 1,
        totalRevenue: { $round: ["$totalRevenue", 2] },
        totalSold: 1,
        price: 1,
      },
    }
  );

  return Order.aggregate(pipeline);
};
