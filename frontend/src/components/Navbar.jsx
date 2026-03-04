import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const cartCount = items.reduce((sum, x) => sum + x.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">SL</div>
            <span className="font-black text-gray-900 tracking-tight">Slaughter</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Shop</Link>
            {user && ["producer", "admin"].includes(user.role) && (
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
            )}

            {/* Cart */}
            <button onClick={() => navigate("/cart")} className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-indigo-600 text-[10px] font-black text-white flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-gray-500 capitalize">{user.role}</span>
                <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors">Sign out</button>
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
