import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp, TrendingDown, Download, Leaf, Droplet, Globe,
  Compass, Calendar, Award, BarChart3, ShoppingBag, Users,
  ArrowUpRight, ArrowDownRight, Zap, Shield, Recycle, Wind,
  FileText, ChevronDown, Activity, DollarSign, Package,
} from "lucide-react";
import api from "../../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ─────────────── helpers ─────────────── */
const fmt = (n) => Number(n || 0).toLocaleString();
const pct = (a, b) => (b ? (((a - b) / b) * 100).toFixed(1) : 0);

/* animated count-up hook */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* KPI card with count-up */
const KpiCard = ({ label, value, prefix = "", suffix = "", icon: Icon, trend, trendVal, color = "text-black", bg = "bg-white" }) => {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const animated = useCountUp(num);
  const isUp = trend === "up";
  return (
    <div className={`${bg} border border-black/5 p-6 hover:border-black/20 transition-all duration-300 group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/[0.015] pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 leading-tight pr-4">{label}</span>
        {Icon && <Icon size={16} className={`${color} opacity-60 shrink-0`} />}
      </div>
      <p className={`text-3xl font-serif font-black tracking-tight ${color} mb-2`}>
        {prefix}{typeof value === "string" && isNaN(num) ? value : fmt(animated)}{suffix}
      </p>
      {trendVal !== undefined && (
        <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${isUp ? "text-emerald-500" : "text-red-400"}`}>
          {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trendVal}% vs last period
        </p>
      )}
    </div>
  );
};

/* Custom Tooltip */
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest shadow-2xl border border-white/10">
      <p className="text-white/40 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#fff" }}>{p.name}: {prefix}{fmt(p.value)}{suffix}</p>
      ))}
    </div>
  );
};

/* Section title */
const SectionTitle = ({ icon: Icon, children, color = "text-black" }) => (
  <h3 className="text-sm font-black uppercase tracking-widest text-black mb-8 flex items-center gap-3">
    {Icon && <Icon size={16} className={color} />}
    {children}
  </h3>
);

