import React from "react";
import Sidebar from "./Sidebar";
import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-black/5 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center bg-[#f3f4f6] px-4 py-2 rounded-none border border-black/5 w-96">
            <Search size={16} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="SEARCH PLATFORM..."
              className="bg-transparent border-none outline-none text-xs font-bold tracking-widest uppercase w-full placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center space-x-8">

            <div className="flex items-center space-x-4 border-l border-gray-100 pl-8">
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-black mb-0.5">
                  {user?.name}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {user?.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-10 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
