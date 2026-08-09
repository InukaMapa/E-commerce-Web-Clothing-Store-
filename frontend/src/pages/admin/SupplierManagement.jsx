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

// Mock Data Definitions
const INITIAL_SUPPLIERS = [
  {
    id: "SUP-001",
    name: "Apex Fabrics",
    companyName: "Apex Textiles Ltd.",
    materialCategory: "Fabric",
    contactPerson: "John Doe",
    phoneNumber: "+1-555-0190",
    email: "contact@apextex.com",
    location: "North Carolina, USA",
    status: "Active",
    address: "102 Fabric Industrial Ave, Charlotte, NC 28202",
    paymentTerms: "Net 30",
    suppliedMaterials: "Cotton Fabric, Denim Fabric, Polyester Fabric, Linen Fabric",
    rating: 5,
    performance: {
      totalOrders: 124,
      successfulDeliveries: 120,
      lateDeliveries: 4,
      qualityRating: 4.8
    }
  },
  {
    id: "SUP-002",
    name: "Trim & Button Co.",
    companyName: "Trim & Accessories Inc.",
    materialCategory: "Accessories",
    contactPerson: "Sarah Jenkins",
    phoneNumber: "+1-555-0182",
    email: "info@trimbutton.com",
    location: "Guangdong, China",
    status: "Active",
    address: "Building B, Xinghai Industrial Park, Guangzhou, GD",
    paymentTerms: "Net 15",
    suppliedMaterials: "Buttons, Zippers, Metal Button, Rivets",
    rating: 4,
    performance: {
      totalOrders: 82,
      successfulDeliveries: 78,
      lateDeliveries: 4,
      qualityRating: 4.2
    }
  },
  {
    id: "SUP-003",
    name: "Eco Thread Co.",
    companyName: "Eco-Friendly Thread Corp.",
    materialCategory: "Accessories",
    contactPerson: "Robert Chen",
    phoneNumber: "+86-21-555-9128",
    email: "sales@ecothread.cn",
    location: "Shanghai, China",
    status: "Active",
    address: "66 Green Road, Pudong District, Shanghai",
    paymentTerms: "COD",
    suppliedMaterials: "Threads, Thread, Polyester Thread",
    rating: 5,
    performance: {
      totalOrders: 200,
      successfulDeliveries: 198,
      lateDeliveries: 2,
      qualityRating: 4.9
    }
  },
  {
    id: "SUP-004",
    name: "Tag & Label Pro",
    companyName: "Label Tech Solutions Ltd.",
    materialCategory: "Accessories",
    contactPerson: "Elena Rostova",
    phoneNumber: "+49-30-555-2345",
    email: "orders@labeltech.de",
    location: "Berlin, Germany",
    status: "Active",
    address: "Kaiserstraße 12, 10115 Berlin",
    paymentTerms: "Net 60",
    suppliedMaterials: "Brand Label, Size Label, Leather Label",
    rating: 4,
    performance: {
      totalOrders: 45,
      successfulDeliveries: 40,
      lateDeliveries: 5,
      qualityRating: 4.0
    }
  },
  {
    id: "SUP-005",
    name: "Elite Packaging",
    companyName: "Elite Boxes & Bags Co.",
    materialCategory: "Packaging",
    contactPerson: "Marcus Vance",
    phoneNumber: "+1-555-0221",
    email: "m.vance@elitepack.com",
    location: "New Jersey, USA",
    status: "Active",
    address: "400 Packaging Way, Newark, NJ 07102",
    paymentTerms: "Net 30",
    suppliedMaterials: "Packaging, Polybags, Corrugated Boxes",
    rating: 5,
    performance: {
      totalOrders: 60,
      successfulDeliveries: 58,
      lateDeliveries: 2,
      qualityRating: 4.7
    }
  },
  {
    id: "SUP-006",
    name: "Luxe Lace & Trims",
    companyName: "Luxe Fabrics Ltd.",
    materialCategory: "Fabric",
    contactPerson: "Amelie Laurent",
    phoneNumber: "+33-1-555-7890",
    email: "a.laurent@luxefab.fr",
    location: "Lyon, France",
    status: "Inactive",
    address: "15 Rue de la Soie, 69001 Lyon",
    paymentTerms: "Net 30",
    suppliedMaterials: "Lace, Elastic, Elastic Band, Thread",
    rating: 3,
    performance: {
      totalOrders: 15,
      successfulDeliveries: 12,
      lateDeliveries: 3,
      qualityRating: 3.5
    }
  }
];

