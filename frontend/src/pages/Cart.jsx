import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { API_BASE_URL } from "../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

export default function Cart() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your bag is empty</h2>
        <Link to="/" className="mt-8 rounded-full bg-black px-8 py-3 text-xs font-bold text-white shadow-lg">View Collection</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-10">Shopping Bag ({items.length})</h1>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          <section className="lg:col-span-8">
            <ul className="divide-y divide-gray-100 border-t border-b border-gray-100">
              {items.map((item, idx) => (
                <li key={idx} className="flex py-8 sm:py-10">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-32 sm:w-32">
                    <img src={resolveImage(item.image)} alt={item.name} className="h-full w-full object-cover object-center" />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/products/${item.productId}`)}>{item.name}</h3>
                        <div className="mt-1 flex text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <p className="border-r border-gray-200 pr-3">Size: {item.variantName || item.variantSku}</p>
                          <p className="pl-3">Unit: Rs. {item.price?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between sm:mt-0 sm:block sm:text-right">
                        <p className="text-xs font-bold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="mt-1.5 flex items-center rounded-lg border border-gray-200 w-fit sm:ml-auto">
                          <button onClick={() => updateQty(item.productId, item.variantSku, item.quantity - 1)} className="p-1.5"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, item.variantSku, item.quantity + 1)} className="p-1.5"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.variantSku)} className="mt-4 text-xs font-bold text-black hover:text-red-500 flex items-center w-fit">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 rounded-3xl bg-gray-50 p-8 lg:col-span-4 lg:mt-0 shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-600"><span>Subtotal</span><span className="font-bold text-gray-900">Rs. {total.toFixed(2)}</span></div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-600"><span>Shipping</span><span className="font-bold text-gray-900">{total > 100 ? "FREE" : "Rs. 15.00"}</span></div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4"><span className="text-sm font-bold text-gray-900">Order Total</span><span className="text-sm font-bold text-gray-900">Rs. {(total > 100 ? total : total + 15).toFixed(2)}</span></div>
            </dl>
            <button onClick={handleCheckout} className="w-full mt-10 rounded-2xl bg-black px-4 py-4 text-xs font-bold text-white shadow-lg active:scale-[0.98] transition-transform">Proceed to Checkout</button>
          </section>
        </div>
      </div>
    </div>
  );
}
