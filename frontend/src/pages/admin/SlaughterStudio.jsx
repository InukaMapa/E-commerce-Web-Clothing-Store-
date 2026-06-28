import React, { useState, useEffect, useCallback } from "react";
import {
  Palette,
  RotateCw,
  Search,
  ChevronDown,
  ChevronUp,
  Hash,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  Shirt,
} from "lucide-react";
import api from "../../api/axios";

// ── Status Config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:         { label: "Pending",       bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200"  },
  "in-production": { label: "In Production", bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200"   },
  completed:       { label: "Completed",     bg: "bg-green-50",   text: "text-green-600",   border: "border-green-200"  },
  rejected:        { label: "Rejected",      bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200"    },
};
const ALL_STATUSES = ["pending", "in-production", "completed", "rejected"];

function StatusIcon({ status, size = 12 }) {
  if (status === "completed")     return <CheckCircle size={size} />;
  if (status === "rejected")      return <XCircle     size={size} />;
  if (status === "in-production") return <Layers      size={size} />;
  return <Clock size={size} />;
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function MiniStat({ label, value, dark = false }) {
  return (
    <div className={`px-6 py-5 border ${dark ? "bg-black text-white border-black" : "bg-white text-black border-gray-100"}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${dark ? "text-white/40" : "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-serif font-bold ${dark ? "text-white" : "text-black"}`}>{value}</p>
    </div>
  );
}

// ── Side Preview Card ──────────────────────────────────────────────────────
function SidePreview({ label, src, onClick }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{label} Side</p>
      {src ? (
        <button
          onClick={onClick}
          className="relative w-full aspect-[4/5] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 hover:ring-2 hover:ring-black transition-all rounded cursor-zoom-in group"
          title={`Click to enlarge ${label} preview`}
        >
          <img src={src} alt={`${label} side preview`} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white text-[8px] font-black uppercase tracking-widest bg-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Enlarge
            </span>
          </div>
        </button>
      ) : (
        <div className="w-full aspect-[4/5] bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 rounded">
          <Shirt size={24} className="text-gray-200" />
          <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">No design</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const SlaughterStudio = () => {
  const [designs, setDesigns]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded]         = useState(null);
  const [lastFetched, setLastFetched]   = useState(null);
  const [updatingId, setUpdatingId]     = useState(null);
  const [previewModal, setPreviewModal] = useState(null); // { src, label }

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchDesigns = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/custom-designs");
      setDesigns(Array.isArray(res.data?.data) ? res.data.data : []);
      setLastFetched(new Date());
    } catch (err) {
      setError("Failed to load designs. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
    const interval = setInterval(() => fetchDesigns(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDesigns]);

  // ── Status Update ──────────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/api/admin/custom-designs/${id}/status`, { status });
      setDesigns(prev =>
        prev.map(d => d._id === id ? { ...d, status: res.data.data?.status || status } : d)
      );
    } catch (err) {
      alert("Status update failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived Stats ──────────────────────────────────────────────────────
  const stats = {
    total:        designs.length,
    pending:      designs.filter(d => d.status === "pending").length,
    inProduction: designs.filter(d => d.status === "in-production").length,
    completed:    designs.filter(d => d.status === "completed").length,
  };

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = designs.filter(d => {
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      d._id?.toLowerCase().includes(term) ||
      d.user?.name?.toLowerCase().includes(term) ||
      d.user?.email?.toLowerCase().includes(term) ||
      d.tshirtColor?.toLowerCase().includes(term) ||
      d.size?.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 bg-gray-100" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-50 border border-gray-100" />)}
        </div>
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-50 border border-gray-100" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-xs font-black uppercase text-red-500 mb-6">{error}</p>
        <button
          onClick={() => fetchDesigns()}
          className="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
              <Palette size={16} />
            </div>
            <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black">
              Slaughter Studio
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Custom design submissions · {designs.length} total
            {lastFetched && ` · Updated ${lastFetched.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={() => fetchDesigns(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-all self-start"
        >
          <RotateCw size={12} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ─── Stat Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Total Designs" value={stats.total}        dark />
        <MiniStat label="Pending"       value={stats.pending}       />
        <MiniStat label="In Production" value={stats.inProduction}  />
        <MiniStat label="Completed"     value={stats.completed}     />
      </div>

      {/* ─── Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, customer, color…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-50 p-1 border border-gray-100">
          {["all", ...ALL_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                filterStatus === s ? "bg-black text-white" : "text-gray-400 hover:text-black"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Empty State ─── */}
      {filtered.length === 0 ? (
        <div className="py-32 text-center border border-dashed border-gray-200">
          <Shirt size={36} className="mx-auto text-gray-200 mb-5" />
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
            {searchTerm || filterStatus !== "all"
              ? "No designs match your filters."
              : "No custom designs submitted yet. They will appear here when customers send designs to production."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(design => {
            const cfg        = STATUS_CONFIG[design.status] || STATUS_CONFIG.pending;
            const isExpanded = expanded === design._id;
            const isUpdating = updatingId === design._id;

            const frontSrc = design.frontPreviewImage || (design.designs?.front ? design.previewImage : "");
            const backSrc  = design.backPreviewImage  || "";
            const hasFront = !!frontSrc;
            const hasBack  = !!backSrc;
            const printSides = [hasFront && "Front", hasBack && "Back"].filter(Boolean).join(" + ") || "—";

            return (
              <div key={design._id} className="bg-white border border-gray-100 hover:border-gray-300 transition-all overflow-hidden">

                {/* ── Collapsed Row ── */}
                <div
                  className="flex items-center justify-between px-6 py-5 cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : design._id)}
                >
                  {/* Dual-side thumbnail strip */}
                  <div className="flex items-center gap-4 flex-1 flex-wrap">
                    {/* Front + Back thumbnail pair */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Front thumb */}
                      <div className="relative">
                        {frontSrc ? (
                          <img
                            src={frontSrc}
                            alt="Front"
                            className="w-12 h-14 object-contain border border-gray-100 bg-gray-50 rounded"
                          />
                        ) : (
                          <div className="w-12 h-14 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
                            <Shirt size={14} className="text-gray-200" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-black text-white text-[7px] font-black px-1 rounded-sm leading-tight">F</span>
                      </div>
                      {/* Divider */}
                      <div className="w-px h-10 bg-gray-100 mx-1" />
                      {/* Back thumb */}
                      <div className="relative">
                        {backSrc ? (
                          <img
                            src={backSrc}
                            alt="Back"
                            className="w-12 h-14 object-contain border border-gray-100 bg-gray-50 rounded"
                          />
                        ) : (
                          <div className="w-12 h-14 bg-gray-50 border border-dashed border-gray-200 rounded flex items-center justify-center">
                            <Shirt size={14} className="text-gray-200" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[7px] font-black px-1 rounded-sm leading-tight">B</span>
                      </div>
                    </div>

                    {/* Design ID */}
                    <div className="min-w-[100px]">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Design ID</p>
                      <p className="text-xs font-black font-mono text-black flex items-center gap-1">
                        <Hash size={11} className="text-gray-300" />
                        {design._id?.slice(-10).toUpperCase()}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="min-w-[120px]">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Customer</p>
                      <p className="text-xs font-bold text-black">{design.user?.name || "—"}</p>
                      <p className="text-[9px] text-gray-400">{design.user?.email || "—"}</p>
                    </div>

                    {/* Garment specs */}
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Garment</p>
                      <p className="text-[10px] font-bold text-black uppercase">
                        {design.tshirtColor} Tee · {design.size} · Qty {design.quantity}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">Print: {printSides}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">Submitted</p>
                      <p className="text-[10px] font-bold text-gray-600">
                        {new Date(design.submittedAt || design.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status + chevron */}
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <StatusIcon status={design.status} />
                      {cfg.label}
                    </span>
                    {isExpanded
                      ? <ChevronUp   size={16} className="text-gray-400" />
                      : <ChevronDown size={16} className="text-gray-400" />
                    }
                  </div>
                </div>

                {/* ── Expanded Detail Panel ── */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-6 py-8">

                    {/* ─ UNIFIED PRODUCT VIEW: Both sides side-by-side ─ */}
                    <div className="mb-8">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-5">
                        Complete Design — Front &amp; Back (Single Product)
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                        <SidePreview
                          label="Front"
                          src={frontSrc}
                          onClick={() => setPreviewModal({ src: frontSrc, label: "Front Side" })}
                        />
                        <SidePreview
                          label="Back"
                          src={backSrc}
                          onClick={() => backSrc && setPreviewModal({ src: backSrc, label: "Back Side" })}
                        />
                      </div>

                      {/* Combined indicator */}
                      <div className="mt-5 inline-flex items-center gap-2 bg-black text-white px-4 py-2">
                        <Shirt size={12} />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                          1 Product · {printSides} Print · {design.tshirtColor} {design.size} Tee · Qty {design.quantity}
                        </span>
                      </div>
                    </div>

                    {/* ─ Bottom row: specs table + status actions ─ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* Order Specs Table */}
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Order Specifications</p>
                        <div className="space-y-0 border border-gray-100">
                          {[
                            { label: "Garment Color", value: design.tshirtColor  },
                            { label: "Size",          value: design.size          },
                            { label: "Quantity",      value: design.quantity       },
                            { label: "Print Sides",   value: printSides           },
                            { label: "Customer",      value: design.user?.name || "—" },
                            { label: "Email",         value: design.user?.email || "—" },
                            { label: "Submitted At",  value: new Date(design.submittedAt || design.createdAt).toLocaleString() },
                          ].map(({ label, value }, i) => (
                            <div key={label} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                              <span className="text-[10px] font-bold text-black uppercase">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Update Production Status</p>

                        {/* Current status badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 border mb-5 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <StatusIcon status={design.status} size={13} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Current: {cfg.label}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {ALL_STATUSES.filter(s => s !== design.status).map(s => {
                            const c = STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => updateStatus(design._id, s)}
                                disabled={isUpdating}
                                className={`flex items-center gap-1.5 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest border transition-all disabled:opacity-40
                                  ${s === "rejected"
                                    ? "border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500"
                                    : s === "completed"
                                    ? "border-green-200 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500"
                                    : s === "in-production"
                                    ? "border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                    : "border-gray-200 text-gray-500 hover:bg-black hover:text-white hover:border-black"
                                  }`}
                              >
                                {isUpdating
                                  ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  : <StatusIcon status={s} />
                                }
                                {c.label}
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-6 leading-relaxed">
                          Changing status will update the production workflow for this custom piece.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Full-Screen Preview Modal ─── */}
      {previewModal && (
        <div
          className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-8"
          onClick={() => setPreviewModal(null)}
        >
          <div className="relative max-w-md w-full" onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute -top-5 -right-5 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-black text-lg hover:bg-gray-100 transition-colors z-10 shadow-2xl"
            >
              ×
            </button>
            {/* Label */}
            <p className="text-white/50 text-[9px] font-black uppercase tracking-[0.4em] mb-3 text-center">
              {previewModal.label}
            </p>
            <img
              src={previewModal.src}
              alt={previewModal.label}
              className="w-full rounded-lg shadow-2xl border border-white/10"
            />
            <p className="text-center text-white/30 text-[9px] font-black uppercase tracking-widest mt-4">
              Click outside to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlaughterStudio;
