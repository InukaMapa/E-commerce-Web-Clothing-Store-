import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  ArrowUpRight,
  TrendingDown,
  Activity,
} from "lucide-react";
import api from "../../api/axios";

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get("/api/admin/inventory");
        setProducts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const getLowStockVariants = () => {
    const alerts = [];
    products.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.stock <= 5) {
          alerts.push({ ...v, productName: p.name, productId: p._id });
        }
      });
    });
    return alerts;
  };

  const alerts = getLowStockVariants();

  if (loading) return <div>Scanning stock repositories...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Stock Intelligence
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Global inventory synchronization and risk assessment
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-black text-white px-6 py-2 text-xs font-black uppercase tracking-widest flex items-center">
            <Activity size={14} className="mr-2" /> Live monitoring
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-black/5">
            <div className="p-8 border-b border-black/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-black">
                Active Alerts
              </h3>
              <span className="text-xs font-black uppercase text-red-500 tracking-widest">
                {alerts.length} RISKS DETECTED
              </span>
            </div>
            <div className="overflow-hidden">
              {alerts.length === 0 ? (
                <div className="py-20 text-center uppercase text-xs font-bold text-gray-300 italic tracking-widest">
                  Inventory levels optimal across all sectors
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-[#fafafa] border-b border-black/5">
                    <tr>
                      <th className="px-8 py-4 text-xs font-black uppercase text-gray-400">
                        Variant
                      </th>
                      <th className="px-8 py-4 text-xs font-black uppercase text-gray-400">
                        SKU
                      </th>
                      <th className="px-8 py-4 text-xs font-black uppercase text-gray-400 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {alerts.map((alert, idx) => (
                      <tr key={idx} className="group hover:bg-[#fafafa]">
                        <td className="px-8 py-6">
                          <p className="text-xs font-black uppercase text-black mb-1">
                            {alert.productName}
                          </p>
                          <p className="text-xs text-gray-400 uppercase font-bold">
                            {alert.size} / {alert.color}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-xs font-mono text-gray-400 uppercase">
                          {alert.sku || "N/A"}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span
                            className={`px-3 py-1 text-xs font-black uppercase tracking-widest flex items-center justify-center ${
                              alert.stock === 0
                                ? "bg-red-600 text-white"
                                : "bg-orange-500 text-white"
                            }`}
                          >
                            {alert.stock === 0
                              ? "X OUT OF STOCK"
                              : `! ${alert.stock} REMAINING`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-black text-white p-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/40 mb-10">
              Fulfillment Health
            </h3>
            <div className="space-y-12">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">
                    Global Restock Rate
                  </p>
                  <p className="text-xl font-serif font-black">84%</p>
                </div>
                <div className="h-1 bg-white/10 w-full">
                  <div className="h-full bg-white w-[84%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-xs font-black uppercase tracking-widest">
                    Avg. Time to Sold-out
                  </p>
                  <p className="text-xl font-serif font-black">14.2 DAYS</p>
                </div>
                <div className="flex items-center text-xs text-white/40 font-bold uppercase tracking-widest">
                  <TrendingDown size={14} className="mr-2 text-red-400" /> -2.4
                  Days from last month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/5 p-10 hover:border-black/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Supply Chain Logic
              </span>
              <ArrowUpRight
                size={18}
                className="text-gray-200 group-hover:text-black transition-colors"
              />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-4 leading-relaxed line-clamp-2">
              Optimize distribution for high-velocity outerwear units.
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed uppercase font-medium">
              Strategic recommendation based on current stock velocity and
              demand forecasting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
