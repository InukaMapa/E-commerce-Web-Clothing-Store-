import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Briefcase,
  Award,
  ArrowUpRight,
  Download,
  Filter,
} from "lucide-react";
import api from "../../api/axios";

const AdminAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [salesRes, prodRes] = await Promise.all([
          api.get("/api/admin/analytics/sales"),
          api.get("/api/admin/analytics/products"),
        ]);
        setSalesData(
          salesRes.data.data.map((item) => ({
            name: `Month ${item._id}`,
            revenue: item.revenue,
          })),
        );
        setTopProducts(
          prodRes.data.data.map((item) => ({
            name: item.details[0]?.name || "N/A",
            value: item.soldQuantity,
            revenue: item.revenue,
          })),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

  if (loading) return <div>Synthesizing data streams...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Advanced Analytics
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Decision intelligence and market synchronization
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-400 transition-colors">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-400 transition-colors">
            <Filter size={14} />
            <span>Filter Period</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-black/5 p-12">
          <h3 className="text-sm font-black uppercase tracking-widest text-black mb-12 flex items-center">
            <Calendar size={18} className="mr-3" /> Revenue Velocity
          </h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorAna" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="name"
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
                <Tooltip formatter={(value) => `Rs. ${value}`} />
                <Area
                  type="step"
                  dataKey="revenue"
                  stroke="#000"
                  strokeWidth={3}
                  fill="url(#colorAna)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-black/5 p-12">
          <h3 className="text-sm font-black uppercase tracking-widest text-black mb-12 flex items-center">
            <Award size={18} className="mr-3" /> Category Dominance
          </h3>
          <div className="h-96 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `Rs. ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {topProducts.slice(0, 5).map((p, i) => {
              const totalVal = topProducts.reduce(
                (a, b) => a + (b.value || 0),
                0,
              );
              const percentage =
                totalVal > 0 ? ((p.value / totalVal) * 100).toFixed(1) : 0;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs font-bold uppercase tracking-widest"
                >
                  <span className="flex items-center">
                    <span
                      className="w-3 h-3 mr-3"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    ></span>
                    {p.name}
                  </span>
                  <span className="text-gray-400">{percentage}%</span>
                </div>
              );
            })}
            {topProducts.length === 0 && (
              <div className="text-xs text-gray-400 uppercase font-black tracking-widest text-center mt-10">
                NO PRODUCT SALES DATA
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black text-white p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-b border-white/10 py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Total Ecosystem Revenue
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              Rs. 2.4M
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Market Engagement
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              92%
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Producer ROI Avg.
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              14.8%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
