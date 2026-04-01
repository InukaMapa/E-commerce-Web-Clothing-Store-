import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Hash,
  RotateCw,
  Package,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import api from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

const STATUS_COLORS = {
  placed:     "bg-blue-50 text-blue-600 border-blue-100",
  paid:       "bg-indigo-50 text-indigo-600 border-indigo-100",
  processing: "bg-orange-50 text-orange-600 border-orange-100",
  shipped:    "bg-purple-50 text-purple-600 border-purple-100",
  completed:  "bg-green-50 text-green-600 border-green-100",
  cancelled:  "bg-red-50 text-red-600 border-red-100",
};

// State machine — valid transitions for manual override
const ALL_STATUSES = ["placed", "paid", "processing", "shipped", "completed", "cancelled"];
const NEXT_STATUSES = {
  placed:     ["paid", "processing", "shipped", "completed", "cancelled"],
  paid:       ["processing", "shipped", "completed", "cancelled"],
  processing: ["completed", "shipped", "cancelled"],
  shipped:    ["completed", "cancelled"],
  completed:  ["processing", "shipped", "cancelled"],
  cancelled:  ["placed", "paid", "processing", "shipped", "completed"],
};

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await api.get("/api/admin/orders", { params });
      const data = res.data?.data;
      setOrders(Array.isArray(data) ? data : []);
      setLastFetched(new Date());
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to load orders. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds so new orders from customers appear automatically
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/orders/${id}/status`, { status });
      fetchOrders(true);
    } catch (err) {
      alert("Status update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = orders.filter(
    (o) =>
      o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-gray-50 border border-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xs font-black uppercase text-red-500 mb-4">{error}</p>
        <button onClick={() => fetchOrders()} className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-1">
            Order Management
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            {orders.length} total orders
            {lastFetched && ` · Updated ${lastFetched.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 shadow-sm">
            <div className="flex items-center space-x-2 border-r border-gray-100 pr-3">
              <CalendarIcon size={12} className="text-gray-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center pl-1">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="ml-2 text-[9px] font-black uppercase text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-colors w-60"
            />
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all"
          >
            <RotateCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-gray-200">
          <Package size={32} className="mx-auto text-gray-200 mb-4" />
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
            {searchTerm ? "No orders match your search" : "No orders yet. Customer orders will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white border border-gray-100 hover:border-gray-300 transition-all">
              {/* Order Header Row */}
              <div
                className="flex items-center justify-between px-6 py-5 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Order ID</p>
                    <p className="text-xs font-black font-mono text-black flex items-center gap-1">
                      <Hash size={11} className="text-gray-300" />
                      {order._id?.slice(-10).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Customer</p>
                    <p className="text-xs font-bold text-black">{order.user?.name || "—"}</p>
                    <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Date</p>
                    <p className="text-[10px] font-bold text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
                    <p className="text-sm font-black text-black">Rs. {order.totalAmount?.toFixed(2)}</p>
                  </div>

                  <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
                    {order.status}
                  </span>

                  {expandedOrder === order._id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-50 px-6 pb-6">
                  {/* Items */}
                  <div className="mt-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">Items Ordered</p>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => {
                        const product = item.productId;
                        const name = product?.name || "Product";
                        const img = product?.images?.[0];
                        return (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded">
                            <div className="flex items-center gap-3">
                              {img ? (
                                <img src={resolveImage(img)} alt="" className="w-10 h-10 object-cover rounded" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <Package size={14} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-[10px] font-bold text-black uppercase">{name}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">SKU: {item.variantSku} · Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="text-[10px] font-black text-black">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Actions */}
                  {NEXT_STATUSES[order.status]?.length > 0 && (
                    <div className="mt-6 flex items-center gap-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Update Status:</p>
                      {NEXT_STATUSES[order.status].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateStatus(order._id, st)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                            st === "cancelled"
                              ? "border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                              : "border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                          }`}
                        >
                          {st === "completed" ? <CheckCircle size={12} /> : st === "cancelled" ? <XCircle size={12} /> : <Clock size={12} />}
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
