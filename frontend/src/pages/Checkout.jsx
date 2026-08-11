import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;

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

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Card");
  
  // Dummy Card State (for visuals)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: ""
  });

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }
  }, [items, orderId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    // Basic validation
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
        setError("Please fill in all required shipping fields.");
        return;
    }

    if (paymentMethod === "Card") {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
            setError("Please fill in all card details.");
            return;
        }
    }

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
        shippingAddress,
        paymentMethod
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
    else navigate('/orders');
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
                <span className="text-green-600">{savedSummary.total > 5000 ? 'FREE' : 'Rs. 300.00'}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black uppercase tracking-widest">Total Paid</span>
                <span className="text-xl font-black">Rs. {(savedSummary.total > 5000 ? savedSummary.total : savedSummary.total + 300).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col space-y-4">
            <button onClick={handleReturnAction} className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform">
              {user?.role === 'customer' || !user ? 'Track Orders' : 'Return to Dashboard'}
            </button>
            <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">A confirmation email has been sent to you.</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return <div className="h-screen flex items-center justify-center">Redirecting...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 group">
            Checkout 
            <span className="block w-8 h-1 bg-black mx-auto mt-2 transition-all group-hover:w-16"></span>
          </h1>
          <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Complete Your Order</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 animate-shake text-center max-w-2xl mx-auto">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Left Column - Forms */}
            <div className="lg:col-span-7 space-y-8">
                
                {/* Shipping Details */}
                <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 pb-4 border-b border-gray-100">1. Shipping Details</h2>
                    <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name *</label>
                            <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} required className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="John Doe" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Street Address *</label>
                            <input type="text" name="address" value={shippingAddress.address} onChange={handleInputChange} required className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="123 Main St, Apt 4B" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">City *</label>
                            <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} required className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="Colombo" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">ZIP / Postal Code</label>
                            <input type="text" name="zip" value={shippingAddress.zip} onChange={handleInputChange} className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="00100" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number *</label>
                            <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleInputChange} required className="block w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="+94 77 123 4567" />
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl p-8 border border-gray-100">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 pb-4 border-b border-gray-100">2. Payment Method</h2>
                    
                    <div className="space-y-4">
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="h-4 w-4 text-black focus:ring-black border-gray-300" />
                            <span className="ml-3 text-sm font-bold text-gray-900">Credit / Debit Card</span>
                            <div className="ml-auto flex space-x-2 grayscale opacity-50">
                                <div className="w-8 h-5 bg-gray-300 rounded-sm"></div>
                                <div className="w-8 h-5 bg-gray-300 rounded-sm"></div>
                            </div>
                        </label>

                        {paymentMethod === 'Card' && (
                            <div className="pl-7 pr-4 py-4 space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Card Number</label>
                                    <input type="text" value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Expiry Date</label>
                                        <input type="text" value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="MM/YY" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">CVV</label>
                                        <input type="text" value={cardDetails.cvv} onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})} className="block w-full rounded-xl border-gray-200 bg-white px-4 py-3 text-sm focus:border-black focus:ring-black transition-colors" placeholder="123" />
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-2 flex items-center"><svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Secure encrypted payment</p>
                            </div>
                        )}

                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="h-4 w-4 text-black focus:ring-black border-gray-300" />
                            <span className="ml-3 text-sm font-bold text-gray-900">Cash on Delivery</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
                <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 sticky top-8">
                <div className="p-8 lg:p-10">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 pb-2 border-b">Review Your Order</h2>
                    <ul className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex py-6 justify-between items-center group">
                        <div className="flex items-center space-x-5">
                            <img src={resolveImage(item.image)} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform bg-gray-50" />
                            <div>
                            <p className="text-xs font-bold text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tighter">Size: {item.variantName || item.variantSku} — Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="text-xs font-black text-gray-900 whitespace-nowrap">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        </li>
                    ))}
                    </ul>

                    <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-gray-900">Rs. {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Shipping</span>
                            <span className="text-green-600">{total > 5000 ? 'FREE' : 'Rs. 300.00'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Due</span>
                            <span className="text-3xl font-black tracking-tighter text-black">Rs. {(total > 5000 ? total : total + 300).toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                    type="submit"
                    disabled={loading} 
                    className={`w-full mt-10 bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-y-1 transition-all active:scale-[0.98] ${loading ? "opacity-50" : ""}`}
                    >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-3">
                        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                        </div>
                    ) : "Place Order"}
                    </button>
                    
                    <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                        By placing your order, you agree to our Terms & Conditions.
                    </p>
                </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}