const INITIAL_MATERIALS = [
  // Fabrics
  { id: "MAT-001", name: "Cotton Fabric", category: "Fabric", type: "Pima Cotton", color: "Optical White", sizeWidth: "60\" Width", unit: "Meters", currentStock: 50, reorderLevel: 200, unitPrice: 8.50, supplier: "Apex Fabrics", stockStatus: "Low Stock" },
  { id: "MAT-002", name: "Denim Fabric", category: "Fabric", type: "Heavyweight Indigo", color: "Dark Indigo", sizeWidth: "58\" Width", unit: "Meters", currentStock: 850, reorderLevel: 150, unitPrice: 12.00, supplier: "Apex Fabrics", stockStatus: "Available" },
  { id: "MAT-003", name: "Polyester Fabric", category: "Fabric", type: "Microfiber Blend", color: "Jet Black", sizeWidth: "60\" Width", unit: "Meters", currentStock: 400, reorderLevel: 100, unitPrice: 6.00, supplier: "Apex Fabrics", stockStatus: "Available" },
  { id: "MAT-004", name: "Linen Fabric", category: "Fabric", type: "Pure Flax", color: "Natural Sand", sizeWidth: "54\" Width", unit: "Meters", currentStock: 0, reorderLevel: 50, unitPrice: 14.50, supplier: "Apex Fabrics", stockStatus: "Out of Stock" },
  
  // Accessories
  { id: "MAT-005", name: "Buttons", category: "Accessories", type: "4-Hole Resin", color: "Chalk White", sizeWidth: "15mm", unit: "Pieces", currentStock: 2500, reorderLevel: 500, unitPrice: 0.12, supplier: "Trim & Button Co.", stockStatus: "Available" },
  { id: "MAT-006", name: "Metal Button", category: "Accessories", type: "Heavy Duty Snap", color: "Antique Brass", sizeWidth: "20mm", unit: "Pieces", currentStock: 100, reorderLevel: 200, unitPrice: 0.25, supplier: "Trim & Button Co.", stockStatus: "Low Stock" },
  { id: "MAT-007", name: "Zippers", category: "Accessories", type: "YKK Metal Close-End", color: "Navy Blue", sizeWidth: "7 inch", unit: "Pieces", currentStock: 30, reorderLevel: 100, unitPrice: 0.85, supplier: "Trim & Button Co.", stockStatus: "Low Stock" },
  { id: "MAT-008", name: "Rivets", category: "Accessories", type: "Reinforcement Copper", color: "Copper", sizeWidth: "8mm", unit: "Pieces", currentStock: 1200, reorderLevel: 300, unitPrice: 0.05, supplier: "Trim & Button Co.", stockStatus: "Available" },
  { id: "MAT-009", name: "Threads", category: "Accessories", type: "Spun Polyester", color: "Eggshell White", sizeWidth: "5000 yds", unit: "Cones", currentStock: 120, reorderLevel: 30, unitPrice: 2.50, supplier: "Eco Thread Co.", stockStatus: "Available" },
  { id: "MAT-010", name: "Polyester Thread", category: "Accessories", type: "High-Tensile Thread", color: "Charcoal Gray", sizeWidth: "4000 yds", unit: "Cones", currentStock: 95, reorderLevel: 25, unitPrice: 2.75, supplier: "Eco Thread Co.", stockStatus: "Available" },
  { id: "MAT-011", name: "Brand Label", category: "Accessories", type: "Woven Damask Logo", color: "Black/White", sizeWidth: "2\"x1\"", unit: "Pieces", currentStock: 5000, reorderLevel: 1000, unitPrice: 0.08, supplier: "Tag & Label Pro", stockStatus: "Available" },
  { id: "MAT-012", name: "Size Label", category: "Accessories", type: "Satin Printed S/M/L", color: "White/Gray", sizeWidth: "1.5\"x0.5\"", unit: "Pieces", currentStock: 4500, reorderLevel: 1000, unitPrice: 0.04, supplier: "Tag & Label Pro", stockStatus: "Available" },
  { id: "MAT-013", name: "Leather Label", category: "Accessories", type: "Embossed Cowhide", color: "Tan Brown", sizeWidth: "3\"x2\"", unit: "Pieces", currentStock: 800, reorderLevel: 200, unitPrice: 0.75, supplier: "Tag & Label Pro", stockStatus: "Available" },
  { id: "MAT-014", name: "Elastic Band", category: "Accessories", type: "Knitted Elastic Stretch", color: "Black", sizeWidth: "1.5\" Width", unit: "Meters", currentStock: 300, reorderLevel: 100, unitPrice: 1.10, supplier: "Luxe Lace & Trims", stockStatus: "Available" },
  { id: "MAT-015", name: "Lace", category: "Accessories", type: "Chantilly Lace Trim", color: "Ivory", sizeWidth: "4\" Width", unit: "Meters", currentStock: 150, reorderLevel: 50, unitPrice: 3.20, supplier: "Luxe Lace & Trims", stockStatus: "Available" },
  
  // Packaging
  { id: "MAT-016", name: "Packaging", category: "Packaging", type: "Premium Clothing Box", color: "Natural Kraft", sizeWidth: "12\"x10\"x3\"", unit: "Pieces", currentStock: 600, reorderLevel: 150, unitPrice: 1.50, supplier: "Elite Packaging", stockStatus: "Available" }
];

