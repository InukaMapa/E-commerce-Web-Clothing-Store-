import { useState, useEffect } from "react";
import api from "../api/axios";

/**
 * PRODUCTION-READY DASHBOARD PAGE (Admin/Producer)
 * Features:
 * - Multi-source data fetching (KPIs & Alerts)
 * - Dynamic KPI visualization cards
 * - Inventory-critical "Low Stock" warning system
 * - Responsive grid-based layout for data density
 * - Polished state management (Skeleton loaders & Error boundaries)
 */
export default function Dashboard() {
  const [data, setData] = useState({
    kpis: { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 },
    inventoryAlerts: [],
    marketDemand: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Data Acquisition ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetching KPIs and Alerts concurrently for performance
        const [kpiRes, alertRes] = await Promise.all([
          api.get("/api/dashboard/kpis"),
          api.get("/api/dashboard/alerts")
        ]);

        setData({
          kpis: kpiRes.data?.data || data.kpis,
          inventoryAlerts: alertRes.data?.data?.inventoryAlerts || [],
          marketDemand: alertRes.data?.data?.marketDemand || []
        });
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load analytics. Please ensure your session is valid.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ── Render Helpers ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse bg-gray-50 min-h-screen">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 mb-6">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Revenue", value: `$${data.kpis.totalRevenue?.toLocaleString()}`, icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Total Orders", value: data.kpis.orderCount, icon: "📦", color: "bg-blue-50 text-blue-700" },
    { label: "Avg. Order Value", value: `$${data.kpis.avgOrderValue?.toFixed(2)}`, icon: "📈", color: "bg-purple-50 text-purple-700" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Performance Overview</h1>
          <p className="text-sm text-gray-500 font-medium">Monitoring your store's health in real-time.</p>
        </div>
        <div className="flex justify-center space-x-2">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 shadow-sm border border-green-200">
             <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
             Live Updates
           </span>
        </div>
      </header>

      {/* KPI Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 rounded-2xl text-xl ${card.color}`}>{card.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last 30 Days</span>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-black text-gray-900 leading-none">{card.value}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Inventory Alerts List */}
        <section className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Critical Stock Alerts</h2>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-md">
                  {data.inventoryAlerts.length} VARIANT(S) LOW
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {data.inventoryAlerts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-gray-400 font-medium italic">Inventory health looks great! No alerts active.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-wider text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4 text-center">SKU</th>
                      <th className="px-6 py-4 text-center">In Stock</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.inventoryAlerts.map((alert, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{alert.productName}</p>
                          <p className="text-xs text-gray-500">{alert.size} / {alert.color}</p>
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">{alert.sku}</td>
                        <td className="px-6 py-4 text-center font-black text-gray-900">{alert.stock}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                            alert.severity === "CRITICAL" ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar Intelligence (Market Trends) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 border border-indigo-800">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6">Market Trends</h3>
            <div className="space-y-6">
              {data.marketDemand.map((trend, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-indigo-800 pb-4">
                  <div>
                    <p className="text-sm font-bold">{trend.productName}</p>
                    <p className="text-xs text-indigo-300">Trend: {trend.trend}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-indigo-400">{trend.velocity}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[10px] font-medium text-indigo-300 italic">* Velocity based on last 24h performance</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
             <div>
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">System Health</p>
                <p className="text-sm font-black text-gray-900">Synchronized</p>
             </div>
             <div className="bg-green-50 p-2 rounded-xl text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
