import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Download,
  Wallet,
} from "lucide-react";
import api from "../../api/axios";
import StatCard from "../../components/dashboard/StatCard";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockAlerts: []
  });
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  
  // Date range state: default to last 30 days
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendRes] = await Promise.all([
        api.get(`/api/admin/dashboard-stats?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/api/admin/analytics/sales?startDate=${startDate}&endDate=${endDate}`),
      ]);

      setStats(statsRes.data.data);
      // Map data for chart
      const trendData = trendRes.data.data.map((item) => ({
        date: item._id, // Aggregated by date string from backend
        revenue: item.revenue,
      }));
      setSalesTrend(trendData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/api/admin/export-report?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Platform_Report_${startDate}_to_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (loading && salesTrend.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-xs font-bold uppercase tracking-[0.5em] text-gray-400 animate-pulse">
          Synchronizing Platform Hub...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Platform Hub
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Global statistics and synchronization monitor
          </p>
        </div>
        
        <div className="flex items-center space-x-4 bg-white p-2 border border-black/5 shadow-sm">
          <div className="flex items-center space-x-2 px-3 border-r border-black/5">
            <Calendar size={14} className="text-gray-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 px-3">
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <div className="flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-2">
              Critical Alert: Low Stock Units Detected
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.lowStockAlerts.map((alert, idx) => (
                <div key={idx} className="bg-white/50 px-3 py-1.5 border border-red-100 rounded-sm">
                  <p className="text-[9px] font-bold text-red-700 uppercase tracking-widest">
                    {alert.name} ({alert.size}/{alert.color}) — <span className="underline">{alert.stock} REMAINING</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard label="Products" value={stats.totalProducts} icon={Package} />
        <StatCard
          label="Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <StatCard
          label="Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-10 border border-black/5">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black">
              Revenue Analytics
            </h3>
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>{new Date(startDate).toLocaleDateString()}</span>
              <span>—</span>
              <span>{new Date(endDate).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="h-80 w-full relative">
            {loading && salesTrend.length > 0 && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-black">Updating...</div>
              </div>
            )}
            {salesTrend.length === 0 && !loading ? (
              <div className="h-full flex items-center justify-center border border-dashed border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No data detected for this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(val) => `Rs. ${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '0' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  labelStyle={{ color: '#aaa', fontSize: '9px', marginBottom: '4px' }}
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, "REVENUE"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-black text-white p-10 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-white/40 mb-12">
            System Insights
          </h3>
          <div className="space-y-10">
            <div className="border-b border-white/10 pb-8">
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">
                Health Status
              </p>
              <p className="text-xl font-serif font-bold tracking-widest uppercase">
                Operational
              </p>
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest mt-2 flex items-center">
                <ArrowUpRight size={14} className="mr-1" /> All Systems Nominal
              </p>
            </div>
            
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Platform scale is optimizing automatically based on detected traffic patterns.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.4em] hover:bg-gray-200 transition-colors flex items-center justify-center space-x-3 disabled:opacity-50 mt-12"
          >
            {downloading ? (
              <span className="animate-pulse">GENERATING...</span>
            ) : (
              <>
                <Download size={14} />
                <span>DOWNLOAD FULL REPORT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
