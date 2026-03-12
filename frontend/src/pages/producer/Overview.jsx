import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Zap,
  Wallet,
} from "lucide-react";
import api from "../../api/axios";
import StatCard from "../../components/dashboard/StatCard";

const ProducerOverview = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get("/api/producer/dashboard"),
          api.get("/api/dashboard/alerts"),
        ]);
        setStats(statsRes.data.data);
        setAlerts(alertsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Synchronizing brand data...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Workspace Overview
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Lifecycle of your brand ecosystem
          </p>
        </div>
        <div className="flex items-center space-x-4 border border-black/5 p-4 bg-white">
          <Calendar size={18} className="text-gray-400" />
          <span className="text-xs font-black uppercase tracking-widest">
            Q1 Synchronization - Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          label="My Products"
          value={stats.totalProducts}
          icon={Package}
        />
        <StatCard
          label="Total Sales"
          value={stats.totalOrders}
          icon={TrendingUp}
        />
        <StatCard
          label="Pending Fulfillment"
          value={stats.pendingOrders}
          icon={ShoppingCart}
        />
        <StatCard
          label="Brand Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-10 border border-black/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center">
              <Zap size={18} className="mr-3" /> Inventory Synchronization
            </h3>
            <span className="bg-red-50 text-red-500 px-3 py-1 text-xs font-black uppercase tracking-widest">
              {alerts.length} CRITICAL ALERTS
            </span>
          </div>
          <div className="space-y-6">
            {alerts.slice(0, 4).map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-6 border-b border-gray-50 group hover:border-black/10 transition-colors"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-300">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-black mb-1">
                      {alert.productName}
                    </p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {alert.variant?.size} / {alert.variant?.color}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-red-500 mb-1">
                    {alert.variant?.stock} UNITS REMAINING
                  </p>
                  <button className="text-xs font-black uppercase tracking-[0.2em] border-b border-black text-black opacity-0 group-hover:opacity-100 transition-opacity pb-0.5">
                    RESTOCK UNIT
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="py-20 text-center uppercase text-xs font-bold text-gray-300 tracking-[0.3em] italic">
                Ecosystem stabilized - no alerts
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#f3f4f6] p-10 flex flex-col justify-between border border-black/5">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <AlertTriangle className="text-black" size={24} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-black">
                Strategic Advice
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-gray-600 font-medium tracking-wide mb-8">
              Based on historical performance, your{" "}
              <span className="text-black font-bold uppercase">
                Denim Collection
              </span>{" "}
              is expected to see a 15% increase in demand next week. Consider
              increasing stock levels for sizes M and L.
            </p>
            <div className="space-y-4">
              <div className="bg-white p-6 border border-black/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">
                  Stock Forecasting
                </span>
                <span className="text-xs font-black text-green-500">
                  OPTIMAL
                </span>
              </div>
              <div className="bg-white p-6 border border-black/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest">
                  Promotion ROI
                </span>
                <span className="text-xs font-black text-orange-500">
                  +12.4%
                </span>
              </div>
            </div>
          </div>
          <button className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.4em] hover:bg-gray-800 transition-all mt-10">
            View Analytics Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProducerOverview;
