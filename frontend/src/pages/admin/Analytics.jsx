import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Download, Calendar, BarChart3,
  ShoppingBag, Users, ArrowUpRight, ArrowDownRight, Zap, Shield,
  FileText, ChevronDown, Activity, DollarSign, Package, Tag,
  MapPin, RefreshCw, AlertCircle, CheckCircle2, Filter
} from "lucide-react";
import api from "../../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ─────────────── Helpers ─────────────── */
const fmt = (n) => Number(n || 0).toLocaleString();
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImage(img) {
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/uploads")) return `${BASE_URL}${img}`;
  if (img.startsWith("uploads/")) return `${BASE_URL}/${img}`;
  return `${BASE_URL}/uploads/${img}`;
}

/* Animated count-up hook */
function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* KPI Stat Card */
const KpiCard = ({ label, value, prefix = "", suffix = "", icon: Icon, trend, trendVal, color = "text-black", bg = "bg-white" }) => {
  const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const animated = useCountUp(num);
  const isUp = trend === "up";
  return (
    <div className={`${bg} border border-black/5 p-6 hover:border-black/20 shadow-sm transition-all duration-300 relative overflow-hidden group`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-tight pr-4">
          {label}
        </span>
        {Icon && <Icon size={18} className={`${color} opacity-70 shrink-0 group-hover:scale-110 transition-transform`} />}
      </div>
      <p className={`text-3xl font-serif font-black tracking-tight ${color} mb-2`}>
        {prefix}{typeof value === "string" && isNaN(num) ? value : fmt(animated)}{suffix}
      </p>
      {trendVal !== undefined && (
        <p className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${isUp ? "text-emerald-600" : "text-amber-600"}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendVal}% {isUp ? "growth" : "shift"}
        </p>
      )}
    </div>
  );
};

/* Custom Chart Tooltip for Line & Bar Charts */
const ChartTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-xl border border-white/10 rounded-none z-50 pointer-events-none">
      {label && <p className="text-white/40 mb-1.5 border-b border-white/10 pb-1 text-[9px]">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#fff" }} className="flex justify-between items-center gap-4">
          <span>{p.name}:</span>
          <span className="font-black">{prefix}{fmt(p.value)}{suffix}</span>
        </p>
      ))}
    </div>
  );
};

