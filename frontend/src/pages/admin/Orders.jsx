import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  MapPin,
  Hash,
} from "lucide-react";
import api from "../../api/axios";

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-600";
      case "cancelled":
        return "bg-red-50 text-red-600";
      case "shipped":
        return "bg-blue-50 text-blue-600";
      case "processing":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (loading) return <div>Synchronizing logistics stream...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Logistics Control
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Order fulfillment and tracking synchronization
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="SEARCH ORDER ID OR CUSTOMER..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-black/5 pl-12 pr-6 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black/20 w-80 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-black/5">
        <table className="w-full text-left">
          <thead className="bg-[#fafafa] border-b border-black/5">
            <tr>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-widest">
                Order / Date
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-widest">
                Customer
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-widest text-center">
                Amount
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-widest text-center">
                Status
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-widest text-right">
                Fulfillment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-[#fafafa] transition-colors group"
              >
                <td className="px-8 py-8">
                  <p className="text-xs font-black uppercase tracking-widest text-black mb-1 flex items-center">
                    <Hash size={12} className="mr-1 text-gray-300" />{" "}
                    {order._id.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                    <Clock size={10} className="mr-1.5" />{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">
                    {order.user?.name || "GUEST"}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    {order.user?.email}
                  </p>
                </td>
                <td className="px-8 py-8 text-center text-xs font-serif font-bold text-black">
                  Rs. {order.totalAmount}
                </td>
                <td className="px-8 py-8 text-center">
                  <span
                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-8 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {["processing", "shipped", "completed", "cancelled"].map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => updateStatus(order._id, st)}
                          className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all border ${
                            order.status === st
                              ? "bg-black text-white border-black"
                              : "border-transparent text-gray-300 hover:border-black hover:text-black"
                          }`}
                        >
                          {st === "completed" ? (
                            <CheckCircle size={14} />
                          ) : st === "shipped" ? (
                            <Truck size={14} />
                          ) : st === "cancelled" ? (
                            <XCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-xs text-gray-400 uppercase font-black tracking-widest italic">
            No logistics events recorded
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManagement;
