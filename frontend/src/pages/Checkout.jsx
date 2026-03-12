import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [savedSummary, setSavedSummary] = useState(null);

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [items, orderId, navigate]);

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const summary = { items: [...items], total };
      
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantSku: i.variantSku,
          quantity: i.quantity,
        })),
      };

      const res = await api.post("/api/orders/checkout", payload);

      if (res.data?.success) {
        setSavedSummary(summary);
        setOrderId(res.data.data.order._id);
        clear();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Checkout failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnAction = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'producer') navigate('/producer/dashboard');
    else navigate('/');
  };

  if (orderId && savedSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 flex flex-col">
          <div className="bg-black text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest">Order Success</h1>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">Order ID: {orderId}</p>
          </div>

          <div className="p-8 flex-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 pb-2 border-b">Purchase Summary</h2>
            <ul className="space-y-4">
              {savedSummary.items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <img src={resolveImage(item.image)} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Size: {item.variantName || item.variantSku} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900 text-right">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-8 border-t border-dashed border-gray-200 space-y-3 text-xs">
              <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                <span>Subtotal</span>
                <span>Rs. {savedSummary.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                <span>Shipping</span>
                <span className="text-green-600">{savedSummary.total > 100 ? 'FREE' : 'Rs. 15.00'}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black uppercase tracking-widest">Total Paid</span>
                <span className="text-xl font-black">Rs. {(savedSummary.total > 100 ? savedSummary.total : savedSummary.total + 15).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col space-y-4">
            <button onClick={handleReturnAction} className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform">
              {user?.role === 'customer' || !user ? 'Return to Shop' : 'Return to Dashboard'}
            </button>
            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">A confirmation email has been sent to you.</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <div className="h-screen flex items-center justify-center">Redirecting...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 shadow-inner">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 group">
            Checkout 
            <span className="block w-8 h-1 bg-black mx-auto mt-2 transition-all group-hover:w-16"></span>
          </h1>
          <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Payment Processing</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 animate-shake">
            Error: {error}
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100">
          <div className="p-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 pb-2 border-b">Review Your Order</h2>
            <ul className="divide-y divide-gray-50">
              {items.map((item, idx) => (
                <li key={idx} className="flex py-6 justify-between items-center group">
                  <div className="flex items-center space-x-5">
                    <img src={resolveImage(item.image)} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tighter">Size: {item.variantName || item.variantSku} — Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-10 border-t border-gray-100 space-y-4">
               <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount Due</span>
                <span className="text-3xl font-black tracking-tighter text-black">Rs. {(total > 100 ? total : total + 15).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleSubmitOrder} 
              disabled={loading} 
              className={`w-full mt-12 bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-y-1 transition-all active:scale-[0.98] ${loading ? "opacity-50" : ""}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : "Confirm & Pay Now"}
            </button>
            
            <div className="mt-8 flex items-center justify-center space-x-4 opacity-20 grayscale">
               <div className="w-10 h-6 bg-gray-400 rounded"></div>
               <div className="w-10 h-6 bg-gray-400 rounded"></div>
               <div className="w-10 h-6 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
