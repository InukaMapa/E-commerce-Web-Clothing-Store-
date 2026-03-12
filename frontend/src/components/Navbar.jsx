import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import logo from "../assets/logo.png";


export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((sum, x) => sum + x.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-black text-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={logo}
              alt="Slaughter Logo"
              className="h-[80px] w-25 object-contain"
            />

          </Link>
          {/* Nav links and Icons */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xs font-medium hover:opacity-70 transition-opacity uppercase tracking-widest">Home</Link>

            {user && ["producer", "admin"].includes(user.role) && (
              <Link to="/dashboard" className="text-xs font-medium hover:opacity-70 transition-opacity uppercase tracking-widest">Dashboard</Link>
            )}

            <div className="flex items-center space-x-5">
              {/* User / Auth */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400">{user.role}</span>
                  <button onClick={() => navigate("/dashboard")} className="hover:opacity-70 transition-opacity">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button onClick={logout} className="text-[10px] uppercase tracking-widest font-bold border border-white/20 px-2 py-1 rounded hover:bg-white hover:text-black transition-all">Sign out</button>
                </div>
              ) : (
                <Link to="/login" className="hover:opacity-70 transition-opacity">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => navigate("/cart")} className="relative hover:opacity-70 transition-opacity">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 text-[10px] font-bold">
                    ({cartCount})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
