import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { API_BASE_URL } from "../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/orders/my");
        if (res.data?.success) {
          setOrders(res.data.data.orders || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusSteps = (currentStatus) => {
      const steps = ['placed', 'processing', 'shipped', 'completed'];
      if (currentStatus === 'cancelled') return [];
      
      // paid is essentially placed/processing for tracking purposes
      let currentIndex = steps.indexOf(currentStatus);
      if (currentStatus === 'paid') currentIndex = 0; 

      return steps.map((step, idx) => ({
          label: step,
          completed: idx <= currentIndex,
          current: idx === currentIndex
      }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-black">My Orders</h1>
                <p className="mt-2 text-xs text-gray-500 uppercase tracking-widest font-bold">Track and manage your purchases</p>
            </div>
            <Link to="/profile" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-black border border-gray-200 hover:border-black px-4 py-2 rounded-lg transition-all">
                Back to Profile
            </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs rounded-xl font-bold border border-red-100">
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-2">No Orders Yet</h2>
            <p className="text-gray-500 text-sm mb-8">You haven't placed any orders yet. Start shopping to see them here.</p>
            <Link to="/cloth" className="inline-block bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order #{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-900 font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-sm font-black text-black">Rs. {order.totalAmount.toFixed(2)}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 lg:p-8">
                    {/* Order Tracking Timeline */}
                    {order.status !== 'cancelled' && (
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Delivery Status</h3>
                            <div className="relative">
                                {/* Track Line */}
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full hidden sm:block"></div>
                                
                                <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                                    {getStatusSteps(order.status).map((step, idx) => (
                                        <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                                                step.completed ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-300'
                                            } ${step.current ? 'ring-4 ring-gray-100' : ''}`}>
                                                {step.completed ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                step.completed ? 'text-black' : 'text-gray-400'
                                            }`}>{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">Items</h3>
                        <ul className="divide-y divide-gray-50">
                        {order.items.map((item, idx) => (
                            <li key={idx} className="py-4 flex items-center gap-6">
                            <img 
                                src={resolveImage(item.productId?.images?.[0]) || "/placeholder.jpg"} 
                                alt="" 
                                className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100"
                            />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-900">{item.productId?.name || "Product"}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Size: {item.variantName || item.variantSku} | Qty: {item.quantity}</p>
                            </div>
                            <p className="text-xs font-black text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                        </ul>
                    </div>

                    {/* Shipping Details */}
                    {order.shippingAddress && (
                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shipping Address</h3>
                                <div className="text-xs text-gray-600 space-y-1 font-medium">
                                    <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city} {order.shippingAddress.zip}</p>
                                    <p className="pt-2">Tel: {order.shippingAddress.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Payment Method</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{order.paymentMethod || 'Card'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
