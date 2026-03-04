import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

/**
 * PRODUCTION-READY SHOP PAGE
 * Implementation Details:
 * - Robust state management for async data (loading, error, success)
 * - Defensive mapping for API response shape { data: { products: [] } }
 * - Modern, responsive CSS-Grid with Tailwind
 * - Polished UI states for empty catalogs or fetching failures
 * - Hover effects & high-quality card layouts
 */
export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Optional: Search/Filter state to enhance UX
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();

  // ── Data Fetching ───────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Backend controller returns: { success, message, data: { products, pagination } }
      const res = await api.get("/api/products");
      const fetchedProducts = res.data?.data?.products || [];
      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Shop page fetch error:", err);
      setError("Failed to load products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products locally for instant UX (can be offloaded to API for scale)
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render Helpers ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm"></div>
          <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Curating our collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 max-w-sm text-gray-600">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Hero Section */}
      <header className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Latest Collection
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Elevate your wardrobe with our meticulously crafted premium clothing.
          </p>
          
          {/* Quick Search */}
          <div className="mt-8 mx-auto max-w-md relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm outline-none"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer / Newsletter Placeholder */}
      <section className="bg-indigo-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl font-bold">Stay in Style</h2>
          <p className="mt-2 text-indigo-200">Get early access to drops and exclusive offers.</p>
          <div className="mt-8 mx-auto flex max-w-xs space-x-2">
            <input type="email" placeholder="Email" className="flex-1 rounded-md px-3 py-2 text-sm text-gray-900 outline-none" />
            <button className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-bold shadow-sm transition-colors hover:bg-indigo-400">Join</button>
          </div>
        </div>
      </section>
    </div>
  );
}