const INITIAL_POS = [
  { poNumber: "PO-2026-001", supplier: "Apex Fabrics", materialName: "Cotton Fabric", quantity: 1000, orderDate: "2026-06-15", expectedDelivery: "2026-07-20", deliveryStatus: "In Transit", paymentStatus: "Paid" },
  { poNumber: "PO-2026-002", supplier: "Trim & Button Co.", materialName: "Metal Button", quantity: 500, orderDate: "2026-07-01", expectedDelivery: "2026-07-12", deliveryStatus: "Pending", paymentStatus: "Unpaid" },
  { poNumber: "PO-2026-003", supplier: "Eco Thread Co.", materialName: "Polyester Thread", quantity: 50, orderDate: "2026-06-28", expectedDelivery: "2026-07-05", deliveryStatus: "Delivered", paymentStatus: "Paid" },
  { poNumber: "PO-2026-004", supplier: "Tag & Label Pro", materialName: "Leather Label", quantity: 1000, orderDate: "2026-07-05", expectedDelivery: "2026-07-15", deliveryStatus: "Pending", paymentStatus: "Partial" },
  { poNumber: "PO-2026-005", supplier: "Elite Packaging", materialName: "Packaging Box", quantity: 2000, orderDate: "2026-06-20", expectedDelivery: "2026-06-28", deliveryStatus: "Delivered", paymentStatus: "Paid" }
];

const PRODUCT_MAPPINGS = [
  {
    productName: "Shirt",
    icon: "👔",
    description: "Classic Button-down & Formal Shirts",
    materials: ["Cotton Fabric", "Threads", "Buttons", "Brand Label", "Packaging"]
  },
  {
    productName: "T-Shirt",
    icon: "👕",
    description: "Casual Crewneck & V-Neck Tees",
    materials: ["Cotton Fabric", "Polyester Thread", "Size Label", "Packaging"]
  },
  {
    productName: "Jeans",
    icon: "👖",
    description: "Rugged Denim & Streetwear Pants",
    materials: ["Denim Fabric", "Metal Button", "Zippers", "Rivets", "Leather Label"]
  },
  {
    productName: "Skirt",
    icon: "👗",
    description: "Pleated & Casual Skirts",
    materials: ["Cotton Fabric", "Elastic Band", "Zippers", "Threads"]
  },
  {
    productName: "Frock",
    icon: "👶",
    description: "Embellished Girls & Children Dresses",
    materials: ["Linen Fabric", "Lace", "Buttons", "Zippers", "Threads"]
  }
];

// Recharts cost datasets
const COST_TREND_DATA = [
  { name: "Jan", Fabric: 12000, Accessories: 4500, Packaging: 2000 },
  { name: "Feb", Fabric: 15000, Accessories: 4800, Packaging: 2200 },
  { name: "Mar", Fabric: 11000, Accessories: 5200, Packaging: 1900 },
  { name: "Apr", Fabric: 18000, Accessories: 6000, Packaging: 2800 },
  { name: "May", Fabric: 16500, Accessories: 5800, Packaging: 2500 },
  { name: "Jun", Fabric: 21000, Accessories: 6400, Packaging: 3100 }
];

