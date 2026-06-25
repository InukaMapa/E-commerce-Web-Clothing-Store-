import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import logo from "../assets/logo.png";
import { useState } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const cartCount = items.reduce((sum, x) => sum + x.quantity, 0);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const studioActive = isActive("/customization-info") || isActive("/customize-canvas");

  const linkClass = (path) =>
    `relative group text-[11px] font-bold uppercase tracking-[0.28em] transition-colors duration-200
     ${isActive(path) ? "text-white" : "text-white/55 hover:text-white"}`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/cloth?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a] text-white">

      {/* ── TIER 1: Logo centered with bolder decorative lines ── */}
      <div className="w-full px-8 flex items-center h-[80px]">
        {/* Left bold line */}
        <div className="flex-1 h-[2px] bg-white" />

        {/* Logo — centered */}
        <Link to="/" className="flex flex-col items-center group px-8 flex-shrink-0">
          <img
            src={logo}
            alt="Slaughter"
            className="h-16 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all duration-300"
          />
        </Link>

        {/* Right bold line */}
        <div className="flex-1 h-[2px] bg-white" />
      </div>

      {/* ── TIER 2: Nav links row ── */}
      <div className="w-full px-8">
        <div className="flex items-center h-[44px]">

          {/* LEFT: Nav Links */}
          <div className="flex items-center gap-8 flex-1">

            <Link to="/" className={linkClass("/")}>
              <span className="relative">
                Home
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${isActive("/") ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
            </Link>

            <Link to="/cloth" className={linkClass("/cloth")}>
              <span className="relative">
                Shop
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${isActive("/cloth") ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
            </Link>

            {/* Studio with NEW badge */}
            <Link
              to="/customization-info"
              className={`relative group flex items-center gap-[5px] transition-colors duration-200
                ${studioActive ? "text-white" : "text-white/55 hover:text-white"}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] relative">
                Studio
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${studioActive ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
              <span
                className="inline-flex items-center justify-center rounded-full select-none"
                style={{
                  background: "#3d4a1a",
                  color: "#b8cc5a",
                  fontSize: "7px",
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  padding: "2px 6px",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  border: "1px solid #5a6e22",
                }}
              >
                New
              </span>
            </Link>

            {/* Dashboard — admin/producer only */}
            {user && ["producer", "admin"].includes(user.role) && (
              <Link to="/dashboard" className={linkClass("/dashboard")}>
                <span className="relative">
                  Dashboard
                  <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                    ${isActive("/dashboard") ? "w-full" : "w-0 group-hover:w-full"}`} />
                </span>
              </Link>
            )}
          </div>

          {/* RIGHT: Search + Icons */}
          <div className="flex items-center gap-4">

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="flex items-center border border-white/20 bg-transparent px-3 py-[6px] w-48 gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="search..."
                  className="bg-transparent text-[11px] text-gray-300 placeholder-gray-500 outline-none w-full tracking-wider"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Profile icon */}
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                title="My Profile"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            ) : (
              <Link
                to="/login"
                title="Sign In"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 w-[15px] h-[15px] rounded-full bg-white text-black text-[8px] font-black flex items-center justify-center leading-none">
                {cartCount}
              </span>
            </button>
          </div>

        </div>
      </div>

    </nav>
  );
}
