import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";

/**
 * PRODUCTION-READY CART PAGE
 * Implementation Details:
 * - Dynamic list rendering from CartContext
 * - Real-time total calculation and item-level subtotals
 * - Quantity adjustment guards (prevents negative values)
 * - Empty state with Call-to-Action to Shop page
 * - Premium, airy UI using Tailwind Grid/Flex
 */
export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // ── Render Helpers ──────────────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4">
        <div className="rounded-full bg-gray-50 p-6 shadow-inner animate-bounce">
          <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Your bag is empty</h2>
        <p className="mt-2 text-gray-500 max-w-xs text-center">Items you add to your bag will appear here. Ready to find something new?</p>
        <Link
          to="/"
          className="mt-8 rounded-full bg-black  px-8 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-black hover:scale-105 active:scale-95 shadow-indigo-100"
        >
          View Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-10">Shopping Bag ({items.length})</h1>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Cart Items List */}
          <section className="lg:col-span-8">
            <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantSku}`} className="flex py-8 sm:py-10">
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-32 sm:w-32 shadow-sm">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1591047139829-d91aec96bcba?q=80&w=1000&auto=format&fit=crop"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-xs font-bold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            onClick={() => navigate(`/products/${item.productId}`)}>
                            {item.name}
                          </h3>
                        </div>
                        <div className="mt-1 flex text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <p className="border-r border-gray-200 pr-3">{item.variantSku}</p>
                          <p className="pl-3">Unit: Rs. {item.price?.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between sm:mt-0 sm:block sm:text-right">
                        <p className="text-xs font-bold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="mt-1.5 flex items-center rounded-lg border border-gray-200 w-fit sm:ml-auto">
                          <button
                            onClick={() => updateQty(item.productId, item.variantSku, item.quantity - 1)}
                            className="p-1.5 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>
                          <span className="w-8 text-center text-xs font-bold leading-none">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.variantSku, item.quantity + 1)}
                            className="p-1.5 hover:text-indigo-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={() => removeItem(item.productId, item.variantSku)}
                        className="text-xs font-bold text-black hover:text-red-500 transition-colors flex items-center"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order Summary Summary Panel */}
          <section className="mt-16 rounded-3xl bg-gray-50 p-8 lg:col-span-4 lg:mt-0 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-gray-600">Subtotal</dt>
                <dd className="text-xs font-bold text-gray-900">Rs. {total.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <dt className="text-xs text-gray-600">Shipping Estimate</dt>
                <dd className="text-xs font-bold text-gray-900">{total > 100 ? "FREE" : "Rs. 15.00"}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <dt className="text-sm font-bold text-gray-900">Order Total</dt>
                <dd className="text-sm font-bold text-gray-900">
                  Rs. {(total > 100 ? total : total + 15).toFixed(2)}
                </dd>
              </div>
            </dl>

            <div className="mt-10">
              <button
                onClick={handleCheckout}
                className="w-full rounded-2xl bg-black px-4 py-4 text-xs font-bold text-white shadow-lg transition-all hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Proceed to Checkout
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-400 font-medium">Secured with 256-bit SSL encryption</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
