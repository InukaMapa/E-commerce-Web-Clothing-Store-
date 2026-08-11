import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Palette,
  LogOut,
  LayoutDashboard,
  Bell,
  Eye,
  Truck,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Suppliers", path: "/admin/suppliers", icon: Truck },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Slaughter Studio", path: "/admin/settings", icon: Palette },
    { name: "View as User", path: "/", icon: Eye },
  ];

  const links = isAdmin ? adminLinks : [];

  return (
    <div className="w-64 bg-black text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 border-b border-white/10">
        <h1 className="text-xl font-serif font-bold tracking-widest uppercase">
          E-Store Admin
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
          {user?.name}
        </p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center space-x-4 px-4 py-3 rounded-none transition-all duration-200
              ${
                isActive
                  ? "bg-white text-black font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }
            `}
          >
            <link.icon size={18} />
            <span className="text-xs uppercase font-bold tracking-widest">
              {link.name}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center space-x-4 text-gray-400 hover:text-white transition-colors w-full uppercase text-xs font-bold tracking-widest"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
