import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Download, Filter, TrendingUp } from "lucide-react";
import api from "../../api/axios";

const ProducerAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/producer/dashboard");
        // Creating a mock trend from the total revenue since there isn't a timeline API for producer yet
        const baseRev = res.data.data.totalRevenue || 1000;
        const data = [
          { name: "Jan", revenue: baseRev * 0.2 },
          { name: "Feb", revenue: baseRev * 0.4 },
          { name: "Mar", revenue: baseRev * 0.7 },
          { name: "Apr", revenue: baseRev },
        ];
        setSalesData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Synthesizing telemetry data...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Performance Telemetry
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Brand metrics and engagement velocity
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <button className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-400 transition-colors">
            <Download size={14} />
            <span>Export Payload</span>
          </button>
          <button className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest border-b border-black pb-1 hover:text-gray-400 transition-colors">
            <Filter size={14} />
            <span>Filter Matrix</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-black/5 p-12">
        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-12 flex items-center">
          <Activity size={18} className="mr-3" /> Growth Trajectory
        </h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
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
                type="monotone"
                dataKey="revenue"
                stroke="#000"
                strokeWidth={3}
                fill="url(#colorProd)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-black text-white p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center border-t border-b border-white/10 py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Signal Strength
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              OPTIMAL
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Producer ROI
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              14.8%
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Inventory Velocity
            </p>
            <p className="text-4xl font-serif font-black tracking-widest">
              HIGH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerAnalytics;
