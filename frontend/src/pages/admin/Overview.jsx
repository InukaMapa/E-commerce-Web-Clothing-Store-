import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import {
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/dashboard/StatCard';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        orderCount: 0,
        avgOrderValue: 0,
        userCount: 0,
    });
    const [salesTrend, setSalesTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpiRes, trendRes, userRes] = await Promise.all([
                    api.get('/api/dashboard/kpis'),
                    api.get('/api/dashboard/sales-trend'),
                    api.get('/api/admin/users')
                ]);

                setStats({
                    ...kpiRes.data.data,
                    userCount: userRes.data.data.length
                });
                setSalesTrend(trendRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-gray-200" />)}
        </div>
        <div className="h-96 bg-gray-200" />
    </div>;

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">Performance Dashboard</h2>
                <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.3em]">Global ecosystem health and synchronization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={12} />
                <StatCard label="Orders Volume" value={stats.orderCount} icon={ShoppingCart} trend={8} />
                <StatCard label="Active Customers" value={stats.userCount} icon={Users} trend={5} />
                <StatCard label="Avg. Order Value" value={`$${stats.avgOrderValue}`} icon={TrendingUp} trend={-2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 bg-white p-10 border border-black/5">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-[14px] font-bold uppercase tracking-widest text-black">Revenue Trajectory</h3>
                        <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-b border-black/10 pb-1">
                            <option>LAST 30 DAYS</option>
                            <option>LAST 90 DAYS</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#999', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#000', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-black text-white p-10 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/40 mb-12">Market Insights</h3>
                        <div className="space-y-10">
                            <div className="border-b border-white/10 pb-8">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">Trending Category</p>
                                <p className="text-xl font-serif font-bold tracking-widest uppercase">Outerwear</p>
                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-2 flex items-center">
                                    <ArrowUpRight size={14} className="mr-1" /> 24% Growth
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-3">System Efficiency</p>
                                <p className="text-xl font-serif font-bold tracking-widest uppercase">98.4%</p>
                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-2">Optimal Load Distribution</p>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gray-200 transition-colors">
                        Generate Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
