import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../cart/CartContext";

/**
 * PRODUCTION-READY PRODUCT DETAILS PAGE
 * Feature Set:
 * - Dynamic data fetching by URL ID
 * - Complex variant management (Stock vs. Selection)
 * - Quantity logic with hard limits based on inventory
 * - Multi-image gallery support
 * - Add-to-Cart integration with validation
 */
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/products/${id}`);
        const data = res.data?.data?.product;
        
        if (!data) throw new Error("Product data is missing");
        
        setProduct(data);
        // Pre-select first variant if available and in stock
        if (data.variants?.length > 0) {
          const firstInStock = data.variants.find(v => v.stock > 0);
          setSelectedVariant(firstInStock || data.variants[0]);
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        setError(err.response?.data?.message || "Product not found or currently unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    setAdding(true);
    setSuccessMsg("");

    // Cart schema: { productId, name, image, variantSku, price, quantity }
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      variantSku: selectedVariant.sku,
      price: product.price,
      quantity,
    });

    // Feedback loop
    setTimeout(() => {
      setAdding(false);
      setSuccessMsg("Added to bag!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  const adjustQty = (delta) => {
    const max = selectedVariant?.stock || 1;
    setQuantity(prev => {
      const next = prev + delta;
      return next >= 1 && next <= max ? next : prev;
    });
  };

  // ── Render Helpers ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error loading product</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button onClick={() => navigate("/")} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
          
          {/* Image Gallery */}
          <div className="flex flex-col-reverse">
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none ring-2 ring-offset-2 ${activeImage === idx ? 'ring-indigo-500' : 'ring-transparent'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover object-center rounded-md" />
                  </button>
                ))}
              </div>
            </div>

            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <img
                src={product.images?.[activeImage] || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop"}
                className="h-full w-full object-cover object-center"
                alt={product.name}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900 font-bold">${product.price?.toFixed(2)}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6 text-base text-gray-700 leading-relaxed min-h-[100px]">
                {product.description}
              </div>
            </div>

            <div className="mt-10">
              {/* Variant Selectors */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Options</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.variants?.map((v) => (
                      <button
                        key={v.sku}
                        disabled={v.stock === 0}
                        onClick={() => {
                          setSelectedVariant(v);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2 border rounded-full text-xs font-bold transition-all ${
                          selectedVariant?.sku === v.sku
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : v.stock === 0
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {v.size} - {v.color} {v.stock === 0 && '(Out of stock)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Quantity</h3>
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button onClick={() => adjustQty(-1)} className="p-2 hover:text-indigo-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => adjustQty(1)} className="p-2 hover:text-indigo-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-xs text-gray-400 font-medium">{selectedVariant.stock} units available</span>
                  )}
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="mt-10 flex flex-col space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0 || adding}
                  className={`flex w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    (!selectedVariant || selectedVariant.stock === 0 || adding) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'
                  }`}
                >
                  {adding ? 'Processing...' : (selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag')}
                </button>
                
                {successMsg && (
                  <p className="text-center text-sm font-bold text-green-600 animate-bounce">{successMsg}</p>
                )}
              </div>
            </div>

            {/* Product Meta */}
            <div className="mt-12 border-t border-gray-100 pt-8">
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Free shipping on orders over $100</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <span>In-stock items ship within 24 hours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
