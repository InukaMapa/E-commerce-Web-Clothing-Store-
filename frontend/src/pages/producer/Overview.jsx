import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/dashboard/StatCard';

const ProducerOverview = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        orderCount: 0,
        avgOrderValue: 0
    });
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kpiRes, alertRes] = await Promise.all([
                    api.get('/api/dashboard/kpis'),
                    api.get('/api/dashboard/alerts')
                ]);
                setStats(kpiRes.data.data);
                setAlerts(alertRes.data.data.inventoryAlerts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Synchronizing producer data...</div>;

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">My Brand Pulse</h2>
                    <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.3em]">Individual performance and inventory health</p>
                </div>
                <button className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all">
                    ADD NEW PRODUCT
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Store Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend={15} />
                <StatCard label="Total Sold Items" value={stats.orderCount} icon={Package} trend={5} />
                <StatCard label="Avg. Order Value" value={`$${stats.avgOrderValue}`} icon={TrendingUp} trend={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white border border-black/5 overflow-hidden">
                    <div className="p-8 border-b border-black/5 flex items-center justify-between">
                        <h3 className="text-[14px] font-bold uppercase tracking-widest text-black">Inventory Criticality</h3>
                        <span className="bg-red-50 text-red-600 text-[10px] font-black tracking-widest px-3 py-1">
                            {alerts.length} ALERTS ACTIVE
                        </span>
                    </div>
                    <div className="p-0">
                        {alerts.length === 0 ? (
                            <div className="py-20 text-center text-gray-400 uppercase text-[10px] tracking-widest font-bold italic">No critical stock levels detected</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-[#fafafa] border-b border-black/5">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Product</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400">Stock</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase text-gray-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {alerts.map((alert, idx) => (
                                        <tr key={idx}>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-black">{alert.productName}</p>
                                                <p className="text-[9px] text-gray-400 uppercase tracking-widest">{alert.sku}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[11px] font-black text-red-500">{alert.stock}</span>
                                                <span className="text-[9px] text-gray-300 ml-2">/ {alert.threshold} THRESHOLD</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-500 transition-colors">Restock</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="bg-[#f3f4f6] p-10 flex flex-col justify-between border border-black/5">
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <AlertTriangle className="text-black" size={24} />
                            <h3 className="text-[14px] font-bold uppercase tracking-widest text-black">Strategic Advice</h3>
                        </div>
                        <p className="text-[12px] leading-relaxed text-gray-600 font-medium tracking-wide mb-8">
                            Based on historical performance, your <span className="text-black font-bold uppercase">Denim Collection</span> is expected to see a 15% increase in demand next week. Consider increasing stock levels for sizes M and L.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-white p-6 border border-black/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Stock Forecasting</span>
                                <span className="text-[10px] font-black text-green-500">OPTIMAL</span>
                            </div>
                            <div className="bg-white p-6 border border-black/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest">Promotion ROI</span>
                                <span className="text-[10px] font-black text-orange-500">+12.4%</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gray-800 transition-all mt-10">
                        View Analytics Detail
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProducerOverview;
