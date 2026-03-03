const Order = require("../models/Order");
const mongoose = require("mongoose");

/**
 * Get core summary KPIs
 */
exports.getSummaryKPIs = async (startDate, endDate) => {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" }, // Exclude cancelled orders from revenue
  };

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
exports.getSalesTrend = async (startDate, endDate, groupBy) => {
  let dateId;
  
  if (groupBy === "day") {
    dateId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  } else if (groupBy === "week") {
    dateId = { $concat: [
      { $dateToString: { format: "%Y", date: "$createdAt" } },
      "-W",
      { $dateToString: { format: "%V", date: "$createdAt" } }
    ]};
  } else { // month
    dateId = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
  }

  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: dateId,
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: { $round: ["$revenue", 2] },
        orders: 1,
      },
    },
  ]);
};

/**
 * Get top selling products by revenue
 */
exports.getTopProducts = async (startDate, endDate, limit) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 1,
        name: "$productDetails.name",
        totalRevenue: { $round: ["$totalRevenue", 2] },
        totalSold: 1,
        price: "$productDetails.price",
      },
    },
  ]);
};