const CATEGORY_DISTRIBUTION = [
  { name: "Fabrics", value: 68 },
  { name: "Accessories", value: 22 },
  { name: "Packaging", value: 10 }
];

const SupplierManagement = ({ activeTab: initialTab = "suppliers" }) => {

  // Unified State System
  const [activeTab, setActiveTab] = useState(initialTab);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_POS);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

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
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  
  // Modal Fields
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

  // Purchase Order Form State
  const [poSupplier, setPoSupplier] = useState("");
  const [poMaterial, setPoMaterial] = useState("");
  const [poQuantity, setPoQuantity] = useState(100);
  const [poExpectedDate, setPoExpectedDate] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Tab changer utility (local state only)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Helper Counters
  const totalSuppliersCount = suppliers.length;
  const activeSuppliersCount = suppliers.filter(s => s.status === "Active").length;
  const rawMaterialsCount = materials.length;
  const pendingDeliveriesCount = purchaseOrders.filter(po => po.deliveryStatus !== "Delivered").length;
  const lowStockAlerts = materials.filter(m => m.stockStatus === "Low Stock" || m.stockStatus === "Out of Stock");

  // Filter actions
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.id.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchSupplier.toLowerCase());
    const matchesCategory = filterCategory === "All" || s.materialCategory === filterCategory;
    const matchesStatus = filterStatus === "All" || s.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.id.toLowerCase().includes(searchMaterial.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchMaterial.toLowerCase());
    const matchesCategory = filterMatCategory === "All" || m.category === filterMatCategory;
    const matchesStatus = filterMatStatus === "All" || m.stockStatus === filterMatStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchPO.toLowerCase()) ||
      po.materialName.toLowerCase().includes(searchPO.toLowerCase());
    const matchesStatus = filterPOStatus === "All" || po.deliveryStatus === filterPOStatus;
    return matchesSearch && matchesStatus;
  });

  // Activate/Deactivate Toggle
  const toggleSupplierStatus = (id) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
    );
  };

  // Delete Action
  const deleteSupplier = (id) => {
    if (confirm(`Are you sure you want to delete supplier ${id}?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      if (selectedSupplier && selectedSupplier.id === id) {
        setSelectedSupplier(null);
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
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!formSupplierName || !formCompanyName || !formContactPerson || !formEmail) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    if (modalMode === "add") {
      const newId = `SUP-0${suppliers.length + 1}`;
      const newSupplier = {
        id: newId,
        name: formSupplierName,
        companyName: formCompanyName,
        materialCategory: formMaterialCategory,
        contactPerson: formContactPerson,
        phoneNumber: formPhoneNumber,
        email: formEmail,
        location: formAddress.split(",").slice(-2).join(",").trim() || "Local",
        status: formStatus,
        address: formAddress,
        paymentTerms: formPaymentTerms,
        suppliedMaterials: formSuppliedMaterials || "Generic Supplies",
        rating: 5,
        performance: {
          totalOrders: 0,
          successfulDeliveries: 0,
          lateDeliveries: 0,
          qualityRating: 5.0
        }
      };
      setSuppliers(prev => [newSupplier, ...prev]);
    } else {
      setSuppliers(prev =>
        prev.map(s =>
          s.id === editingId
            ? {
                ...s,
                name: formSupplierName,
                companyName: formCompanyName,
                materialCategory: formMaterialCategory,
                contactPerson: formContactPerson,
                phoneNumber: formPhoneNumber,
                email: formEmail,
                location: formAddress.split(",").slice(-2).join(",").trim() || s.location,
                address: formAddress,
                paymentTerms: formPaymentTerms,
                suppliedMaterials: formSuppliedMaterials,
                status: formStatus
              }
            : s
        )
      );
      // Update selectedSupplier if it was the edited one
      if (selectedSupplier && selectedSupplier.id === editingId) {
        setSelectedSupplier(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: formSupplierName,
            companyName: formCompanyName,
            materialCategory: formMaterialCategory,
            contactPerson: formContactPerson,
            phoneNumber: formPhoneNumber,
            email: formEmail,
            address: formAddress,
            paymentTerms: formPaymentTerms,
            suppliedMaterials: formSuppliedMaterials,
            status: formStatus
          };
        });
      }
    }
    setIsModalOpen(false);
  };

  // Create Purchase Order Form Submit
  const handleCreatePO = (e) => {
    e.preventDefault();
    if (!poSupplier || !poMaterial || !poQuantity) {
      alert("Please fill in all PO fields.");
      return;
    }

    const newPO = {
      poNumber: `PO-2026-0${purchaseOrders.length + 1}`,
      supplier: poSupplier,
      materialName: poMaterial,
      quantity: Number(poQuantity),
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: poExpectedDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      deliveryStatus: "Pending",
      paymentStatus: "Unpaid"
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setIsPOModalOpen(false);

    alert(`Purchase Order ${newPO.poNumber} created successfully!`);
  };

  // Quick reorder trigger
  const handleQuickReorder = (material) => {
    setPoSupplier(material.supplier);
    setPoMaterial(material.name);
    setPoQuantity(material.reorderLevel * 2);
    setPoExpectedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setIsPOModalOpen(true);
  };

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
            { id: "purchase-orders", label: "Purchase Orders", icon: FileText },
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

      {/* Core ERP Metrics Cards (Always visible as summary cards at the top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Suppliers", value: totalSuppliersCount, change: "Registered Vendors", icon: Truck, active: activeTab === "suppliers" },
          { label: "Active Suppliers", value: activeSuppliersCount, change: `${((activeSuppliersCount/totalSuppliersCount)*100).toFixed(0)}% Operation Rate`, icon: Activity, active: activeTab === "suppliers" },
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
              <p className="text-3xl font-serif font-black tracking-tight mb-1">{card.value}</p>
              <p className={`text-[9px] font-bold uppercase tracking-wider ${card.active ? "text-white/40" : "text-gray-400"}`}>
                {card.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stock Warning Strip if there are Out of Stock or Low Stock items */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border-l-2 border-black p-4 flex items-start justify-between gap-4 animate-pulse">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-black shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black">
                Supply Alert: Critical Inventory Depletion
              </p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mt-1">
                {lowStockAlerts.slice(0, 3).map(a => `${a.name} (${a.currentStock} ${a.unit} left)`).join(", ")}
                {lowStockAlerts.length > 3 ? ` and ${lowStockAlerts.length - 3} other items` : ""} require replenishment.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleTabChange("raw-materials")}
            className="text-[9px] font-black uppercase tracking-widest border-b border-black text-black pb-0.5 hover:opacity-50"
          >
            Review Stock
          </button>
        </div>
      )}

      {/* Content Rendering based on current active tab */}
      {activeTab === "suppliers" && (
        <div className="space-y-10">
          
          {/* Supplier List Section */}
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Active Vendors List
                </h3>
              </div>

              {/* Action and Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex items-center bg-[#f9f9f9] border border-black/5 px-3 py-1.5 text-xs w-60">
                  <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search supplier, category, mail..."
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-medium tracking-wide w-full"
                  />
                  {searchSupplier && (
                    <button onClick={() => setSearchSupplier("")}>
                      <X size={12} className="text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center border border-black/5 bg-[#f9f9f9] px-2 py-1.5 text-xs">
                  <Filter size={12} className="text-gray-400 mr-2" />
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
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Add Button */}
                <button
                  onClick={openAddModal}
                  className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black/85 flex items-center space-x-2"
                >
                  <Plus size={12} />
                  <span>New Supplier</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-black/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">ID</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Company</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Contact Person</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Email</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Location</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No suppliers match search queries.
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => {
                      const isSelected = selectedSupplier?.id === supplier.id;
                      return (
                        <tr
                          key={supplier.id}
                          onClick={() => setSelectedSupplier(supplier)}
                          className={`hover:bg-[#f9f9f9] cursor-pointer transition-colors ${
                            isSelected ? "bg-black/5" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-mono font-bold">{supplier.id}</td>
                          <td className="px-6 py-4 font-bold text-black">{supplier.name}</td>
                          <td className="px-6 py-4 text-gray-500">{supplier.companyName}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border border-black/10 bg-white">
                              {supplier.materialCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{supplier.contactPerson}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono">{supplier.phoneNumber}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono">{supplier.email}</td>
                          <td className="px-6 py-4 text-gray-500">{supplier.location}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                                supplier.status === "Active"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                              }`}
                            >
                              {supplier.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setSelectedSupplier(supplier)}
                                title="View Supplier Profile"
                                className="p-1 hover:bg-black hover:text-white border border-black/5 transition-colors"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => openEditModal(supplier)}
                                title="Edit Details"
                                className="p-1 hover:bg-black hover:text-white border border-black/5 transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => toggleSupplierStatus(supplier.id)}
                                title={supplier.status === "Active" ? "Deactivate Supplier" : "Activate Supplier"}
                                className={`p-1 border border-black/5 transition-colors ${
                                  supplier.status === "Active"
                                    ? "hover:bg-red-500 hover:text-white"
                                    : "hover:bg-green-500 hover:text-white"
                                }`}
                              >
                                {supplier.status === "Active" ? <X size={12} /> : <Check size={12} />}
                              </button>
                              <button
                                onClick={() => deleteSupplier(supplier.id)}
                                title="Delete Supplier Record"
                                className="p-1 hover:bg-red-600 hover:text-white border border-black/5 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Details Section (renders dynamically when a supplier is selected) */}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details list */}
                <div className="space-y-4 text-[11px] lg:border-r lg:border-black/5 lg:pr-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">
                    Corporate Credentials
                  </h4>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Contact Person</span>
                    <span className="font-bold text-black">{selectedSupplier.contactPerson}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Phone Number</span>
                    <span className="font-mono font-bold text-black">{selectedSupplier.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Email Address</span>
                    <span className="font-mono font-bold text-black">{selectedSupplier.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Payment Terms</span>
                    <span className="font-bold text-black">{selectedSupplier.paymentTerms}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Material Group</span>
                    <span className="font-bold text-black">{selectedSupplier.materialCategory}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider">Address</span>
                    <span className="font-semibold text-black text-right max-w-[180px]">{selectedSupplier.address}</span>
                  </div>
                </div>

                {/* Supplied materials */}
                <div className="space-y-4 lg:border-r lg:border-black/5 lg:px-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">
                    Registered Supplied Materials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSupplier.suppliedMaterials.split(",").map((mat, i) => (
                      <span
                        key={i}
                        className="bg-[#fcfcfc] border border-black/5 px-3 py-2 text-[10px] font-bold uppercase text-gray-700 tracking-wider flex items-center"
                      >
                        <span className="w-1.5 h-1.5 bg-black mr-2"></span>
                        {mat.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setPoSupplier(selectedSupplier.name);
                        setPoMaterial(selectedSupplier.suppliedMaterials.split(",")[0]?.trim() || "");
                        setIsPOModalOpen(true);
                      }}
                      className="w-full bg-black text-white hover:bg-black/90 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2"
                    >
                      <PlusCircle size={14} />
                      <span>Issue Purchase Order</span>
                    </button>
                  </div>
                </div>

                {/* Performance indicators */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-3">
                    Vendor Performance & Quality Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fafafa] p-4 border border-black/5">
                      <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Total Orders</p>
                      <p className="text-xl font-serif font-black text-black mt-1">
                        {selectedSupplier.performance.totalOrders}
                      </p>
                    </div>
                    <div className="bg-[#fafafa] p-4 border border-black/5">
                      <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">On-Time Ratio</p>
                      <p className="text-xl font-serif font-black text-black mt-1">
                        {selectedSupplier.performance.totalOrders > 0
                          ? `${((selectedSupplier.performance.successfulDeliveries / selectedSupplier.performance.totalOrders) * 100).toFixed(0)}%`
                          : "100%"}
                      </p>
                    </div>
                    <div className="bg-[#fafafa] p-4 border border-black/5">
                      <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Late Deliveries</p>
                      <p className="text-xl font-serif font-black text-red-500 mt-1">
                        {selectedSupplier.performance.lateDeliveries}
                      </p>
                    </div>
                    <div className="bg-[#fafafa] p-4 border border-black/5">
                      <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Quality Score</p>
                      <p className="text-xl font-serif font-black text-black mt-1">
                        {selectedSupplier.performance.qualityRating.toFixed(1)} / 5.0
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars Section */}
                  <div className="border-t border-black/5 pt-4">
                    <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                      Supplier Star Rating
                    </p>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          className={
                            idx < Math.round(selectedSupplier.performance.qualityRating)
                              ? "fill-black text-black"
                              : "text-gray-200"
                          }
                        />
                      ))}
                      <span className="text-[10px] font-black text-black ml-2 uppercase">
                        ({selectedSupplier.performance.qualityRating >= 4.5 ? "Exceptional" : "Approved"})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "raw-materials" && (
        <div className="space-y-12">
          
          {/* Raw Materials Inventory Table Section */}
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Raw Materials Inventory Log
                </h3>
              </div>

              {/* Filters for Raw Materials */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex items-center bg-[#f9f9f9] border border-black/5 px-3 py-1.5 text-xs w-60">
                  <Search size={14} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search material, SKU, supplier..."
                    value={searchMaterial}
                    onChange={(e) => setSearchMaterial(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] font-medium tracking-wide w-full"
                  />
                  {searchMaterial && (
                    <button onClick={() => setSearchMaterial("")}>
                      <X size={12} className="text-gray-400" />
                    </button>
                  )}
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-black/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Material ID</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Material Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Specification Type</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Color</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Size / Width</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Unit</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Stock</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Reorder Limit</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Supplier</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Stock Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Replenish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No raw materials match filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-mono font-bold text-gray-400">{mat.id}</td>
                        <td className="px-6 py-4 font-bold text-black">{mat.name}</td>
                        <td className="px-6 py-4">{mat.category}</td>
                        <td className="px-6 py-4 text-gray-500">{mat.type}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{mat.color}</td>
                        <td className="px-6 py-4 text-gray-500 font-mono">{mat.sizeWidth}</td>
                        <td className="px-6 py-4 text-gray-400 font-bold">{mat.unit}</td>
                        <td className="px-6 py-4 font-mono text-center font-bold text-black">{mat.currentStock}</td>
                        <td className="px-6 py-4 font-mono text-center text-gray-400">{mat.reorderLevel}</td>
                        <td className="px-6 py-4 font-mono text-right font-bold">${mat.unitPrice.toFixed(2)}</td>
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
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleQuickReorder(mat)}
                            className="bg-black text-white hover:bg-black/90 p-1 rounded-none text-[8px] font-black uppercase tracking-widest transition-all"
                            title="Reorder item from supplier"
                          >
                            Reorder
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Material Mapping Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <span className="w-1.5 h-3 bg-black"></span>
              <h3 className="text-xs font-black uppercase tracking-widest text-black">
                Bill of Materials (BOM) & Product Material Mapping
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {PRODUCT_MAPPINGS.map((map, i) => (
                <div key={i} className="bg-white border border-black/5 p-6 hover:border-black/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{map.icon}</span>
                      <span className="px-2 py-0.5 border border-black text-[9px] font-black uppercase tracking-widest">
                        {map.productName}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-6">
                      {map.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-black/40">
                        Ingredients / Components
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {map.materials.map((mat, idx) => (
                          <span
                            key={idx}
                            className="bg-[#fafafa] border border-black/5 text-black px-2 py-1 text-[8px] font-bold uppercase tracking-wider"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-black/5 pt-4 mt-6">
                    <button
                      onClick={() => {
                        alert(`Generating inventory depletion forecast for ${map.productName} standard production run...`);
                      }}
                      className="w-full text-center text-[9px] font-black uppercase tracking-widest hover:opacity-50 text-black border border-black/10 py-1.5"
                    >
                      Production Cost Forecast
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === "purchase-orders" && (
        <div className="space-y-8">
          
          {/* PO Management Table */}
          <div className="bg-white border border-black/5">
            <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-1.5 h-3 bg-black"></span>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">
                  Procurement Orders (PO) Log
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
                    <option value="All">All Delivery</option>
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
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
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Supplier</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Material Name</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Qty Ordered</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Order Date</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Expected Delivery</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Delivery Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Status</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                        No purchase orders logged.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po, idx) => (
                      <tr key={idx} className="hover:bg-[#f9f9f9]">
                        <td className="px-6 py-4 font-mono font-bold text-black">{po.poNumber}</td>
                        <td className="px-6 py-4 font-bold text-black">{po.supplier}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{po.materialName}</td>
                        <td className="px-6 py-4 font-mono font-bold text-center text-black">{po.quantity}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{po.orderDate}</td>
                        <td className="px-6 py-4 font-mono text-gray-500">{po.expectedDelivery}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                              po.deliveryStatus === "Delivered"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : po.deliveryStatus === "In Transit"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-orange-50 text-orange-600 border border-orange-200"
                            }`}
                          >
                            {po.deliveryStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest inline-block ${
                              po.paymentStatus === "Paid"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : po.paymentStatus === "Partial"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {po.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              alert(`PO: ${po.poNumber}\nSupplier: ${po.supplier}\nMaterial: ${po.materialName}\nQuantity: ${po.quantity}\nExpected: ${po.expectedDelivery}\nDetails: Standard clothing raw materials logistics routing. Status is verified.`);
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
                    <YAxis tick={{ fontSize: 9, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${v}`, "Cost"]} labelStyle={{ fontSize: 9, textTransform: "uppercase" }} />
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
                    Denim fabric unit price from Apex Fabrics has risen by 4% due to container shipping rates. Recommend front-loading orders for Q3 production.
                  </p>
                </div>
                <div className="border-b border-white/10 pb-4">
                  <p className="font-black uppercase tracking-wide mb-1 text-white">Consolidated Ordering Recommendation</p>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Combine buttons and zippers orders with Trim & Button Co. to hit the $5,000 threshold for free bulk freight. Saves average $350 per PO routing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-black/5 p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6">
                  Logistics Performance Lead Times
                </h4>
                <div className="space-y-4 text-[11px]">
                  {[
                    { supplier: "Eco Thread Co.", lead: "3.2 Days Avg", rate: "99% Success" },
                    { supplier: "Elite Packaging", lead: "5.0 Days Avg", rate: "96% Success" },
                    { supplier: "Apex Fabrics", lead: "14.5 Days Avg", rate: "97% Success" },
                    { supplier: "Tag & Label Pro", lead: "7.2 Days Avg", rate: "89% Success" },
                  ].map((lead, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-black/5 pb-2">
                      <span className="font-bold text-black">{lead.supplier}</span>
                      <div className="text-right">
                        <span className="font-mono text-black font-bold mr-3">{lead.lead}</span>
                        <span className="text-[9px] font-black text-green-600 uppercase">{lead.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  alert("Downloading Excel spreadsheet log containing full 12-month procurement history database...");
                }}
                className="w-full bg-black text-white hover:bg-black/90 py-3 text-[10px] font-black uppercase tracking-widest mt-6 transition-all flex items-center justify-center space-x-2"
              >
                <FileSpreadsheet size={14} />
                <span>Export Sourcing Ledger</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: Add/Edit Supplier Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-black w-full max-w-xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                {modalMode === "add" ? "Register New Vendor" : `Edit Vendor Details: ${editingId}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-50">
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSupplier} className="p-8 space-y-5 text-[11px]">
              
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
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                  <input
                    type="text"
                    value={formPhoneNumber}
                    onChange={(e) => setFormPhoneNumber(e.target.value)}
                    placeholder="e.g. +1-555-0190"
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

      {/* MODAL 2: Create Purchase Order Form */}
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
                    // Autofill material if possible
                    const selected = suppliers.find(s => s.name === e.target.value);
                    if (selected) {
                      setPoMaterial(selected.suppliedMaterials.split(",")[0]?.trim() || "");
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

              {/* Logistics Terms Notice */}
              <div className="bg-[#fafafa] border border-black/5 p-4 space-y-1">
                <div className="flex items-center text-[9px] font-black text-black uppercase tracking-wider">
                  <Info size={12} className="mr-2 text-gray-400" /> Procurement Protocol
                </div>
                <p className="text-[8px] text-gray-400 leading-normal uppercase">
                  This PO will generate standard billing ledger entries under payment term guidelines of the selected vendor. A formal digital invoice is synchronized automatically.
                </p>
              </div>

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

    </div>
  );
};

export default SupplierManagement;
