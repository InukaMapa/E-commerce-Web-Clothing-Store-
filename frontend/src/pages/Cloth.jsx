import { useState, useEffect } from "react";
import {  Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentGender = searchParams.get("gender") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentSort = searchParams.get("sort") || "best_selling";
  const currentSize = searchParams.get("size") || "";
  const currentAvailability = searchParams.get("availability") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Local state for price inputs to prevent rapid fetches while typing
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync local input fields when URL search parameters change externally
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
  }, [currentMinPrice]);

  useEffect(() => {
    setMaxPriceInput(currentMaxPrice);
  }, [currentMaxPrice]);

  // Debounce price inputs to automatically trigger search param updates when typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (minPriceInput !== currentMinPrice) {
        handleFilterChange("minPrice", minPriceInput);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [minPriceInput, currentMinPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (maxPriceInput !== currentMaxPrice) {
        handleFilterChange("maxPrice", maxPriceInput);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [maxPriceInput, currentMaxPrice]);



  // ── Data Fetching ───────────────────────────────────────────────────────
  const fetchProducts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (currentGender !== "all") params.append("gender", currentGender);
        if (currentCategory !== "all") params.append("category", currentCategory);
        if (currentSort) params.append("sort", currentSort);
        if (currentSize) params.append("size", currentSize);
        if (currentAvailability) params.append("availability", currentAvailability);
        if (currentMinPrice) params.append("minPrice", currentMinPrice);
        if (currentMaxPrice) params.append("maxPrice", currentMaxPrice);
        
        const res = await api.get(`/api/products?${params.toString()}`);
        if (isMounted) {
          const fetchedProducts = res.data?.data?.products || [];
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error("Shop page fetch error:", err);
        if (isMounted) {
          setError("Failed to load products. Please check your connection and try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [currentGender, currentCategory, currentSort, currentSize, currentAvailability, currentMinPrice, currentMaxPrice, refreshTrigger]);

  const handleFilterChange = (key, value) => {
    if (!value || value === "all") {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const [openSections, setOpenSections] = useState({ size: true, availability: true, price: true });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sortOptions = [
    { label: "Best Selling", value: "best_selling" },
    { label: "Price: Low To High", value: "price_asc" },
    { label: "Price: High To Low", value: "price_desc" },
    { label: "Date: New To Old", value: "newest" },
  ];

  const currentSortLabel = sortOptions.find(o => o.value === currentSort)?.label || "Sort By";

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs and Page Title */}
        <div className="mb-10 text-left flex justify-between items-end">
          <div>
            <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
              <Link to="/" className="hover:text-black">Home</Link>
              <span>/</span>
              <span className="text-black">
                {currentCategory !== "all" ? currentCategory.toUpperCase() : currentGender === "all" ? "Shop All" : `${currentGender.toUpperCase()}'S WEAR`}
              </span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-serif font-black uppercase tracking-[0.1em] text-black">
              {currentCategory !== "all" ? currentCategory : currentGender === "all" ? "Our Collection" : `${currentGender}'s Wear`}
            </h1>
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <button className="border border-black px-6 py-3 text-[10px] uppercase font-black tracking-widest flex items-center justify-between w-48 hover:bg-black hover:text-white transition-all">
              <span>{currentSortLabel}</span>
              <svg className={`h-4 w-4 transition-transform group-hover:rotate-180`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-black z-30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange("sort", opt.value)}
                  className={`w-full text-left px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 border-b border-gray-100 last:border-0 ${currentSort === opt.value ? 'bg-gray-50' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gender Filter Tabs */}
        <div className="flex gap-8 mb-6 border-b border-gray-100 pb-2">
            {["all", "men", "women", "unisex"].map((g) => (
              <button
                key={g}
                onClick={() => handleFilterChange("gender", g)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] pb-3 transition-all relative ${
                  currentGender === g 
                    ? "text-black border-b-2 border-black" 
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {g === "all" ? "Shop All" : `${g}'s`}
              </button>
            ))}
        </div>

        {/* Product Category Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => handleFilterChange("category", "all")}
            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
              currentCategory === "all"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-200 hover:border-black"
            }`}
          >
            All
          </button>
          {["T-Shirt", "Shirt", "Hoodies", "Jeans", "Shoes", "Caps", "Backpacks", "Wallets", "Skirt", "Frocks"].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange("category", currentCategory === cat ? "all" : cat)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                currentCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-gray-200 hover:border-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-16">

          {/* Main Content Area */}
          <main className="flex-1">

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 uppercase tracking-widest text-xs">
                  No products found in this category.
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Recently Viewed Products */}
      <section className="bg-gray-50 py-20 mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-black">Recently Viewed Products</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-2">Combine Your Style With These Products</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={`${product._id}-recent`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-6 mt-20">
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
                  {['T-Shirt', 'Shirt', 'Hoodies', 'Jeans', 'Shoes', 'Caps', 'Backpacks', 'Wallets'].map(item => (
                    <li key={item}><a href={`/cloth?category=${item}`} className="hover:text-gray-400">{item}</a></li>
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
          <div className="flex justify-center space-x-6 mt-6">
            <a href="#" className="hover:opacity-60 transition-opacity">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="hover:opacity-60 transition-opacity">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="hover:opacity-60 transition-opacity">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
