import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import hero from "../assets/hero.png";
import men from "../assets/men.png";
import women from "../assets/women.png";
import quote from "../assets/quote.png";

export default function Shop() {

  const [products, setProducts] = useState([]);
  const [recommendedIds, setRecommendedIds] = useState([]); // ⭐ recommended product IDs

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // Fetch Products
  // ─────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

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

  // ─────────────────────────────────────────────
  // Fetch Recommendations
  // ─────────────────────────────────────────────
  const fetchRecommendations = async () => {
    try {

      const userId = "U1"; // temporary user for testing

      const res = await api.get(`/api/recommendations/${userId}`);

      setRecommendedIds(res.data.recommendedProducts || []);

    } catch (err) {

      console.error("Recommendation fetch error:", err);

    }
  };

  // ─────────────────────────────────────────────
  // Load Data
  // ─────────────────────────────────────────────
  useEffect(() => {

    fetchProducts();
    fetchRecommendations();

  }, []);

  // ─────────────────────────────────────────────
  // Filter Products
  // ─────────────────────────────────────────────
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────
  // Convert Recommendation IDs → Product Objects
  // ─────────────────────────────────────────────
  const recommendedProducts = products.filter(product =>
    recommendedIds.includes(product._id)
  );

  // ─────────────────────────────────────────────
  // Loading State
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Curating our collection...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Error State
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error}</p>

        <button
          onClick={fetchProducts}
          className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-white">

      {/* Announcement */}
      <div className="bg-black text-white text-xs text-center py-2 uppercase tracking-widest">
        Don't miss our exclusive 50% sale!
      </div>

      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center">

        <img
          src={hero}
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />

        <div className="relative text-center text-white">

          <h1 className="text-6xl font-bold uppercase tracking-widest">
            Trendy <br /> Stylish <br /> Brand New
          </h1>

        </div>

      </header>

      {/* ⭐ Recommended Products */}
      <section className="mx-auto max-w-7xl px-4 py-20">

        <div className="mb-10">

          <h2 className="text-3xl font-bold uppercase tracking-widest">
            Recommended For You
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Based on your shopping activity
          </p>

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

      {/* Latest Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-20">

        <div className="mb-10">

          <h2 className="text-3xl font-bold uppercase tracking-widest">
            Latest Arrivals
          </h2>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {filteredProducts.slice(0, 4).map((product) => (

            <ProductCard key={product._id} product={product} />

          ))}

        </div>

      </section>

      {/* Categories */}
      <section className="grid md:grid-cols-2 h-[500px]">

        <div className="relative">

          <img
            src={men}
            alt="men"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
            Shop Men
          </div>

        </div>

        <div className="relative">

          <img
            src={women}
            alt="women"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
            Shop Women
          </div>

        </div>

      </section>

      {/* Quote Section */}
      <section className="relative h-[350px] flex items-center justify-center text-white">

        <img
          src={quote}
          alt="quote"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />

        <div className="relative text-center max-w-xl">

          <h2 className="text-2xl font-semibold italic">
            "Style is a way to say who you are without having to speak."
          </h2>

        </div>

      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 text-center">

        <p className="uppercase text-xs tracking-widest">
          © 2026 Slaughter. All rights reserved
        </p>

      </footer>

    </div>
  );
}