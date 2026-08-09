import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import api from "../../api/axios";

const ProducerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/producer/orders");
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
      await api.put(`/api/producer/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert("Lifecycle update failed");
    }
  };

  if (loading) return <div>Synchronizing logistics stream...</div>;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
          Order Fulfillment
        </h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
          Logistics synchronization for your brand units
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className={`bg-white border p-8 flex items-center justify-between cursor-pointer transition-all ${
                selectedOrder?._id === order._id
                  ? "border-black shadow-xl ring-1 ring-black"
                  : "border-black/5 hover:border-black/20"
              }`}
            >
              <div className="flex items-center space-x-10">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 min-w-[80px]">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                    Status
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-widest ${
                      order.status === "completed"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                    Order Ref: {order._id.slice(-8)}
                  </p>
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">
                    {order.user?.name || "Customer"}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1.5" />{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Package size={12} className="mr-1.5" />{" "}
                      {order.items?.length} UNITS
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif font-bold text-black mb-1">
                  Rs. {order.totalAmount}
                </p>
                <ChevronRight size={18} className="ml-auto text-gray-300" />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 uppercase text-xs font-black tracking-widest text-gray-300 italic">
              No logistics events recorded
            </div>
          )}
        </div>

        <div className="relative">
          {selectedOrder ? (
            <div className="bg-black text-white p-10 sticky top-12 space-y-12 shadow-2xl">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-8">
                  Fulfillment Control
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">
                        {selectedOrder.user?.name}
                      </p>
                      <p className="text-xs text-white/40 tracking-widest">
                        {selectedOrder.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-black uppercase tracking-widest text-white/60">
                    <MapPin size={16} />
                    <span>
                      Logistics Point:{" "}
                      {selectedOrder.shippingAddress || "Standard Protocol"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
                  Advance Stage
                </p>
                <button
                  onClick={() => updateStatus(selectedOrder._id, "processing")}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest border transition-all ${
                    selectedOrder.status === "processing"
                      ? "bg-white text-black border-white"
                      : "border-white/20 hover:border-white"
                  }`}
                >
                  Initialize Processing
                </button>
                <button
                  onClick={() => updateStatus(selectedOrder._id, "shipped")}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest border transition-all ${
                    selectedOrder.status === "shipped"
                      ? "bg-white text-black border-white"
                      : "border-white/20 hover:border-white"
                  }`}
                >
                  Dispatch Shipment
                </button>
                <button
                  onClick={() => updateStatus(selectedOrder._id, "completed")}
                  className={`w-full py-4 text-xs font-black uppercase tracking-widest border transition-all ${
                    selectedOrder.status === "completed"
                      ? "bg-white text-black border-white"
                      : "border-white/20 hover:border-white"
                  }`}
                >
                  Finalize Fulfillment
                </button>
              </div>

              <div className="pt-8 border-t border-white/10 text-center">
                <button className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  Abort Shipment
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-black/5 p-10 flex flex-col items-center justify-center text-center h-[400px]">
              <Clock size={32} className="text-gray-200 mb-6" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 max-w-[200px] leading-relaxed">
                Select a logistics node to visualize fulfillment vectors
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerOrders;
