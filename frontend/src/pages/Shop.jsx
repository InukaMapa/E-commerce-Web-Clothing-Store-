import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import hero from "../assets/hero.png";
import men from "../assets/men.png";
import women from "../assets/women.png";
import quote from "../assets/quote.png";
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
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      // For now, set recommended products as a slice of all products
      setRecommendedProducts(fetchedProducts.slice(0, 4));
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
      {/* Announcement Bar */}
      <div className="bg-black text-[10px] uppercase tracking-[0.2em] text-white py-2 px-4 text-center border-t border-white/10">
        Don't miss out on our exclusive special offer — Enjoy a massive 50% off on your favorite items! Hurry, this limited-time deal won't last long!
      </div>

      {/* Hero Section */}
      <header className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <img
          src={hero}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4] hero-zoom"
        />
        <div className="relative z-10 text-center text-white px-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] mb-4 opacity-80">Step into style — Find your perfect pair</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-widest leading-none mb-8">
            Trendy, <br /> Stylish, <br /> Brand New!
          </h1>
          <button className="bg-white text-black px-8 py-3 text-[14px] uppercase font-bold tracking-widest hover:bg-black hover:text-white transition-all duration-300">
            Shop Now
          </button>
        </div>
      </header>

      {/* Customization Banner */}
      <section className="bg-zinc-100 py-20 px-4 text-center">
        <div className="max-w-5xl mx-auto border border-black py-8">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-6">
            Customize Your Own T-Shirt
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Unleash your creativity and design a unique style that represents you. Our premium customization process ensures your vision comes to life with precision and quality.
          </p>
          <button
            onClick={() => navigate("/customization-info")}
            className="bg-black text-white px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-zinc-800 transition-colors duration-300"
          >
            Start Customizing
          </button>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-black">Recommended For You</h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Based on your shopping activity</p>
        </div>
        {recommendedProducts.length === 0 ? (
          <p className="text-gray-400">No recommendations yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Gender Categories */}
      <section className="grid grid-cols-1 md:grid-cols-2 h-[600px] w-full">
        <div className="relative group cursor-pointer overflow-hidden">
          <img
            src={men}
            alt="Shop Men"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75 category-zoom"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-4xl font-serif font-bold uppercase tracking-widest mb-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Shop Men</h2>
            <button className="bg-white text-black px-8 py-3 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
              View Products
            </button>
          </div>
        </div>
        <div className="relative group cursor-pointer overflow-hidden">
          <img
            src={women}
            alt="Shop Women"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75 category-zoom"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-4xl font-serif font-bold uppercase tracking-widest mb-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Shop Women</h2>
            <button className="bg-white text-black px-8 py-3 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
              View Products
            </button>
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black">Latest Arrivals</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">Discover Our Latest Arrivals And Timeless Classics.</p>
          </div>
          <button className="bg-black text-white px-6 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-800 transition-all">
            Shop All
          </button>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* T-Shirts Collection */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">T-Shirts Collection</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Discover Our T-Shirts Collection</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'T-Shirt', 'Shirt', 'Hoodies', 'Jeans', 'Pants', 'Shoes', 'Caps', 'Backpacks', 'Wallets'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-2 text-[10px] uppercase font-bold tracking-[0.2em] border transition-all ${filter === 'All' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button className="text-[10px] uppercase font-bold tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity">
            View All T-Shirts Collection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={`${product._id}-collection`} product={product} />
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative h-[400px] w-full flex items-center justify-center text-white overflow-hidden">
        <img
          src={quote}
          alt="Quote background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
        />
        <div className="relative z-10 max-w-4xl text-center px-4">
          <h2 className="text-2xl md:text-3xl font-sans font-bold uppercase tracking-[0.2em] leading-relaxed mb-6 italic">
            "Style is a way to say who you are without having to speak."
          </h2>
          <p className="text-xs uppercase tracking-[0.4em] opacity-80 text-m font-semibold italic">– Rachel Zoe</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-8 text-white/80">Information</h3>
                <ul className="space-y-4 text-[10px] uppercase tracking-widest font-medium">
                  {['FAQ', 'About Us', 'Privacy', 'Terms & Conditions', 'Delivery Details', 'Returns Policy', 'Locations', 'Promotions'].map(item => (
                    <li key={item}><a href="#" className="hover:text-gray-400">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-8 text-white/80">Account</h3>
                <ul className="space-y-4 text-[10px] uppercase tracking-widest font-medium">
                  {['My Account', 'Order History', 'Wishlist', 'Size Guides'].map(item => (
                    <li key={item}><a href="#" className="hover:text-gray-400">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-8 text-white/80">Categories</h3>
                <ul className="space-y-4 text-[10px] uppercase tracking-widest font-medium">
                  {['T-Shirt', 'Shirt', 'Hoodies', 'Jeans', 'Pants', 'Shoes', 'Caps', 'Backpacks', 'Wallets'].map(item => (
                    <li key={item}><a href="/cloth" className="hover:text-gray-400">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-4">Sign up for the FOA newsletter</h3>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-8">Be the first to know about our new collections and promotions.</p>
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="EMAIL"
                  className="flex-1 bg-transparent border-b border-white/20 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-white transition-colors"
                />
                <button className="bg-white text-black px-10 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-200 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white">© 2026 Slaughter All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
