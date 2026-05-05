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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const recommendedProducts = products.slice(0, 4);

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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
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
        Don’t miss out on our exclusive special offer — enjoy 40% OFF!
      </div>

      {/* Hero */}
      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src={hero}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        />

        <div className="relative text-center text-white">
          <p className="text-sm uppercase tracking-widest">
            Step Into Style — Find Your Perfect Pair
          </p>
          <h1 className="text-6xl font-bold uppercase tracking-widest mt-4">
            Trendy <br /> Stylish <br /> Brand New
          </h1>

          <button className="mt-6 bg-white text-black px-8 py-3 text-sm uppercase font-bold tracking-widest hover:bg-black hover:text-white transition">
            Shop Now
          </button>
        </div>
      </header>

      {/* Customization Banner */}
      <section className="bg-zinc-100 py-20 px-4 text-center">
        <div className="max-w-5xl mx-auto border border-black py-8 px-6">
          <h2 className="text-3xl font-bold uppercase tracking-widest mb-6">
            Customize Your Own T-Shirt
          </h2>

          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Unleash your creativity and design a unique style that represents you.
          </p>

          <button
            onClick={() => navigate("/customization-info")}
            className="bg-black text-white px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-zinc-800 transition"
          >
            Start Customizing
          </button>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold uppercase tracking-widest mb-8">
          Recommended For You
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="grid md:grid-cols-2 h-[600px]">
        <div className="relative overflow-hidden group">
          <img
            src={men}
            alt="Men"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-medium bg-black/20">
            Shop Men
          </div>
        </div>

        <div className="relative overflow-hidden group">
          <img
            src={women}
            alt="Women"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-medium bg-black/20">
            Shop Women
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold uppercase tracking-widest mb-8">
          Latest Arrivals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Quote Banner */}
      <section className="relative h-[400px] flex items-center justify-center text-white overflow-hidden">
        <img
          src={quote}
          alt="Quote Background"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.3]"
        />

        <div className="relative text-center max-w-3xl px-4">
          <h2 className="text-3xl font-semibold italic">
            "Style is a way to say who you are without having to speak."
          </h2>
          <h4 className="mt-4 text-lg italic">– Rachel Zoe</h4>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-xs uppercase font-bold tracking-[0.3em] mb-4">
            Sign up for the newsletter
          </h3>

          <p className="text-xs uppercase tracking-widest text-gray-400 mb-8">
            Be the first to know about new collections and promotions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
            <input
              type="email"
              placeholder="EMAIL"
              className="flex-1 bg-transparent border-b border-white/20 py-3 px-2 text-xs uppercase tracking-widest outline-none focus:border-white"
            />

            <button className="bg-white text-black px-10 py-3 text-xs uppercase font-bold tracking-widest hover:bg-gray-200 transition">
              Subscribe
            </button>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6">
            <p className="text-xs uppercase tracking-[0.3em]">
              © 2026 Slaughter All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}