/* ═══════════════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                           */
/* ═══════════════════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("financial");
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const contentRef = useRef(null);
  const exportMenuRef = useRef(null);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target))
        setShowExportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── data fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const [salesRes, prodRes] = await Promise.all([
          api.get("/api/admin/analytics/sales"),
          api.get("/api/admin/analytics/products"),
        ]);
        setSalesData(
          salesRes.data.data.map((item, i) => ({
            name: `Month ${item._id}`,
            revenue: item.revenue,
            orders: item.orderCount || Math.floor(item.revenue / 1800),
          }))
        );
        setTopProducts(
          prodRes.data.data.map((item) => ({
            name: item.details[0]?.name || "N/A",
            value: item.soldQuantity,
            revenue: item.revenue,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── color palettes ── */
  const MONO = ["#000000", "#2d2d2d", "#555", "#888", "#bbb"];
  const ECO = ["#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0"];

  /* ── mock sustainability datasets ── */
  const circularityData = [
    { name: "Organic Cotton", value: 45 },
    { name: "Recycled Polyester", value: 28 },
    { name: "Tencel / Lyocell", value: 15 },
    { name: "Traditional Denim", value: 12 },
  ];
  const ecoImpactData = [
    { name: "Denim", co2: 12.5, water: 85, score: 52 },
    { name: "T-Shirt", co2: 2.1, water: 15, score: 88 },
    { name: "Shirt", co2: 3.4, water: 28, score: 79 },
    { name: "Skirt", co2: 4.2, water: 30, score: 74 },
    { name: "Frock", co2: 5.0, water: 42, score: 68 },
  ];
  const carbonTrend = [
    { name: "Jan", co2: 1250, target: 1100 },
    { name: "Feb", co2: 1100, target: 1050 },
    { name: "Mar", co2: 950, target: 1000 },
    { name: "Apr", co2: 800, target: 950 },
    { name: "May", co2: 720, target: 900 },
    { name: "Jun", co2: 650, target: 850 },
  ];
  const supplierRadar = [
    { axis: "Ethics", value: 92 },
    { axis: "Emissions", value: 78 },
    { axis: "Water", value: 84 },
    { axis: "Circularity", value: 73 },
    { axis: "Packaging", value: 88 },
    { axis: "Labor", value: 95 },
  ];

  /* derived financial metrics */
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const topRevProduct = [...topProducts].sort((a, b) => b.revenue - a.revenue)[0];

  /* ── PDF export ── */
  const handlePDFExport = useCallback(async () => {
    if (!contentRef.current) return;
    setExporting(true);
    setExportType("pdf");
    setShowExportMenu(false);
    try {
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fafafa",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const x = (pdfW - imgW) / 2;
      const y = (pdfH - imgH) / 2;

      /* header */
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pdfW, 14, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("E-STORE ADMIN  //  ANALYTICS REPORT", 10, 9);
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-LK")}`, pdfW - 10, 9, { align: "right" });

      pdf.addImage(imgData, "PNG", x, 16, imgW, Math.min(imgH, pdfH - 26));

      /* footer */
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, pdfH - 10, pdfW, 10, "F");
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(6);
      pdf.text("CONFIDENTIAL — FOR INTERNAL USE ONLY", pdfW / 2, pdfH - 4, { align: "center" });

      const tab = activeTab === "financial" ? "Financial_Performance" : "Sustainability_Insights";
      pdf.save(`E-Store_${tab}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF export failed", e);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
      setExportType(null);
    }
  }, [activeTab]);

  /* ── CSV export ── */
  const handleCSVExport = useCallback(() => {
    setShowExportMenu(false);
    let rows = [];
    if (activeTab === "financial") {
      rows = [
        ["Category", "Period / Product", "Revenue (Rs)", "Orders"],
        ...salesData.map((d) => ["Revenue Trend", d.name, d.revenue, d.orders]),
        [""],
        ["Rank", "Product", "Units Sold", "Revenue (Rs)"],
        ...topProducts.map((p, i) => [i + 1, p.name, p.value, p.revenue]),
      ];
    } else {
      rows = [
        ["Section", "Item", "CO₂ (kg)", "Water (L)", "Score"],
        ...ecoImpactData.map((d) => ["Garment Footprint", d.name, d.co2, d.water, d.score]),
        [""],
        ["Section", "Material", "Share (%)"],
        ...circularityData.map((d) => ["Circularity Mix", d.name, d.value]),
        [""],
        ["Month", "CO₂ Actual (kg)", "CO₂ Target (kg)"],
        ...carbonTrend.map((d) => [d.name, d.co2, d.target]),
      ];
    }
    const csv = rows.map((r) => r.join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const tab = activeTab === "financial" ? "Financial_Performance" : "Sustainability_Insights";
    a.download = `E-Store_${tab}_Data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTab, salesData, topProducts]);

  /* ── loading state ── */
  if (loading) {
    return (
      <div className="space-y-8 pb-20 animate-pulse">
        <div className="h-10 w-80 bg-gray-100" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100" />)}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-80 bg-gray-100" />
          <div className="h-80 bg-gray-100" />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════ */
  return (
    <div className="space-y-10 pb-20">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">
            Admin Console · Intelligence Hub
          </p>
          <h2 className="text-4xl font-serif font-bold uppercase tracking-widest text-black leading-none">
            Advanced Analytics
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-2">
            Decision intelligence &amp; ecosystem synchronization
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Tab switcher */}
          <div className="flex items-center border border-black/10 bg-white p-1 gap-1">
            <button
              onClick={() => setActiveTab("financial")}
              className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                activeTab === "financial"
                  ? "bg-black text-white"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              <BarChart3 size={11} />
              Financial Performance
            </button>
            <button
              onClick={() => setActiveTab("sustainability")}
              className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                activeTab === "sustainability"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-emerald-600"
              }`}
            >
              <Leaf size={11} />
              Sustainability Insights
            </button>
          </div>

          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((p) => !p)}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-black text-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              {exporting ? (
                <span className="animate-pulse">
                  {exportType === "pdf" ? "Generating PDF..." : "Exporting..."}
                </span>
              ) : (
                <>
                  <Download size={12} />
                  <span>Export Report</span>
                  <ChevronDown size={10} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
                </>
              )}
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-black/10 shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={handlePDFExport}
                  className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-left border-b border-black/5"
                >
                  <FileText size={12} />
                  Download PDF Report
                </button>
                <button
                  onClick={handleCSVExport}
                  className="flex items-center gap-3 w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-left"
                >
                  <Activity size={12} />
                  Export CSV Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ CONTENT (captured for PDF) ═══════════ */}
      <div ref={contentRef}>

        {/* ══════════════════════════════════════════════════════ */}
        {/* FINANCIAL PERFORMANCE TAB                              */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "financial" && (
          <div className="space-y-8">

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Platform Revenue"
                value={totalRevenue}
                prefix="Rs. "
                icon={DollarSign}
                trend="up"
                trendVal={12.4}
              />
              <KpiCard
                label="Total Orders Processed"
                value={totalOrders}
                icon={ShoppingBag}
                trend="up"
                trendVal={8.7}
              />
              <KpiCard
                label="Avg. Order Value"
                value={avgOrder}
                prefix="Rs. "
                icon={TrendingUp}
                trend="up"
                trendVal={3.2}
              />
              <KpiCard
                label="Top Product Revenue"
                value={topRevProduct?.revenue || 0}
                prefix="Rs. "
                icon={Award}
                trend="up"
                trendVal={18.1}
              />
            </div>

            {/* Revenue Velocity + Category Dominance */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Revenue Velocity — col-span 3 */}
              <div className="lg:col-span-3 bg-white border border-black/5 p-8">
                <SectionTitle icon={Activity}>Revenue Velocity</SectionTitle>
                {salesData.length === 0 ? (
                  <div className="h-72 flex items-center justify-center border border-dashed border-gray-100">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No sales data available</p>
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#000" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="#000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<ChartTooltip prefix="Rs. " />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#000" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#000", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#000" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category Dominance — col-span 2 */}
              <div className="lg:col-span-2 bg-white border border-black/5 p-8">
                <SectionTitle icon={Award}>Category Dominance</SectionTitle>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topProducts.length ? topProducts : [{ name: "No Data", value: 1 }]}
                        innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value"
                      >
                        {(topProducts.length ? topProducts : [{}]).map((_, i) => (
                          <Cell key={i} fill={MONO[i % MONO.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip suffix=" units" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2.5">
                  {topProducts.slice(0, 5).map((p, i) => {
                    const total = topProducts.reduce((a, b) => a + (b.value || 0), 0);
                    const share = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-600 truncate">
                          <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: MONO[i % MONO.length] }} />
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-black transition-all" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 w-8 text-right">{share}%</span>
                        </div>
                      </div>
                    );
                  })}
                  {topProducts.length === 0 && (
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest text-center py-4">No product data</p>
                  )}
                </div>
              </div>
            </div>

            {/* Orders vs Revenue + Top Products Table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Monthly Orders vs Revenue */}
              <div className="lg:col-span-3 bg-white border border-black/5 p-8">
                <SectionTitle icon={BarChart3}>Orders vs Revenue</SectionTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                      <YAxis yAxisId="rev" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="ord" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar yAxisId="rev" dataKey="revenue" name="Revenue" fill="#000" radius={[3, 3, 0, 0]} maxBarSize={28} />
                      <Bar yAxisId="ord" dataKey="orders" name="Orders" fill="#d4d4d4" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-3 h-2 bg-black inline-block" />Revenue
                  </span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-3 h-2 bg-gray-300 inline-block" />Orders
                  </span>
                </div>
              </div>

              {/* Top Products Table */}
              <div className="lg:col-span-2 bg-white border border-black/5 p-8">
                <SectionTitle icon={Package}>Top Products</SectionTitle>
                <div className="space-y-1">
                  {topProducts.length === 0 && (
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest text-center py-8">No product data</p>
                  )}
                  {topProducts.slice(0, 6).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 group hover:bg-gray-50 transition-colors px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-gray-200 w-5 shrink-0">#{i + 1}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-black truncate max-w-[100px]">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-black">Rs. {fmt(p.revenue)}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">{fmt(p.value)} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Summary Banner */}
            <div className="bg-black text-white p-10">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-8">Platform Financial Intelligence</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
                {[
                  { label: "Ecosystem Revenue", value: `Rs. ${(totalRevenue / 1_000_000).toFixed(2)}M` },
                  { label: "Market Engagement", value: "92%" },
                  { label: "Producer ROI Avg.", value: "14.8%" },
                  { label: "YoY Growth", value: "+28.4%" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">{item.label}</p>
                    <p className="text-3xl font-serif font-black tracking-widest">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* SUSTAINABILITY INSIGHTS TAB                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === "sustainability" && (
          <div className="space-y-8">

            {/* Eco KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "CO₂ Offset Sourcing", value: "14.5 Tons", icon: Globe, trend: "down", trendVal: 18.4, color: "text-emerald-600" },
                { label: "Water Conserved", value: "124.5K L", icon: Droplet, trend: "up", trendVal: 24, color: "text-blue-500" },
                { label: "Circularity Rate", value: "73%", icon: Recycle, trend: "up", trendVal: 11.2, color: "text-emerald-500" },
                { label: "Supply Chain Grade", value: "A+", icon: Shield, trend: "up", trendVal: 5, color: "text-amber-500" },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-black/5 p-6 hover:border-black/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 leading-tight pr-4">{kpi.label}</span>
                    <kpi.icon size={16} className={`${kpi.color} opacity-70 shrink-0`} />
                  </div>
                  <p className={`text-3xl font-serif font-black tracking-tight ${kpi.color} mb-2`}>{kpi.value}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${kpi.trend === "up" ? "text-emerald-500" : "text-emerald-500"}`}>
                    <ArrowUpRight size={11} />
                    {kpi.trendVal}% improvement
                  </p>
                </div>
              ))}
            </div>

            {/* Circularity + Environmental Footprint */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Sourcing Circularity Mix */}
              <div className="bg-white border border-black/5 p-8">
                <SectionTitle icon={Recycle} color="text-emerald-600">Sourcing Circularity Mix</SectionTitle>
                <div className="flex items-center gap-8">
                  <div className="h-56 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={circularityData} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270}>
                          {circularityData.map((_, i) => (
                            <Cell key={i} fill={ECO[i % ECO.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip suffix="%" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 min-w-[160px]">
                    {circularityData.map((d, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-none shrink-0" style={{ backgroundColor: ECO[i % ECO.length] }} />
                            {d.name}
                          </span>
                          <span className="text-[9px] font-black text-gray-700 ml-2">{d.value}%</span>
                        </div>
                        <div className="w-full h-0.5 bg-gray-100">
                          <div className="h-full transition-all" style={{ width: `${d.value}%`, backgroundColor: ECO[i % ECO.length] }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Environmental Footprint per Garment */}
              <div className="bg-white border border-black/5 p-8">
                <SectionTitle icon={Droplet} color="text-blue-500">Environmental Footprint</SectionTitle>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ecoImpactData} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="co2" name="CO₂ (kg)" fill="#000" radius={[2, 2, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="water" name="Water (L×0.1)" fill="#10B981" radius={[2, 2, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-3 h-2 bg-black inline-block" />CO₂ Footprint (kg)
                  </span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-3 h-2 bg-emerald-500 inline-block" />Water (L / 10)
                  </span>
                </div>
              </div>
            </div>

            {/* Carbon Trend + Supplier Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Carbon Logistics Trend */}
              <div className="lg:col-span-3 bg-white border border-black/5 p-8">
                <SectionTitle icon={Wind} color="text-emerald-600">Logistics Carbon Trend vs Target</SectionTitle>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={carbonTrend}>
                      <defs>
                        <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} tickFormatter={(v) => `${v}kg`} />
                      <Tooltip content={<ChartTooltip suffix=" kg CO₂" />} />
                      <Area type="monotone" dataKey="co2" name="Actual CO₂" stroke="#10B981" strokeWidth={2.5} fill="url(#co2Grad)" dot={{ fill: "#10B981", r: 3, strokeWidth: 0 }} />
                      <Area type="monotone" dataKey="target" name="Target" stroke="#6EE7B7" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#tgtGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4">
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-4 h-0.5 bg-emerald-500 inline-block" />Actual
                  </span>
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <span className="w-4 h-0.5 bg-emerald-300 inline-block border-t border-dashed border-emerald-300" />Target
                  </span>
                </div>
              </div>

              {/* Supplier Compliance Radar */}
              <div className="lg:col-span-2 bg-white border border-black/5 p-8">
                <SectionTitle icon={Compass} color="text-amber-500">Supplier Compliance</SectionTitle>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={supplierRadar} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                      <PolarGrid stroke="#f0f0f0" />
                      <PolarAngleAxis dataKey="axis" tick={{ fontSize: 8, fill: "#999", fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 7, fill: "#ccc" }} tickCount={4} />
                      <Radar name="Score" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.12} strokeWidth={2} dot={{ fill: "#059669", r: 3 }} />
                      <Tooltip content={<ChartTooltip suffix="%" />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {supplierRadar.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{s.axis}</span>
                      <span className={`text-[8px] font-black ${s.value >= 85 ? "text-emerald-500" : s.value >= 70 ? "text-amber-500" : "text-red-400"}`}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Material Eco-Score Table */}
            <div className="bg-white border border-black/5 p-8">
              <SectionTitle icon={Leaf} color="text-emerald-600">Garment Environmental Score Card</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Garment</th>
                      <th className="text-center py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">CO₂ (kg)</th>
                      <th className="text-center py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Water (L)</th>
                      <th className="text-center py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Eco Score</th>
                      <th className="text-center py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Grade</th>
                      <th className="py-3 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Score Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ecoImpactData.map((row, i) => {
                      const grade = row.score >= 85 ? "A" : row.score >= 70 ? "B" : row.score >= 55 ? "C" : "D";
                      const gradeColor = grade === "A" ? "text-emerald-600 bg-emerald-50" : grade === "B" ? "text-blue-600 bg-blue-50" : grade === "C" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
                      return (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                          <td className="py-4 text-[10px] font-black uppercase tracking-widest text-black">{row.name}</td>
                          <td className="py-4 text-center text-[10px] font-bold text-gray-600">{row.co2}</td>
                          <td className="py-4 text-center text-[10px] font-bold text-blue-500">{row.water}</td>
                          <td className="py-4 text-center text-[10px] font-black text-black">{row.score}/100</td>
                          <td className="py-4 text-center">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 ${gradeColor}`}>{grade}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${row.score}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sustainability Decision Intelligence */}
            <div className="bg-emerald-950 text-emerald-50 p-10">
              <div className="flex items-center gap-3 mb-8">
                <Zap size={14} className="text-emerald-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
                  AI-Powered Sustainability Decision Intelligence
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    badge: "Quick Win",
                    title: "Localize Sourcing",
                    body: "Apex Fabrics offers an organic cotton blend that reduces your Q3 T-shirt line's carbon footprint by 18%.",
                    savings: "−18% CO₂",
                    badgeColor: "border-emerald-400 text-emerald-400",
                  },
                  {
                    badge: "Logistics",
                    title: "Consolidated Packaging POs",
                    body: "Consolidating packaging orders from Elite Packaging saves an estimated 420 kg CO₂ in domestic shipping.",
                    savings: "−420 kg CO₂",
                    badgeColor: "border-blue-400 text-blue-400",
                  },
                  {
                    badge: "Compliance",
                    title: "Vendor Upgrade Alert",
                    body: "Transitioning from Luxe Lace & Trims (inactive) to certified Eco Thread Co. will improve your supply chain compliance index by 8%.",
                    savings: "+8% Compliance",
                    badgeColor: "border-amber-400 text-amber-400",
                  },
                ].map((tip, i) => (
                  <div key={i} className={`space-y-3 ${i < 2 ? "border-r border-emerald-800/30 pr-8" : ""}`}>
                    <span className={`inline-block px-2.5 py-0.5 border text-[8px] font-black uppercase tracking-widest ${tip.badgeColor}`}>
                      {tip.badge}
                    </span>
                    <p className="text-sm font-black text-white uppercase tracking-wider">{tip.title}</p>
                    <p className="text-[10px] text-emerald-200/60 leading-relaxed">{tip.body}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingDown size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{tip.savings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>{/* end contentRef */}

    </div>
  );
};

export default AdminAnalytics;
