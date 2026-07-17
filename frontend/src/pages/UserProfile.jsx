import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Banner */}
      <div className="bg-black text-white py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-8">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center text-3xl font-black shadow-2xl flex-shrink-0 border-4 border-white/20">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mb-2 font-bold">My Account</p>
            <h1 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-widest">
              {user?.name || "Welcome Back"}
            </h1>
            <p className="text-gray-400 text-sm mt-1 tracking-wider">{user?.email}</p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 text-gray-300">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Account Info Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Account Information</h2>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="px-8 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-black">{user?.name || "—"}</p>
                  </div>
                </div>
                <div className="px-8 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Email Address</p>
                    <p className="text-sm font-semibold text-black">{user?.email}</p>
                  </div>
                </div>
                <div className="px-8 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Account Role</p>
                    <p className="text-sm font-semibold text-black capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/cloth")}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Shop</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Browse products</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">My Cart</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">View items</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">My Orders</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Track status</p>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/customization-info")}
                  className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">Studio</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Design your piece</p>
                  </div>
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-3 px-5 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all text-left group"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black">Dashboard</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Admin panel</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Sign Out Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Session</h3>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-300"></div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-gray-600">Active Session</span>
              </div>
              {!confirmLogout ? (
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="w-full py-3 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-500 text-center mb-3 font-medium">Are you sure?</p>
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all"
                  >
                    Yes, Sign Out
                  </button>
                  <button
                    onClick={() => setConfirmLogout(false)}
                    className="w-full py-3 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div className="bg-black text-white rounded-2xl p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">Member Since</p>
              <p className="text-xl font-serif font-black">
                {user?.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : new Date().getFullYear()}
              </p>
              <p className="text-xs text-gray-400 mt-2 tracking-widest">Slaughter Community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
