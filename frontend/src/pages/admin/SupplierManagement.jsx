import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Star,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  Download,
  Truck,
  Scissors,
  FileText,
  ChevronRight,
  Info,
  Calendar,
  DollarSign,
  Package,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import api from "../../api/axios";

// Static mock data for charts
const COST_TREND_DATA = [
  { name: "Jan", Fabric: 18000, Accessories: 12000, Packaging: 5000 },
  { name: "Feb", Fabric: 22000, Accessories: 14000, Packaging: 6000 },
  { name: "Mar", Fabric: 30000, Accessories: 15000, Packaging: 5500 },
  { name: "Apr", Fabric: 25000, Accessories: 17000, Packaging: 7000 },
  { name: "May", Fabric: 35000, Accessories: 20000, Packaging: 8000 },
  { name: "Jun", Fabric: 45000, Accessories: 24000, Packaging: 10000 }
];

const CATEGORY_DISTRIBUTION = [
  { name: "Fabric", value: 55 },
  { name: "Accessories", value: 35 },
  { name: "Packaging", value: 10 }
];

const SupplierManagement = ({ activeTab: initialTab = "suppliers" }) => {

  // Unified Backend State System
  const [activeTab, setActiveTab] = useState(initialTab);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Search & Filter States
  const [searchSupplier, setSearchSupplier] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [searchMaterial, setSearchMaterial] = useState("");
  const [filterMatCategory, setFilterMatCategory] = useState("All");
  const [filterMatStatus, setFilterMatStatus] = useState("All");

  const [searchPO, setSearchPO] = useState("");
  const [filterPOStatus, setFilterPOStatus] = useState("All");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  
  // Modal Fields (Supplier Info)
  const [editingId, setEditingId] = useState("");
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formPhoneNumber, setFormPhoneNumber] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formMaterialCategory, setFormMaterialCategory] = useState("Fabric");
  const [formSuppliedMaterials, setFormSuppliedMaterials] = useState("");
  const [formPaymentTerms, setFormPaymentTerms] = useState("Net 30");
  const [formStatus, setFormStatus] = useState("Active");

  // Extended Sourcing/Raw Material Fields (only for Add Supplier)
  const [formRawMaterialName, setFormRawMaterialName] = useState("");
  const [formUnit, setFormUnit] = useState("Meter");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formInitialPayment, setFormInitialPayment] = useState("");

  // Standalone Purchase Order Form State
  const [poSupplier, setPoSupplier] = useState("");
  const [poMaterial, setPoMaterial] = useState("");
  const [poUnit, setPoUnit] = useState("Meter");
  const [poUnitPrice, setPoUnitPrice] = useState("");
  const [poQuantity, setPoQuantity] = useState(100);
  const [poInitialPayment, setPoInitialPayment] = useState("");
  const [poExpectedDate, setPoExpectedDate] = useState("");

  // Pay Modal State
  const [selectedPOForPayment, setSelectedPOForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Fetch all data from backend
  const fetchData = async () => {
    try {
      const [suppliersRes, materialsRes, POsRes] = await Promise.all([
        api.get("/api/admin/suppliers"),
        api.get("/api/admin/raw-materials"),
        api.get("/api/admin/purchase-orders")
      ]);

      if (suppliersRes.data.success) {
        const mappedSuppliers = suppliersRes.data.data.map(s => ({
          ...s,
          id: s._id,
          performance: s.performance || {
            totalOrders: 12,
            successfulDeliveries: 12,
            lateDeliveries: 0,
            qualityRating: 5.0
          }
        }));
        setSuppliers(mappedSuppliers);
      }

      if (materialsRes.data.success) {
        const mappedMaterials = materialsRes.data.data.map(m => ({
          ...m,
          id: m._id,
          supplier: m.supplierName,
        }));
        setMaterials(mappedMaterials);
      }

      if (POsRes.data.success) {
        const mappedPOs = POsRes.data.data.map(po => ({
          ...po,
          id: po._id,
          supplier: po.supplierName,
          materialName: po.rawMaterialName,
          orderDate: po.createdAt ? new Date(po.createdAt).toISOString().split("T")[0] : "",
          expectedDelivery: po.expectedDelivery || (po.createdAt ? new Date(new Date(po.createdAt).getTime() + 7*24*60*60*1000).toISOString().split("T")[0] : ""),
          deliveryStatus: po.deliveryStatus || "Delivered"
        }));
        setPurchaseOrders(mappedPOs);
      }
    } catch (err) {
      console.error("Error loading procurement data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch supplier detailed stats and history when selected
  useEffect(() => {
    if (selectedSupplier) {
      const fetchDetails = async () => {
        try {
          setLoadingDetails(true);
          const res = await api.get(`/api/admin/suppliers/${selectedSupplier.id || selectedSupplier._id}`);
          if (res.data.success) {
            setSelectedSupplierDetails(res.data.data);
          }
        } catch (err) {
          console.error("Error loading supplier details:", err);
        } finally {
          setLoadingDetails(false);
        }
      };
      fetchDetails();
    } else {
      setSelectedSupplierDetails(null);
    }
  }, [selectedSupplier]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Helper Counters
  const totalSuppliersCount = suppliers.length;
  const activeSuppliersCount = suppliers.filter(s => s.status === "Active").length;
  const rawMaterialsCount = materials.length;
  const pendingDeliveriesCount = purchaseOrders.filter(po => po.deliveryStatus !== "Delivered").length;
  const lowStockAlerts = materials.filter(m => m.stockStatus === "Low Stock" || m.stockStatus === "Out of Stock");

  // Filters logic
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      (s.name || "").toLowerCase().includes(searchSupplier.toLowerCase()) ||
      (s.companyName || "").toLowerCase().includes(searchSupplier.toLowerCase()) ||
      (s.id || "").toLowerCase().includes(searchSupplier.toLowerCase()) ||
      (s.contactPerson || "").toLowerCase().includes(searchSupplier.toLowerCase());
    const matchesCategory = filterCategory === "All" || s.materialCategory === filterCategory;
    const matchesStatus = filterStatus === "All" || s.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchMaterial.toLowerCase()) ||
      (m.id || "").toLowerCase().includes(searchMaterial.toLowerCase()) ||
      (m.supplier || "").toLowerCase().includes(searchMaterial.toLowerCase());
    const matchesCategory = filterMatCategory === "All" || m.category === filterMatCategory;
    const matchesStatus = filterMatStatus === "All" || m.stockStatus === filterMatStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      (po.poNumber || "").toLowerCase().includes(searchPO.toLowerCase()) ||
      (po.supplier || "").toLowerCase().includes(searchPO.toLowerCase()) ||
      (po.materialName || "").toLowerCase().includes(searchPO.toLowerCase());
    const matchesStatus = filterPOStatus === "All" || po.paymentStatus === filterPOStatus;
    return matchesSearch && matchesStatus;
  });

  // Activate/Deactivate Toggle
  const toggleSupplierStatus = async (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    const newStatus = supplier.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await api.post("/api/admin/suppliers", {
        id: supplier._id,
        name: supplier.name,
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        status: newStatus
      });
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // Delete Action
  const deleteSupplier = async (id) => {
    if (confirm(`Are you sure you want to delete supplier ${id}?`)) {
      try {
        const res = await api.delete(`/api/admin/suppliers/${id}`);
        if (res.data.success) {
          alert("Supplier deleted successfully.");
          if (selectedSupplier && (selectedSupplier.id === id || selectedSupplier._id === id)) {
            setSelectedSupplier(null);
          }
          fetchData();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete supplier");
      }
    }
  };

  // Open Modal for Add
  const openAddModal = () => {
    setModalMode("add");
    setEditingId("");
    setFormSupplierName("");
    setFormCompanyName("");
    setFormContactPerson("");
    setFormPhoneNumber("");
    setFormEmail("");
    setFormAddress("");
    setFormMaterialCategory("Fabric");
    setFormSuppliedMaterials("");
    setFormPaymentTerms("Net 30");
    setFormStatus("Active");
    
    // Clear raw material states
    setFormRawMaterialName("");
    setFormUnit("Meter");
    setFormUnitPrice("");
    setFormQuantity("");
    setFormInitialPayment("");

    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (supplier) => {
    setModalMode("edit");
    setEditingId(supplier.id);
    setFormSupplierName(supplier.name);
    setFormCompanyName(supplier.companyName);
    setFormContactPerson(supplier.contactPerson);
    setFormPhoneNumber(supplier.phoneNumber);
    setFormEmail(supplier.email);
    setFormAddress(supplier.address);
    setFormMaterialCategory(supplier.materialCategory);
    setFormSuppliedMaterials(supplier.suppliedMaterials);
    setFormPaymentTerms(supplier.paymentTerms);
    setFormStatus(supplier.status);
    setIsModalOpen(true);
  };

  // Save Supplier
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!formSupplierName || !formCompanyName || !formContactPerson || !formEmail) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      id: modalMode === "edit" ? editingId : undefined,
      name: formSupplierName,
      companyName: formCompanyName,
      contactPerson: formContactPerson,
      phoneNumber: formPhoneNumber,
      email: formEmail,
      address: formAddress,
      materialCategory: formMaterialCategory,
      suppliedMaterials: formSuppliedMaterials,
      paymentTerms: formPaymentTerms,
      status: formStatus,
    };

    if (modalMode === "add") {
      if (!formRawMaterialName || !formUnitPrice || !formQuantity) {
        alert("Raw material purchase details (Name, Unit Price, and Quantity) are required to register a supplier.");
        return;
      }
      if (Number(formUnitPrice) < 0 || Number(formQuantity) <= 0 || Number(formInitialPayment || 0) < 0) {
        alert("Prices and quantities must be positive. Quantity must be greater than zero.");
        return;
      }
      if (Number(formInitialPayment || 0) > (Number(formUnitPrice) * Number(formQuantity))) {
        alert("Initial payment cannot exceed the total purchase order amount.");
        return;
      }
      payload.rawMaterialName = formRawMaterialName;
      payload.unit = formUnit;
      payload.unitPrice = Number(formUnitPrice);
      payload.quantity = Number(formQuantity);
      payload.initialPayment = Number(formInitialPayment || 0);
    }

    try {
      const res = await api.post("/api/admin/suppliers", payload);
      if (res.data.success) {
        alert(modalMode === "add" ? "Supplier registered successfully!" : "Supplier details updated successfully!");
        setIsModalOpen(false);
        // Reset supplier registration fields
        setFormSupplierName("");
        setFormCompanyName("");
        setFormContactPerson("");
        setFormPhoneNumber("");
        setFormEmail("");
        setFormAddress("");
        setFormMaterialCategory("Fabric");
        setFormSuppliedMaterials("");
        setFormPaymentTerms("Net 30");
        setFormStatus("Active");
        // Reset raw material fields
        setFormRawMaterialName("");
        setFormUnit("Meter");
        setFormUnitPrice("");
        setFormQuantity("");
        setFormInitialPayment("");
        
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save supplier details");
    }
  };

  // Create Standalone Purchase Order Form Submit
  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!poSupplier || !poMaterial || !poQuantity || !poUnit || !poUnitPrice) {
      alert("Please fill in all PO fields.");
      return;
    }

    const selectedVendor = suppliers.find(s => s.name === poSupplier);
    if (!selectedVendor) {
      alert("Please select a valid supplier.");
      return;
    }

    if (Number(poUnitPrice) < 0 || Number(poQuantity) <= 0 || Number(poInitialPayment || 0) < 0) {
      alert("Unit price and quantity must be positive. Quantity must be greater than zero.");
      return;
    }

    if (Number(poInitialPayment || 0) > (Number(poUnitPrice) * Number(poQuantity))) {
      alert("Initial payment cannot exceed the total purchase order amount.");
      return;
    }

    const payload = {
      supplierId: selectedVendor._id,
      rawMaterialName: poMaterial,
      unit: poUnit,
      unitPrice: Number(poUnitPrice),
      quantity: Number(poQuantity),
      initialPayment: Number(poInitialPayment || 0)
    };

    try {
      const res = await api.post("/api/admin/purchase-orders", payload);
      if (res.data.success) {
        alert("Purchase Order created successfully!");
        setIsPOModalOpen(false);
        // Reset standalone PO fields
        setPoSupplier("");
        setPoMaterial("");
        setPoUnit("Meter");
        setPoUnitPrice("");
        setPoQuantity(100);
        setPoInitialPayment("");
        setPoExpectedDate("");
        
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create Sourcing Order");
    }
  };

  // Add Supplier Payment Update
  const handleAddPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPOForPayment || !paymentAmount) {
      alert("Please enter a payment amount.");
      return;
    }

    const amount = Number(paymentAmount);
    if (amount <= 0) {
      alert("Payment amount must be greater than zero.");
      return;
    }

    if (amount > selectedPOForPayment.remainingAmount) {
      alert(`Payment amount cannot exceed the remaining balance of Rs. ${selectedPOForPayment.remainingAmount.toFixed(2)}`);
      return;
    }

    try {
      const res = await api.post(`/api/admin/purchase-orders/${selectedPOForPayment._id}/payments`, {
        amount,
        paymentMethod,
        notes: paymentNotes
      });

      if (res.data.success) {
        alert("Payment updated successfully!");
        setIsPayModalOpen(false);
        setPaymentAmount("");
        setPaymentNotes("");
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process payment update");
    }
  };

  // Auto Calculations on the fly for Add Supplier raw material purchase section
  const purchaseTotal = Number(formUnitPrice || 0) * Number(formQuantity || 0);
  const purchaseRemaining = purchaseTotal - Number(formInitialPayment || 0);
  let purchaseStatus = "Unpaid";
  if (Number(formInitialPayment || 0) === purchaseTotal && purchaseTotal > 0) {
    purchaseStatus = "Paid";
  } else if (Number(formInitialPayment || 0) > 0 && Number(formInitialPayment || 0) < purchaseTotal) {
    purchaseStatus = "Partially Paid";
  }

  // Auto Calculations on standalone PO creation
  const poTotal = Number(poUnitPrice || 0) * Number(poQuantity || 0);
  const poRemaining = poTotal - Number(poInitialPayment || 0);
  let poStatus = "Unpaid";
  if (Number(poInitialPayment || 0) === poTotal && poTotal > 0) {
    poStatus = "Paid";
  } else if (Number(poInitialPayment || 0) > 0 && Number(poInitialPayment || 0) < poTotal) {
    poStatus = "Partially Paid";
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-300">
      
      {/* Header and Sync Indicators */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-black/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif font-black uppercase tracking-widest text-black mb-2">
            Supplier Hub
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Raw material sourcing, vendor logs, and contract sync
          </p>
        </div>

        {/* Custom ERP Navigation Tabs */}
        <div className="flex items-center flex-wrap gap-2 border border-black/5 bg-white p-1">
          {[
            { id: "suppliers", label: "Suppliers & Vendors", icon: Truck },
            { id: "raw-materials", label: "Raw Materials", icon: Scissors },
            { id: "purchase-orders", label: "Purchase Orders & Payments", icon: FileText },
            { id: "sales-reports", label: "Procurement Analytics", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core ERP Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Suppliers", value: totalSuppliersCount, change: "Registered Vendors", icon: Truck, active: activeTab === "suppliers" },
          { label: "Active Suppliers", value: activeSuppliersCount, change: `${totalSuppliersCount > 0 ? ((activeSuppliersCount/totalSuppliersCount)*100).toFixed(0) : 0}% Operation Rate`, icon: Activity, active: activeTab === "suppliers" },
          { label: "Raw Materials", value: rawMaterialsCount, change: "Catalog Items", icon: Package, active: activeTab === "raw-materials" },
          { label: "Pending Deliveries", value: pendingDeliveriesCount, change: `${pendingDeliveriesCount} orders in transit`, icon: FileText, active: activeTab === "purchase-orders" },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 border transition-all ${
                card.active
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black/5 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={`text-[10px] font-black uppercase tracking-widest ${card.active ? "text-white/60" : "text-gray-400"}`}>
                  {card.label}
                </span>
                <Icon size={16} className={card.active ? "text-white" : "text-black"} />
              </div>
              <p className="text-3xl font-serif font-black mb-2">{card.value}</p>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${card.active ? "text-white/40" : "text-gray-400"}`}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* WARNING NOTIFICATION AREA */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 flex items-start space-x-4 animate-in slide-in-from-top-4 duration-300">
          <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px]">
            <p className="font-black text-red-800 uppercase tracking-widest">Raw Material Stock Depletion Alert</p>
            <p className="text-red-600 uppercase font-bold tracking-wider leading-relaxed">
              The following raw materials have fallen below the critical threshold levels:{" "}
              {lowStockAlerts.slice(0, 3).map(a => `${a.name} (${a.currentStock} ${a.unit} left)`).join(", ")}
              {lowStockAlerts.length > 3 ? ` and ${lowStockAlerts.length - 3} other items` : ""} require replenishment.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: SUPPLIER DIRECTORY */}
      {activeTab === "suppliers" && (
        <div className="space-y-10">
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Registered Suppliers
                </h3>
              </div>

              {/* Toolbar */}
              <div className="flex items-center flex-wrap gap-3">
                {/* Search */}
                <div className="flex items-center bg-[#f9f9f9] border border-black/5 px-3 py-1.5 text-xs w-60">
                  <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by vendor, brand, address..."
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-medium tracking-wide w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  onClick={openAddModal}
                  className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black/85 flex items-center space-x-2"
                >
                  <Plus size={12} />
                  <span>Register Vendor</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-black/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Company Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Contact Person</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Terms</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Supplied Materials</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No suppliers registered under current query.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => {
                      const isSelected = selectedSupplier?.id === supplier.id;
                      return (
                        <tr
                          key={supplier.id}
                          className={`hover:bg-[#f9f9f9] cursor-pointer transition-colors ${
                            isSelected ? "bg-black/5" : ""
                          }`}
                          onClick={() => setSelectedSupplier(supplier)}
                        >
                          <td className="px-6 py-4 font-serif font-black uppercase text-black">{supplier.name}</td>
                          <td className="px-6 py-4 font-bold text-gray-500">{supplier.companyName}</td>
                          <td className="px-6 py-4 text-gray-500">{supplier.contactPerson}</td>
                          <td className="px-6 py-4 font-bold text-black">{supplier.materialCategory}</td>
                          <td className="px-6 py-4 text-gray-400 font-mono">{supplier.paymentTerms}</td>
                          <td className="px-6 py-4 text-gray-400 font-medium truncate max-w-xs">{supplier.suppliedMaterials}</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                                supplier.status === "Active"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {supplier.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditModal(supplier)}
                              className="p-1 hover:bg-black/5 rounded-none border border-black/5"
                              title="Edit Supplier"
                            >
                              <Edit2 size={12} className="text-gray-400 hover:text-black" />
                            </button>
                            <button
                              onClick={() => toggleSupplierStatus(supplier.id)}
                              className={`p-1 rounded-none border border-black/5 ${
                                supplier.status === "Active" ? "hover:bg-red-50" : "hover:bg-green-50"
                              }`}
                              title={supplier.status === "Active" ? "Deactivate Supplier" : "Activate Supplier"}
                            >
                              {supplier.status === "Active" ? (
                                <X size={12} className="text-red-500" />
                              ) : (
                                <Check size={12} className="text-green-500" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteSupplier(supplier.id)}
                              className="p-1 hover:bg-red-50 rounded-none border border-black/5"
                              title="Delete Supplier"
                            >
                              <Trash2 size={12} className="text-red-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Details overlay panel */}
          {selectedSupplier && (
            <div className="bg-white border border-black border-l-4 p-8 animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex items-start justify-between border-b border-black/5 pb-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-serif text-xl font-bold">
                    {selectedSupplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black uppercase tracking-wider text-black">
                      {selectedSupplier.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      {selectedSupplier.companyName} &bull; ID: {selectedSupplier.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="p-1 hover:bg-black/5 rounded-none border border-black/5"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="py-10 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                  Scanning vendor ledger files...
                </div>
              ) : selectedSupplierDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-[11px]">
                  
                  {/* Left Column: Info */}
                  <div className="lg:col-span-4 space-y-4 lg:border-r lg:border-black/5 lg:pr-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Corporate Credentials</h4>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Contact Person</span>
                      <span className="font-bold text-black">{selectedSupplierDetails.supplier.contactPerson}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Phone Number</span>
                      <span className="font-mono font-bold text-black">{selectedSupplierDetails.supplier.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Email Address</span>
                      <span className="font-mono font-bold text-black">{selectedSupplierDetails.supplier.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Payment Terms</span>
                      <span className="font-bold text-black">{selectedSupplierDetails.supplier.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 pb-2">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">Address</span>
                      <span className="font-semibold text-black text-right max-w-[180px]">{selectedSupplierDetails.supplier.address}</span>
                    </div>
                  </div>

                  {/* Middle Column: Raw Materials & Payment Summary */}
                  <div className="lg:col-span-4 space-y-6 lg:border-r lg:border-black/5 lg:px-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Materials Supplied</h4>
                      <div className="space-y-2">
                        {selectedSupplierDetails.rawMaterials.length === 0 ? (
                          <p className="text-gray-400 italic font-bold uppercase tracking-wide">No raw materials registered.</p>
                        ) : (
                          selectedSupplierDetails.rawMaterials.map((mat) => (
                            <div key={mat._id} className="bg-[#fafafa] border border-black/5 p-3 flex justify-between items-center">
                              <div>
                                <p className="font-bold text-black">{mat.name}</p>
                                <p className="text-[9px] text-gray-400 uppercase font-semibold">Price: Rs. {mat.unitPrice.toFixed(2)} per {mat.unit}</p>
                              </div>
                              <span className="font-mono font-black text-black">{mat.currentStock} {mat.unit}s</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Payment Summary</h4>
                      <div className="bg-black text-white p-4 space-y-2 font-mono text-[10px] uppercase">
                        <div className="flex justify-between text-white/50">
                          <span>Total Purchases</span>
                          <span>Rs. {selectedSupplierDetails.summary.totalPurchases.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-400">
                          <span>Total Paid</span>
                          <span>Rs. {selectedSupplierDetails.summary.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-400 font-bold border-t border-white/10 pt-2 text-[11px]">
                          <span>Outstanding Balance</span>
                          <span>Rs. {selectedSupplierDetails.summary.totalOutstanding.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: PO History */}
                  <div className="lg:col-span-4 space-y-4 lg:pl-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">Sourcing Purchase Orders</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {selectedSupplierDetails.purchaseOrders.length === 0 ? (
                        <p className="text-gray-400 italic font-bold uppercase tracking-wide">No PO history found.</p>
                      ) : (
                        selectedSupplierDetails.purchaseOrders.map((po) => (
                          <div key={po._id} className="border border-black/5 p-3 space-y-1.5 bg-[#fcfcfc]">
                            <div className="flex justify-between font-mono font-bold text-black text-[10px]">
                              <span>{po.poNumber}</span>
                              <span>Rs. {po.totalAmount.toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-gray-400 uppercase font-semibold">
                              {po.rawMaterialName} &bull; {po.quantity} {po.unit}s
                            </p>
                            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                              <span>{po.orderDate || new Date(po.createdAt).toLocaleDateString()}</span>
                              <span className={`px-1.5 py-0.2 text-[8px] font-black uppercase tracking-widest inline-block ${
                                po.paymentStatus === "Paid" ? "text-green-700 bg-green-50" : po.paymentStatus === "Partially Paid" ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50"
                              }`}>{po.paymentStatus}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAW MATERIALS INVENTORY */}
      {activeTab === "raw-materials" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Raw Materials / Stock Levels
                </h3>
              </div>

              {/* Toolbar */}
              <div className="flex items-center flex-wrap gap-3">
                {/* Search */}
                <div className="flex items-center bg-[#f9f9f9] border border-black/5 px-3 py-1.5 text-xs w-60">
                  <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search material, supplier..."
                    value={searchMaterial}
                    onChange={(e) => setSearchMaterial(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-medium tracking-wide w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <select
                    value={filterMatCategory}
                    onChange={(e) => setFilterMatCategory(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                {/* Stock Status Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <select
                    value={filterMatStatus}
                    onChange={(e) => setFilterMatStatus(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="All">All Stocks</option>
                    <option value="Available">Available</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-black/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Material Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Unit</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Available Stock</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Reorder Limit</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Total Value</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Supplier</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No raw materials match filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-bold text-black">{mat.name}</td>
                        <td className="px-6 py-4">{mat.category}</td>
                        <td className="px-6 py-4 text-gray-400 font-bold">{mat.unit}</td>
                        <td className="px-6 py-4 font-mono text-center font-bold text-black">{mat.currentStock}</td>
                        <td className="px-6 py-4 font-mono text-center text-gray-400">{mat.reorderLevel}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-black">Rs. {mat.unitPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-black">Rs. {(mat.unitPrice * mat.currentStock).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-black underline underline-offset-4 decoration-black/10">
                          {mat.supplier}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                              mat.stockStatus === "Available"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : mat.stockStatus === "Low Stock"
                                ? "bg-orange-50 text-orange-600 border border-orange-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {mat.stockStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE ORDERS & SUPPLIER PAYMENTS */}
      {activeTab === "purchase-orders" && (
        <div className="space-y-8">
          
          {/* PO Management Table */}
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Procurement Orders & Sourcing Payments Ledger
                </h3>
              </div>

              {/* Actions & Filters */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex items-center bg-[#f9f9f9] border border-black/5 px-3 py-1.5 text-xs w-60">
                  <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search PO#, material, supplier..."
                    value={searchPO}
                    onChange={(e) => setSearchPO(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-medium tracking-wide w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <select
                    value={filterPOStatus}
                    onChange={(e) => setFilterPOStatus(e.target.value)}
                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="All">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsPOModalOpen(true)}
                  className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black/85 flex items-center space-x-2"
                >
                  <Plus size={12} />
                  <span>Create PO</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-black/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">PO Number</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Raw Material</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Quantity</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Paid Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Remaining Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Payment Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Purchase Date</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No purchase orders logged under current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-mono font-bold text-black">{po.poNumber}</td>
                        <td className="px-6 py-4 font-bold text-black">{po.supplier}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{po.materialName}</td>
                        <td className="px-6 py-4 font-mono font-bold text-center text-black">
                          {po.quantity} {po.unit || "meters"}
                        </td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-black">Rs. {po.unitPrice?.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-black">Rs. {po.totalAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-green-600">Rs. {po.paidAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold text-red-500">Rs. {po.remainingAmount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                              po.paymentStatus === "Paid"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : po.paymentStatus === "Partially Paid" || po.paymentStatus === "Partial"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {po.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500">{po.orderDate}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {po.remainingAmount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedPOForPayment(po);
                                setPaymentAmount(po.remainingAmount);
                                setIsPayModalOpen(true);
                              }}
                              className="bg-black text-white hover:bg-black/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                              Add Payment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              alert(`PO: ${po.poNumber}\nSupplier: ${po.supplier}\nMaterial: ${po.materialName}\nQuantity: ${po.quantity}\nTotal: Rs. ${po.totalAmount.toLocaleString()}\nPaid: Rs. ${po.paidAmount.toLocaleString()}\nRemaining: Rs. ${po.remainingAmount.toLocaleString()}\nDate: ${po.orderDate}`);
                            }}
                            className="text-[9px] font-black uppercase tracking-widest hover:opacity-50 text-black border border-black/10 px-2 py-1"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: PROCUREMENT ANALYTICS */}
      {activeTab === "sales-reports" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Purchase cost breakdown line chart */}
            <div className="lg:col-span-2 bg-white border border-black/5 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-3 bg-black"></span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black">
                    Monthly Sourcing Cost Trends
                  </h3>
                </div>
                <div className="flex items-center space-x-4 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  <span className="flex items-center"><span className="w-2 h-2 bg-black mr-1"></span> Fabric</span>
                  <span className="flex items-center"><span className="w-2 h-2 bg-gray-400 mr-1"></span> Accessories</span>
                  <span className="flex items-center"><span className="w-2 h-2 bg-gray-200 mr-1"></span> Packaging</span>
                </div>
              </div>
              
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={COST_TREND_DATA}>
                    <defs>
                      <linearGradient id="fabricGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
                    <Tooltip formatter={(v) => [`Rs.${v}`, "Cost"]} labelStyle={{ fontSize: 9, textTransform: "uppercase" }} />
                    <Area type="monotone" dataKey="Fabric" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#fabricGrad)" />
                    <Area type="monotone" dataKey="Accessories" stroke="#888" strokeWidth={1.5} fill="none" />
                    <Area type="monotone" dataKey="Packaging" stroke="#ccc" strokeWidth={1} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Pie Chart */}
            <div className="bg-white border border-black/5 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-8">
                  <span className="w-1.5 h-3 bg-black"></span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-black">
                    Procurement Cost Share
                  </h3>
                </div>
                
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_DISTRIBUTION}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#000" />
                        <Cell fill="#666" />
                        <Cell fill="#ccc" />
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, "Cost Share"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-black/5">
                {CATEGORY_DISTRIBUTION.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center">
                      <span
                        className="w-2.5 h-2.5 mr-2"
                        style={{ backgroundColor: idx === 0 ? "#000" : idx === 1 ? "#666" : "#ccc" }}
                      ></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-black">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchasing report lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black text-white p-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">
                Material Purchasing Strategy
              </h4>
              <div className="space-y-6 text-[11px]">
                <div className="border-b border-white/10 pb-4">
                  <p className="font-black uppercase tracking-wide mb-1 text-white">Fabric Price Volatility Alert</p>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Raw cotton fabric indexes showing up to 8% upward trend in local markets. Secure Q3 requirements with Apex Fabrics under existing Net 30 lines.
                  </p>
                </div>
                <div className="pb-4">
                  <p className="font-black uppercase tracking-wide mb-1 text-white">Freights Optimization</p>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Combine buttons and zippers orders with Trim & Button Co. to hit the Rs. 500,000 threshold for free bulk freight. Saves average Rs. 35,000 per PO routing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#fafafa] border border-black/5 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">
                  Sourcing Distribution by Logistics Category
                </h4>
                <div className="space-y-4">
                  {[
                    { label: "Apex Fabrics (Lace & Linens)", orders: 84, score: "96.4%" },
                    { label: "Trim & Button Co. (Plastics & Snaps)", orders: 48, score: "95.1%" },
                    { label: "Eco Thread Co. (Polyester Spools)", orders: 112, score: "99.0%" }
                  ].map((lead, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wide">
                      <span className="text-gray-500">{lead.label}</span>
                      <span className="font-mono text-black">{lead.orders} Orders &bull; {lead.score} On-Time</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: Add/Edit Supplier Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-black w-full max-w-xl animate-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                {modalMode === "add" ? "Register New Vendor" : `Edit Vendor Details`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-50">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSupplier} className="p-8 space-y-5 text-[11px] max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Supplier Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formSupplierName}
                    onChange={(e) => setFormSupplierName(e.target.value)}
                    placeholder="e.g. Apex Fabrics"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. Apex Textiles Ltd."
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Contact Person */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Contact Number</label>
                  <input
                    type="text"
                    value={formPhoneNumber}
                    onChange={(e) => setFormPhoneNumber(e.target.value)}
                    placeholder="e.g. +94771234567"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. contact@apextex.com"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>

                {/* Material Category */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Material Category</label>
                  <select
                    value={formMaterialCategory}
                    onChange={(e) => setFormMaterialCategory(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest focus:border-black outline-none"
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
              </div>

              {/* Supplied Materials */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Supplied Materials (Comma Separated)</label>
                <input
                  type="text"
                  value={formSuppliedMaterials}
                  onChange={(e) => setFormSuppliedMaterials(e.target.value)}
                  placeholder="e.g. Cotton Fabric, Denim Fabric, Polyester Fabric"
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Corporate Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. 102 Fabric Industrial Ave, Charlotte, NC 28202"
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Payment Terms */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Terms</label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest focus:border-black outline-none"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Active Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest focus:border-black outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* EXTENDED: Raw Material & Sourcing Order Details Section */}
              {modalMode === "add" && (
                <div className="border-t border-black/5 pt-4 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black">
                    Raw Material & Sourcing Order Details *
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Raw Material Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Raw Material Name *</label>
                      <input
                        type="text"
                        required
                        value={formRawMaterialName}
                        onChange={(e) => setFormRawMaterialName(e.target.value)}
                        placeholder="e.g. Cotton Fabric"
                        className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                      />
                    </div>

                    {/* Unit */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Unit *</label>
                      <input
                        type="text"
                        required
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="e.g. Meter, Kg, Piece"
                        className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Price Per Unit */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Price Per Unit (Rs.) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formUnitPrice}
                        onChange={(e) => setFormUnitPrice(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Purchase Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(e.target.value)}
                        placeholder="e.g. 100"
                        className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                      />
                    </div>

                    {/* Initial Payment */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Initial Payment (Rs.)</label>
                      <input
                        type="number"
                        min="0"
                        value={formInitialPayment}
                        onChange={(e) => setFormInitialPayment(e.target.value)}
                        placeholder="e.g. 20000"
                        className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculations Preview */}
                  {purchaseTotal > 0 && (
                    <div className="bg-[#fafafa] border border-black/5 p-4 space-y-2 text-[10px] font-black uppercase tracking-widest font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Sourced Value:</span>
                        <span className="text-black">Rs. {purchaseTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Paid Amount:</span>
                        <span className="text-green-600">Rs. {Number(formInitialPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-black/5 pt-2">
                        <span className="text-gray-400">Outstanding Balance:</span>
                        <span className="text-red-500">Rs. {purchaseRemaining.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-400">Payment Status:</span>
                        <span className={`px-2 py-0.5 text-[8px] tracking-widest ${
                          purchaseStatus === "Paid" ? "bg-green-600 text-white" :
                          purchaseStatus === "Partially Paid" ? "bg-yellow-500 text-black" : "bg-red-600 text-white"
                        }`}>{purchaseStatus}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-black/5 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-black/20 text-black hover:bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white hover:bg-black/90 px-6 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Save Supplier
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Standalone Purchase Order Form */}
      {isPOModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black w-full max-w-md animate-in zoom-in-95 duration-200">
            
            <div className="bg-black text-white p-6 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Draft Sourcing Purchase Order
              </h3>
              <button onClick={() => setIsPOModalOpen(false)} className="text-white hover:opacity-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-8 space-y-5 text-[11px]">
              
              {/* Supplier Selection */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier *</label>
                <select
                  required
                  value={poSupplier}
                  onChange={(e) => {
                    setPoSupplier(e.target.value);
                    const selected = suppliers.find(s => s.name === e.target.value);
                    if (selected) {
                      setPoMaterial(selected.suppliedMaterials?.split(",")[0]?.trim() || "");
                    }
                  }}
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wide focus:border-black outline-none"
                >
                  <option value="">Select Vendor</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.materialCategory})</option>
                  ))}
                </select>
              </div>

              {/* Material Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Material Name *</label>
                <input
                  type="text"
                  required
                  value={poMaterial}
                  onChange={(e) => setPoMaterial(e.target.value)}
                  placeholder="e.g. Cotton Fabric"
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Unit */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Unit *</label>
                  <input
                    type="text"
                    required
                    value={poUnit}
                    onChange={(e) => setPoUnit(e.target.value)}
                    placeholder="e.g. Meter, Kg"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                  />
                </div>

                {/* Expected Delivery Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Expected Delivery</label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Unit Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(e.target.value)}
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>

                {/* Initial Payment */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Initial Pay (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    value={poInitialPayment}
                    onChange={(e) => setPoInitialPayment(e.target.value)}
                    placeholder="e.g. 20000"
                    className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                  />
                </div>
              </div>

              {/* Calculated Preview */}
              {poTotal > 0 && (
                <div className="bg-[#fafafa] border border-black/5 p-4 space-y-2 text-[10px] font-black uppercase tracking-widest font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Sourced Value:</span>
                    <span className="text-black">Rs. {poTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Paid Amount:</span>
                    <span className="text-green-600">Rs. {Number(poInitialPayment || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-black/5 pt-2">
                    <span className="text-gray-400">Outstanding Balance:</span>
                    <span className="text-red-500">Rs. {poRemaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">Payment Status:</span>
                    <span className={`px-2 py-0.5 text-[8px] tracking-widest ${
                      poStatus === "Paid" ? "bg-green-600 text-white" :
                      poStatus === "Partially Paid" ? "bg-yellow-500 text-black" : "bg-red-600 text-white"
                    }`}>{poStatus}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-black/5 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="border border-black/20 text-black hover:bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white hover:bg-black/90 px-6 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Create Sourcing Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Make Payment / Add Payment Form */}
      {isPayModalOpen && selectedPOForPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black w-full max-w-sm animate-in zoom-in-95 duration-200">
            
            <div className="bg-black text-white p-6 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                Add Payment to PO
              </h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-white hover:opacity-50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="p-8 space-y-5 text-[11px]">
              
              <div className="bg-[#fafafa] border border-black/5 p-4 space-y-2 text-[10px] font-black uppercase tracking-widest font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">PO Number:</span>
                  <span className="text-black">{selectedPOForPayment.poNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Supplier:</span>
                  <span className="text-black">{selectedPOForPayment.supplier}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-2">
                  <span className="text-gray-400">Total PO Amount:</span>
                  <span className="text-black">Rs. {selectedPOForPayment.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-gray-400">Amount Paid:</span>
                  <span>Rs. {selectedPOForPayment.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500 font-bold">
                  <span className="text-gray-400">Remaining Balance:</span>
                  <span>Rs. {selectedPOForPayment.remainingAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Amount (Rs.) *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  max={selectedPOForPayment.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-mono focus:border-black outline-none"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-black uppercase tracking-widest focus:border-black outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Memo/Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Installment 2, Bank Ref #91823"
                  className="w-full border border-black/10 px-3 py-2 text-[11px] font-medium focus:border-black outline-none"
                />
              </div>

              {/* New remaining preview */}
              {Number(paymentAmount) > 0 && Number(paymentAmount) <= selectedPOForPayment.remainingAmount && (
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest font-mono text-gray-500 border-t border-black/5 pt-2">
                  <span>New Balance:</span>
                  <span className="text-black">
                    Rs. {(selectedPOForPayment.remainingAmount - Number(paymentAmount)).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-black/5 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="border border-black/20 text-black hover:bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white hover:bg-black/90 px-6 py-3 text-[10px] font-black uppercase tracking-widest"
                >
                  Confirm Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierManagement;
