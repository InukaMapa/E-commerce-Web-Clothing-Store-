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

  /* Base nav link style — white always, underline animation on hover/active */
  const linkClass = (path) =>
    `relative group text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-200
     ${isActive(path) ? "text-white" : "text-white/60 hover:text-white"}`;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/cloth?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a] text-white border-b border-white/8">
      <div className="w-full px-8">
        <div className="flex items-center h-[100px]">

          {/* ── LEFT: Nav Links ── */}
          <div className="flex items-center gap-7 flex-1">

            {/* Home */}
            <Link to="/" className={linkClass("/")}>
              <span className="relative">
                Home
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${isActive("/") ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
            </Link>

            {/* Shop */}
            <Link to="/cloth" className={linkClass("/cloth")}>
              <span className="relative">
                Shop
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${isActive("/cloth") ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
            </Link>

            {/* Studio — with NEW pill badge */}
            <Link
              to="/customization-info"
              className={`relative group flex items-center gap-[5px] transition-colors duration-200
                ${studioActive ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] relative">
                Studio
                <span className={`absolute -bottom-0.5 left-0 h-[1px] bg-white transition-all duration-300
                  ${studioActive ? "w-full" : "w-0 group-hover:w-full"}`} />
              </span>
              {/* NEW badge — olive pill matching reference image */}
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

            {/* Horizontal line → center logo */}
            <div className="flex-1 h-px bg-gradient-to-r from-white/5 to-white/20 ml-2" />
          </div>

          {/* ── CENTER: Logo ── */}
          <div className="flex flex-col items-center justify-center px-10 flex-shrink-0">
            <Link to="/" className="flex flex-col items-center group">
              <img
                src={logo}
                alt="Slaughter"
                className="h-14 w-auto object-contain brightness-90 group-hover:brightness-100 transition-all duration-300"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.65em] text-gray-400 group-hover:text-white transition-colors duration-300 mt-1.5">
                Slaughter
              </span>
            </Link>
          </div>

          {/* ── RIGHT: Search + Icons ── */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Horizontal line ← center logo */}
            <div className="flex-1 h-px bg-gradient-to-l from-white/5 to-white/20 mr-2" />

            {/* Search box — matches image style */}
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="flex items-center border border-white/20 bg-transparent rounded-none px-3 py-[9px] w-52 gap-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="search..."
                  className="bg-transparent text-[12px] text-gray-300 placeholder-gray-500 outline-none w-full tracking-wider"
                />
                <button
                  type="submit"
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Cart — always show count badge (shows 0 when empty) */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-[21px] w-[21px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