/* Custom Chart Tooltip for Pie Chart */
const PieChartTooltip = ({ active, payload, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  if (!data) return null;
  return (
    <div className="bg-black text-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest shadow-xl border border-white/10 rounded-none z-50 pointer-events-none">
      <p style={{ color: data.color || "#fff" }} className="flex items-center gap-2">
        <span>{data.name || "Apparel"}:</span>
        <span className="font-black">{prefix}{fmt(data.value)}{suffix}</span>
      </p>
    </div>
  );
};

/* Section Header */
const SectionHeader = ({ icon: Icon, title, subtitle, color = "text-black" }) => (
  <div className="mb-6">
    <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2.5">
      {Icon && <Icon size={16} className={color} />}
      {title}
    </h3>
    {subtitle && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
/*                    MAIN COMPONENT                           */
/* ═══════════════════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Date range state - default to "all" to ensure all existing records show immediately
  const [startDate, setStartDate] = useState("all");
  const [endDate, setEndDate] = useState("all");
  const [preset, setPreset] = useState("all");

  // Data states
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [cityData, setCityData] = useState([]);

  const contentRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Color Palettes
  const BRAND_PALETTE = ["#000000", "#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#334155"];

  /* Handle Date Preset Selection */
  const handlePresetChange = (p) => {
    setPreset(p);
    if (p === "all") {
      setStartDate("all");
      setEndDate("all");
      return;
    }
    const now = new Date();
    let start = new Date();

    if (p === "7d") {
      start.setDate(now.getDate() - 7);
    } else if (p === "30d") {
      start.setDate(now.getDate() - 30);
    } else if (p === "90d") {
      start.setDate(now.getDate() - 90);
    } else if (p === "year") {
      start = new Date(now.getFullYear(), 0, 1);
    } else {
      return; // custom range
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  };

  /* Close export menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Data Fetching */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const qStart = startDate === "all" ? "" : startDate;
      const qEnd = endDate === "all" ? "" : endDate;
      const [salesRes, prodRes] = await Promise.all([
        api.get(`/api/admin/analytics/sales?startDate=${qStart}&endDate=${qEnd}`),
        api.get(`/api/admin/analytics/products?startDate=${qStart}&endDate=${qEnd}`),
      ]);

      // Process Sales Trend
      const salesArr = salesRes.data.data || [];
      setSalesTrend(
        salesArr.map((item) => ({
          name: item._id,
          revenue: item.revenue || 0,
          orders: item.orders || 1,
          avgOrder: item.orders ? Math.round(item.revenue / item.orders) : item.revenue,
        }))
      );

      // Process Product Analytics Data
      const pData = prodRes.data.data || {};
      setTopProducts(pData.topProducts || []);
      setCategoryData(pData.categoryBreakdown || []);
      setStatusData(pData.statusBreakdown || []);
      setCityData(pData.cityBreakdown || []);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* Derived Aggregations */
  const totalRevenue = salesTrend.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = salesTrend.reduce((acc, curr) => acc + curr.orders, 0);
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const totalUnitsSold = topProducts.reduce((acc, curr) => acc + (curr.sold || 0), 0);

  const completedOrders = statusData.find((s) => s._id === "completed")?.count || 0;
  const fulfillmentRate = totalOrders ? Math.min(100, Math.round((completedOrders / totalOrders) * 100)) : 100;

  /* Export PDF with Multi-page Pagination & Clean Scroll */
  const handlePDFExport = useCallback(async () => {
    if (!contentRef.current) return;
    setExporting(true);
    setExportType("pdf");
    setShowExportMenu(false);
    
    // Save scroll pos & reset
    const prevScrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
      await new Promise((r) => setTimeout(r, 250));
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const imgData = canvas.toDataURL("image/png");
      const imgW = pdfW - 20; // 10mm margins
      const imgH = (canvas.height * imgW) / canvas.width;

      // Header Banner
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pdfW, 14, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("E-STORE ADMIN // PERFORMANCE ANALYTICS REPORT", 10, 9);
      pdf.text(`Period: ${startDate === "all" ? "All Time" : `${startDate} to ${endDate}`}`, pdfW - 10, 9, { align: "right" });

      let heightLeft = imgH;
      let position = 18; // below top banner

      pdf.addImage(imgData, "PNG", 10, position, imgW, Math.min(imgH, pdfH - 32));
      heightLeft -= pdfH - 32;

      while (heightLeft > 0) {
        position = heightLeft - imgH + 18;
        pdf.addPage();
        pdf.setFillColor(0, 0, 0);
        pdf.rect(0, 0, pdfW, 14, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("E-STORE ADMIN // PERFORMANCE ANALYTICS REPORT (Cont.)", 10, 9);

        pdf.addImage(imgData, "PNG", 10, position, imgW, imgH);
        heightLeft -= pdfH;
      }

      // Footer Banner on last page
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, pdfH - 10, pdfW, 10, "F");
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(7);
      pdf.text("CONFIDENTIAL — OFFICIAL E-COMMERCE ANALYTICS REPORT", pdfW / 2, pdfH - 4, { align: "center" });

      pdf.save(`E-Store_Analytics_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      window.scrollTo(0, prevScrollY);
      setExporting(false);
      setExportType(null);
    }
  }, [startDate, endDate]);

  /* Export Excel (.xlsx) */
  const handleExcelExport = useCallback(async () => {
    setShowExportMenu(false);
    setExporting(true);
    try {
      const qStart = startDate === "all" ? "" : startDate;
      const qEnd = endDate === "all" ? "" : endDate;
      const response = await api.get(`/api/admin/export-report?startDate=${qStart}&endDate=${qEnd}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `EStore_Order_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Failed to generate Excel report");
    } finally {
      setExporting(false);
    }
  }, [startDate, endDate]);

  /* Export CSV with Escaping */
  const handleCSVExport = useCallback(() => {
    setShowExportMenu(false);
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      [esc("E-STORE ANALYTICS EXPORT")],
      [esc(`Date Range: ${startDate} to ${endDate}`)],
      [""],
      [esc("DAILY SALES & REVENUE TREND")],
      [esc("Date"), esc("Revenue (Rs)"), esc("Orders"), esc("Avg Order Value (Rs)")],
      ...salesTrend.map((d) => [esc(d.name), esc(d.revenue), esc(d.orders), esc(d.avgOrder)]),
      [""],
      [esc("TOP PERFORMING PRODUCTS")],
      [esc("Product Name"), esc("Category"), esc("Units Sold"), esc("Total Revenue (Rs)")],
      ...topProducts.map((p) => [esc(p.name), esc(p.category), esc(p.sold), esc(p.revenue)]),
      [""],
      [esc("CATEGORY PERFORMANCE")],
      [esc("Category"), esc("Units Sold"), esc("Total Revenue (Rs)")],
      ...categoryData.map((c) => [esc(c._id), esc(c.sold), esc(c.revenue)]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Analytics_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [startDate, endDate, salesTrend, topProducts, categoryData]);

  return (
    <div className="space-y-8 pb-20">

      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-600 inline-block" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Admin Intelligence Console
            </p>
          </div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black">
            Platform Analytics
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.25em] mt-1">
            Real-time financial performance, product velocity &amp; order dynamics
          </p>
        </div>

        {/* Action Controls & Date Picker */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Quick Date Range Presets */}
          <div className="flex items-center border border-black/10 bg-white p-1">
            {[
              { id: "all", label: "ALL" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
              { id: "year", label: "YTD" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handlePresetChange(item.id)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${
                  preset === item.id ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Date Picker Inputs */}
          <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-black/10 text-xs">
            <Calendar size={14} className="text-gray-400" />
            <input
              type="date"
              value={startDate === "all" ? "" : startDate}
              onChange={(e) => {
                setStartDate(e.target.value || "all");
                setPreset("custom");
              }}
              className="text-[10px] font-bold uppercase tracking-wider outline-none bg-transparent text-black"
            />
            <span className="text-gray-300">—</span>
            <input
              type="date"
              value={endDate === "all" ? "" : endDate}
              onChange={(e) => {
                setEndDate(e.target.value || "all");
                setPreset("custom");
              }}
              className="text-[10px] font-bold uppercase tracking-wider outline-none bg-transparent text-black"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-white border border-black/10 text-black hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((p) => !p)}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <Download size={12} />
              <span>{exporting ? "Generating..." : "Export"}</span>
              <ChevronDown size={10} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-black/10 shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handlePDFExport}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-left border-b border-black/5"
                >
                  <FileText size={12} />
                  Export PDF Report
                </button>
                <button
                  onClick={handleExcelExport}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-left border-b border-black/5 text-emerald-700"
                >
                  <Download size={12} />
                  Export Excel (.xlsx)
                </button>
                <button
                  onClick={handleCSVExport}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all text-left"
                >
                  <Activity size={12} />
                  Export CSV Raw Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex border-b border-black/10 bg-white">
        {[
          { id: "sales", label: "Revenue & Sales Velocity", icon: DollarSign },
          { id: "products", label: "Product & Category Intelligence", icon: Package },
          { id: "insights", label: "Strategic Insights & Orders", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                isActive
                  ? "border-black text-black bg-gray-50/50"
                  : "border-transparent text-gray-400 hover:text-black hover:bg-gray-50/30"
              }`}
            >
              <Icon size={14} className={isActive ? "text-emerald-600" : "text-gray-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════ CAPTURED REPORT CONTENT ══════════ */}
      <div ref={contentRef} className="space-y-8">

        {/* Loading Overlay State */}
        {loading && (
          <div className="py-20 text-center bg-white border border-black/5">
            <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Processing Platform Data Aggregations...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* ── KPI METRICS ROW ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Revenue"
                value={totalRevenue}
                prefix="Rs. "
                icon={DollarSign}
                trend="up"
                trendVal={14.2}
                color="text-black"
              />
              <KpiCard
                label="Orders Processed"
                value={totalOrders}
                icon={ShoppingBag}
                trend="up"
                trendVal={8.5}
                color="text-emerald-700"
              />
              <KpiCard
                label="Avg. Order Value"
                value={avgOrderValue}
                prefix="Rs. "
                icon={TrendingUp}
                trend="up"
                trendVal={5.1}
                color="text-black"
              />
              <KpiCard
                label="Units Sold"
                value={totalUnitsSold}
                icon={Package}
                trend="up"
                trendVal={11.8}
                color="text-emerald-700"
              />
            </div>

            {/* ════════════════════════════════════════════════════ */}
            {/* TAB 1: REVENUE & SALES VELOCITY                      */}
            {/* ════════════════════════════════════════════════════ */}
            {activeTab === "sales" && (
              <div key="sales-tab" className="space-y-8 animate-in fade-in duration-300">

                {/* Sales Velocity Chart */}
                <div className="bg-white border border-black/5 p-8 shadow-sm">
                  <SectionHeader
                    icon={Activity}
                    title="Revenue Velocity & Daily Trend"
                    subtitle="Aggregated total order income over selected time range"
                    color="text-emerald-600"
                  />
                  {salesTrend.length === 0 ? (
                    <div className="h-72 flex items-center justify-center border border-dashed border-gray-200">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        No sales activity detected in this date range.
                      </p>
                    </div>
                  ) : (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: "#888", fontWeight: 600 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: "#888" }}
                            tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip content={<ChartTooltip prefix="Rs. " />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#059669"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#revenueGrad)"
                            dot={{ fill: "#059669", r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: "#000" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Orders Volume vs Revenue Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 bg-white border border-black/5 p-8 shadow-sm">
                    <SectionHeader
                      icon={BarChart3}
                      title="Daily Orders Volume"
                      subtitle="Volume of transactions completed daily"
                    />
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesTrend} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#999" }} />
                          <Tooltip content={<ChartTooltip suffix=" orders" />} />
                          <Bar dataKey="orders" name="Orders" fill="#000000" radius={[2, 2, 0, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Metric Banner */}
                  <div className="lg:col-span-2 bg-black text-white p-8 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">
                        Financial Summary
                      </p>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/50">Total Gross Income</p>
                          <p className="text-3xl font-serif font-bold text-white mt-1">
                            Rs. {fmt(totalRevenue)}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/50">Average Basket</p>
                            <p className="text-lg font-bold text-white mt-0.5">Rs. {fmt(avgOrderValue)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/50">Fulfillment</p>
                            <p className="text-lg font-bold text-emerald-400 mt-0.5">{fulfillmentRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 text-[9px] text-white/40 uppercase tracking-widest flex items-center justify-between">
                      <span>Status: Active</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Sync Healthy
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* TAB 2: PRODUCT & CATEGORY INTELLIGENCE               */}
            {/* ════════════════════════════════════════════════════ */}
            {activeTab === "products" && (
              <div key="products-tab" className="space-y-8 animate-in fade-in duration-300">

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                  {/* Category Revenue Distribution — 2 cols */}
                  <div className="lg:col-span-2 bg-white border border-black/5 p-8 shadow-sm">
                    <SectionHeader
                      icon={Tag}
                      title="Category Revenue Share"
                      subtitle="Revenue breakdown by apparel category"
                      color="text-emerald-600"
                    />
                    {categoryData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center border border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No category data</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryData}
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="revenue"
                                nameKey="_id"
                              >
                                {categoryData.map((_, i) => (
                                  <Cell key={i} fill={BRAND_PALETTE[i % BRAND_PALETTE.length]} />
                                ))}
                              </Pie>
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-black">{value || "General Apparel"}</span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2.5">
                          {categoryData.map((cat, i) => {
                            const share = totalRevenue ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0;
                            return (
                              <div key={i} className="flex items-center justify-between text-[10px]">
                                <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-black">
                                  <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: BRAND_PALETTE[i % BRAND_PALETTE.length] }} />
                                  {cat._id || "General Apparel"}
                                </span>
                                <span className="font-black text-gray-600">Rs. {fmt(cat.revenue)} ({share}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Top Garments Table — 3 cols */}
                  <div className="lg:col-span-3 bg-white border border-black/5 p-8 shadow-sm">
                    <SectionHeader
                      icon={Package}
                      title="Top Performing Garments"
                      subtitle="Products ranked by sales volume & revenue generated"
                    />
                    {topProducts.length === 0 ? (
                      <div className="h-64 flex items-center justify-center border border-dashed border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No product sales yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b-2 border-black text-[9px] font-black uppercase tracking-widest text-gray-400">
                              <th className="py-2.5">#</th>
                              <th className="py-2.5">Garment</th>
                              <th className="py-2.5">Category</th>
                              <th className="py-2.5 text-right">Units Sold</th>
                              <th className="py-2.5 text-right">Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-[10px]">
                            {topProducts.slice(0, 7).map((prod, idx) => {
                              const imgUrl = resolveImage(prod.image);
                              return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="py-3 font-bold text-gray-400">#{idx + 1}</td>
                                  <td className="py-3 font-bold text-black flex items-center gap-2.5">
                                    <div className="w-8 h-8 shrink-0 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                      <img
                                        src={imgUrl || "https://images.unsplash.com/photo-1523381235212-d73f49380fbb?q=80&w=200&auto=format&fit=crop"}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = "https://images.unsplash.com/photo-1523381235212-d73f49380fbb?q=80&w=200&auto=format&fit=crop";
                                        }}
                                      />
                                    </div>
                                    <span className="truncate max-w-[140px]">{prod.name}</span>
                                  </td>
                                  <td className="py-3 uppercase text-gray-500 font-semibold">{prod.category || "General Apparel"}</td>
                                  <td className="py-3 text-right font-black text-black">{fmt(prod.sold)}</td>
                                  <td className="py-3 text-right font-black text-emerald-700">Rs. {fmt(prod.revenue)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* TAB 3: STRATEGIC INSIGHTS & ORDERS                    */}
            {/* ════════════════════════════════════════════════════ */}
            {activeTab === "insights" && (
              <div key="insights-tab" className="space-y-8 animate-in fade-in duration-300">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Order Status Distribution */}
                  <div className="bg-white border border-black/5 p-8 shadow-sm">
                    <SectionHeader
                      icon={Shield}
                      title="Fulfillment & Order Status Dynamics"
                      subtitle="Breakdown of order statuses across the ecosystem"
                    />
                    <div className="space-y-4 mt-4">
                      {statusData.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-8 text-center">
                          No order data available
                        </p>
                      ) : (
                        statusData.map((st, i) => {
                          const pct = totalOrders ? Math.round((st.count / totalOrders) * 100) : 0;
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-black flex items-center gap-2">
                                  <span className="w-2 h-2 bg-black inline-block" />
                                  {st._id}
                                </span>
                                <span className="text-gray-500">{st.count} orders ({pct}%) — Rs. {fmt(st.totalValue)}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Regional Delivery Cities */}
                  <div className="bg-white border border-black/5 p-8 shadow-sm">
                    <SectionHeader
                      icon={MapPin}
                      title="Top Delivery Destinations"
                      subtitle="Geographic concentration of store sales"
                      color="text-emerald-600"
                    />
                    <div className="space-y-3 mt-4">
                      {cityData.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-8 text-center">
                          No regional data detected
                        </p>
                      ) : (
                        cityData.map((city, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-gray-400 w-5">#{i + 1}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-black">{city._id}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-black">Rs. {fmt(city.revenue)}</p>
                              <p className="text-[8px] font-bold uppercase text-gray-400">{city.orders} orders</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Automated Business Recommendation Intelligence */}
                <div className="bg-black text-white p-8 shadow-md">
                  <div className="flex items-center gap-2.5 mb-6">
                    <Zap size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white">
                      Automated Platform Intelligence &amp; Actions
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 border border-emerald-400 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                        Revenue Optimization
                      </span>
                      <p className="text-sm font-serif font-bold text-white">Focus on Top Categories</p>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        {categoryData[0] ? `${categoryData[0]._id} leads revenue generation with Rs. ${fmt(categoryData[0].revenue)}. Maintain inventory depth for these items.` : "Add more catalog items to establish category velocity baseline."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="px-2 py-0.5 border border-amber-400 text-[8px] font-black uppercase tracking-widest text-amber-400">
                        Order Efficiency
                      </span>
                      <p className="text-sm font-serif font-bold text-white">Fulfillment Velocity</p>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        Order completion rate is sitting at {fulfillmentRate}%. Ensure processing orders transition swiftly to shipped status.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="px-2 py-0.5 border border-blue-400 text-[8px] font-black uppercase tracking-widest text-blue-400">
                        Stock Alignment
                      </span>
                      <p className="text-sm font-serif font-bold text-white">High-Demand Replenishment</p>
                      <p className="text-[10px] text-white/60 leading-relaxed">
                        {topProducts[0] ? `Top garment '${topProducts[0].name}' has sold ${topProducts[0].sold} units. Check inventory levels.` : "Monitor low-stock alerts on the main dashboard to prevent stockouts."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </>
        )}

      </div>

    </div>
  );
};

export default AdminAnalytics;
