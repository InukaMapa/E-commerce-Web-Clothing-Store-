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
      <div className="p-8 space-y-12 animate-pulse bg-white min-h-screen">
        <div className="h-10 w-64 bg-gray-100 mb-8 mt-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 border border-gray-100"></div>)}
        </div>
        <div className="h-96 bg-gray-50 border border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
        <div className="bg-black text-white p-6 mb-8 text-[10px] uppercase tracking-widest font-bold">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-black text-white px-10 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-gray-800 transition-all border border-black"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Revenue", value: `$${data.kpis.totalRevenue?.toLocaleString()}`, icon: "💰" },
    { label: "Total Orders", value: data.kpis.orderCount, icon: "📦" },
    { label: "Avg. Order Value", value: `$${data.kpis.avgOrderValue?.toFixed(2)}`, icon: "📈" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 sm:p-14">
        {/* Header */}
        <header className="mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0 text-center sm:text-left">
          <div>
            <h1 className="text-4xl md:text-3xl font-serif font-bold uppercase tracking-widest text-black leading-tight mb-4">
              Performance Overview
            </h1>
            <p className="text-[12px] text-gray-700 font-bold uppercase tracking-[0.3em]">Monitoring your store's health in real-time.</p>
          </div>
          <div className="flex justify-center">
            <span className="inline-flex items-center px-4 py-2 text-[12px] font-bold uppercase tracking-[0.2em] bg-black text-white border border-black">
              <span className="w-1.5 h-1.5 rounded-full bg-white mr-3 animate-pulse"></span>
              Live Updates
            </span>
          </div>
        </header>

        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {kpiCards.map((card, idx) => (
            <div key={idx} className="bg-white p-10 border border-black/5 hover:border-black/20 md:border-black/5 transition-all group">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-gray-700 group-hover:text-black transition-colors">KPI {idx + 1}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-700">Last 30 Days</span>
              </div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{card.label}</p>
              <p className="text-4xl font-serif font-bold text-black tracking-tight">{card.value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Inventory Alerts List */}
          <section className="lg:col-span-8">
            <div className="bg-white border border-black/5 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-black">Critical Stock Alerts</h2>
                <span className="bg-black text-white text-[11px] font-bold tracking-[0.2em] px-3 py-1">
                  {data.inventoryAlerts.length} VARIANT(S) LOW
                </span>
              </div>

              <div className="overflow-x-auto">
                {data.inventoryAlerts.length === 0 ? (
                  <div className="p-20 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] italic">Inventory health looks great. No alerts active.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-[#fafafa] text-[9px] uppercase font-bold tracking-[0.3em] text-gray-400">
                      <tr>
                        <th className="px-8 py-5">Product Details</th>
                        <th className="px-8 py-5 text-center">SKU</th>
                        <th className="px-8 py-5 text-center">Stock</th>
                        <th className="px-8 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.inventoryAlerts.map((alert, idx) => (
                        <tr key={idx} className="hover:bg-[#fafafa] transition-colors group">
                          <td className="px-8 py-6">
                            <p className="text-[11px] font-bold text-black uppercase tracking-widest mb-1">{alert.productName}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">{alert.size} / {alert.color}</p>
                          </td>
                          <td className="px-8 py-6 text-center font-mono text-[10px] text-gray-400">{alert.sku}</td>
                          <td className="px-8 py-6 text-center text-[11px] font-bold text-black">{alert.stock}</td>
                          <td className="px-8 py-6 text-right">
                            <span className={`px-2 py-1 text-[9px] font-bold tracking-widest ${alert.severity === "CRITICAL" ? 'bg-black text-white' : 'border border-black text-black'
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
          <section className="lg:col-span-4 space-y-8">
            <div className="bg-black p-10 text-white border border-black">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-10">Market Intelligence</h3>
              <div className="space-y-8">
                {data.marketDemand.map((trend, idx) => (
                  <div key={idx} className="flex items-start justify-between border-b border-white/10 pb-6 group cursor-default">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest group-hover:text-white/100 transition-colors mb-2">{trend.productName}</p>
                      <p className="text-[9px] text-white/40 uppercase tracking-[0.2em]">Trend: <span className="text-white/60">{trend.trend}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{trend.velocity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-10 text-[9px] font-medium text-white/30 uppercase tracking-widest italic leading-relaxed">* Velocity based on last 24h performance metrics compiled by system core.</p>
            </div>

            <div className="bg-white p-10 border border-black/5 flex items-center justify-between group hover:border-black/20 transition-all">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-2">System Core</p>
                <p className="text-[11px] font-bold text-black uppercase tracking-[0.2em]">Synchronized</p>
              </div>
              <div className="bg-black/5 p-4 group-hover:bg-black group-hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
