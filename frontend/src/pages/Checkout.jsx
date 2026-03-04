import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../cart/CartContext";

/**
 * PRODUCTION-READY CHECKOUT PAGE
 * Key Implementation:
 * - Atomic order submission to POST /api/orders/checkout
 * - Intelligent cart clearing on success
 * - Safety redirect if users land on checkout with an empty bag
 * - Polished success/error state UI with auto-redirect
 * - Responsive order summary visualization
 */
export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Safety: Redirect if cart is empty (unless we just placed an order)
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

      // Backend expects: items: [{productId, variantSku, quantity}]
      // Prices are re-fetched server-side for security
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantSku: i.variantSku,
          quantity: i.quantity,
        })),
      };

      const res = await api.post("/api/orders/checkout", payload);

      if (res.data?.success) {
        setOrderId(res.data.data.order._id);
        clear(); // Wipe cart context & localStorage
        
        // Redirect home after a 2.5s delay
        setTimeout(() => {
          navigate("/");
        }, 2500);
      }
    } catch (err) {
      console.error("Checkout submission failed:", err);
      const msg = err.response?.data?.message || "Failed to process your order. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render States ──────────────────────────────────────────────────────

  // 1. Success State
  if (orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="mb-6 rounded-full bg-green-100 p-4 animate-bounce shadow-sm">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Order Confirmed!</h1>
        <p className="mt-2 text-gray-500 font-medium">Thank you for choosing Slaughter.</p>
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Order ID</p>
          <p className="text-sm font-mono font-bold text-gray-900">{orderId}</p>
        </div>
        <p className="mt-10 text-xs text-gray-400 font-medium">Redirecting you to the shop in a moment...</p>
      </div>
    );
  }

  // 2. Empty Cart Error State
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900">Your bag is empty</h2>
        <p className="mt-2 text-gray-500">Redirecting to shop...</p>
        <Link to="/" className="mt-6 text-indigo-600 font-bold hover:underline">Return manually</Link>
      </div>
    );
  }

  // 3. Main Checkout UI
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Finalize Order</h1>
          <p className="mt-2 text-sm text-gray-500">Confirm your items and proceed to fulfillment.</p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-4 shadow-sm">
            <div className="flex items-center">
               <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
          {/* Order Summary Table */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Review Bag</h2>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantSku}`} className="flex py-6 justify-between items-center">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover border border-gray-200" />
                    <div className="ml-4">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.variantSku} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-gray-100 pt-8 space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <p>Bag Subtotal</p>
                <p className="font-bold">${total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <p>Shipping</p>
                <p className="font-bold text-green-600">{total > 100 ? 'FREE' : '$15.00'}</p>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                <p className="text-xl font-black text-gray-900 leading-none">Total Due</p>
                <p className="text-2xl font-black text-indigo-600">
                  ${(total > 100 ? total : total + 15).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 border-t border-gray-100">
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className={`flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                loading ? "opacity-70 cursor-not-allowed" : "shadow-lg shadow-indigo-100"
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Complete Purchase"
              )}
            </button>
            <p className="mt-4 text-center text-xs text-gray-400 font-medium">By completing your order, you agree to our Terms of Use.</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center items-center space-x-6 text-gray-400 grayscale opacity-50">
           <svg className="h-6" viewBox="0 0 38 24" fill="currentColor"><path d="M12 24c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm14-12c0-3.132 1.055-6.012 2.825-8.318-2.204-1.077-4.665-1.682-7.225-1.682-1.556 0-3.052.221-4.471.632 2.665 1.776 4.471 4.793 4.471 8.368 0 3.575-1.806 6.592-4.471 8.368 1.419.411 2.915.632 4.471.632 2.56 0 5.021-.605 7.225-1.682-1.77 2.306-2.825 5.186-2.825 8.318z"/></svg>
           <svg className="h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 2l-6.5 6s4 6.5 4 6.5l2.5-2.5 4 4.5h6l-10-14.5zm-5 13.5l1.5 1.5-1.5 1.5-1.5-1.5 1.5-1.5z"/></svg>
           <span className="text-[10px] uppercase font-black tracking-tighter">Secure Checkout</span>
        </div>
      </div>
    </div>
  );
}
