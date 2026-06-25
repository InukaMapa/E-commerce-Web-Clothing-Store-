import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Search,
  Package,
  Tag,
  Plus,
  Save,
  X,
  ImagePlus,
  Hash,
  Ruler,
  Box,
  Upload,
  Trash,
} from "lucide-react";
import api from "../../api/axios";

// ── Category → Dimension (Size) Mapping ──────────────────────────────────
const CATEGORIES = ["T-Shirt", "Shirt", "Hoodies", "Jeans", "Shoes", "Caps", "Backpacks", "Wallets", "Skirt", "Frocks"];
const GENDERS = ["men", "women", "unisex"];

const SIZE_GROUPS = {
  clothing: ["XS", "S", "M", "L", "XL", "2XL", "XXL", "Free Size"],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
  pants: ["28", "30", "32", "34", "36", "38", "40"],
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    description: "",
    price: 0,
    category: "",
    gender: "",
    images: [],
    variants: [], // Changed from dimension/stock to list
    status: "approved",
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productId: product._id?.slice(-8).toUpperCase() || "",
        name: product.name,
        description: product.description || "",
        price: product.price,
        category: product.category || "",
        gender: product.gender || "",
        variants: product.variants || [], // Use actual variants
        images: product.images || [],
        status: product.status || "approved",
      });
      setImagePreview(product.images?.[0] || "");
    } else {
      setEditingProduct(null);
      const newProductId = generateProductId();
      setFormData({
        productId: newProductId,
        name: "",
        description: "",
        price: 0,
        category: "",
        gender: "",
        variants: [{ size: "", color: "Default", stock: 0, sku: newProductId }],
        images: [],
        status: "approved",
      });
      setImagePreview("");
    }
    setIsModalOpen(true);
  };

  const generateProductId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "PRD-";
    for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        gender: formData.gender,
        images: formData.images.filter((img) => img.trim() !== ""),
        status: formData.status,
        variants: formData.variants, // Pass all variants
      };

      if (editingProduct) {
        await api.put(`/api/admin/products/${editingProduct._id}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Product operation failed. Please try again.");
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      const res = await api.post("/api/upload/product-image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = res.data.data.url;
      // Append to images array instead of replacing
      setFormData((prev) => ({ ...prev, images: [...prev.images, imageUrl] }));
      if (!imagePreview) setImagePreview(imageUrl);
    } catch (err) {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImages }));
    if (imagePreview === formData.images[index]) {
      setImagePreview(newImages[0] || "");
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    if (field === "size" && formData.productId) {
      newVariants[index].sku = `${formData.productId}-${value.toString().toUpperCase().replace(/\s+/g, "")}`;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { size: "", color: "Default", stock: 0, sku: formData.productId },
      ],
    });
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/admin/products");
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleApproval = async (id, currentStatus) => {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    try {
      await api.put(`/api/admin/products/${id}/approve`, { status: newStatus });
      fetchProducts();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("ARE YOU SURE? THIS ACTION IS PERMANENT.")) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Deletion failed");
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStock = (product) => {
    return product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  };

  if (loading)
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-xs font-bold uppercase tracking-[0.5em] text-gray-400 animate-pulse">
          Synchronizing global inventory...
        </div>
      </div>
    );

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Global Inventory
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Product management and inventory control
          </p>
        </div>
        <div className="flex items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-black/5 pl-12 pr-6 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black/20 w-96 shadow-sm"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-black text-white px-6 py-3 ml-6 text-xs font-bold uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl"
          >
            <Plus size={16} />
            <span>ADD NEW PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-black/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fafafa] border-b border-black/5">
            <tr>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em]">
                Product
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em]">
                Dimension
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em]">
                Price
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-center">
                Stock
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-center">
                Status
              </th>
              <th className="px-8 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-[#fafafa] transition-colors group"
              >
                <td className="px-8 py-8">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gray-50 overflow-hidden flex items-center justify-center border border-black/5">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].startsWith("/uploads") ? `http://localhost:5000${product.images[0]}` : product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} className="text-gray-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-black mb-1">
                        {product.name}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                          <Tag size={10} className="mr-1" />{" "}
                          {product.category || "GENERAL"}
                        </span>
                        <span className="text-[10px] text-gray-300 font-mono">
                          {product._id?.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="flex flex-wrap gap-1">
                    {product.variants?.map((v, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 border border-black/5"
                      >
                        {v.size}
                      </span>
                    )) || (
                      <span className="text-[10px] text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-8 text-xs font-serif font-bold text-black">
                  Rs. {product.price?.toLocaleString()}
                </td>
                <td className="px-8 py-8 text-center">
                  <span
                    className={`text-xs font-black ${
                      getTotalStock(product) <= 3
                        ? "text-red-500"
                        : "text-black"
                    }`}
                  >
                    {getTotalStock(product)}
                  </span>
                </td>
                <td className="px-8 py-8 text-center">
                  <span
                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest ${
                      product.status === "approved"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {product.status || "PENDING"}
                  </span>
                </td>
                <td className="px-8 py-8 text-right">
                  <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        toggleApproval(product._id, product.status)
                      }
                      className={`p-2 border border-black/5 hover:bg-black hover:text-white transition-all ${
                        product.status === "approved"
                          ? "text-red-500 hover:text-white"
                          : "text-green-500 hover:text-white"
                      }`}
                      title={
                        product.status === "approved" ? "REJECT" : "APPROVE"
                      }
                    >
                      {product.status === "approved" ? (
                        <XCircle size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all text-gray-400 hover:text-white"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all text-red-500 hover:text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] italic">
              No inventory units detected
            </p>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Product Modal ─────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-8 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-20">
              <div>
                <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-black">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">
                  Fill in the product details below
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Product ID */}
              <div className="flex items-center space-x-4 bg-gray-50 p-5 border border-black/5">
                <Hash size={18} className="text-gray-400 shrink-0" />
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 block">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.productId}
                    onChange={(e) => {
                      const newId = e.target.value.toUpperCase();
                      setFormData({
                        ...formData,
                        productId: newId,
                        variants: formData.variants.map((v) => ({
                          ...v,
                          sku: v.size ? `${newId}-${v.size.toString().toUpperCase().replace(/\s+/g, "")}` : newId,
                        })),
                      });
                    }}
                    placeholder="PRD-XXXXXX"
                    className="w-full bg-transparent text-sm font-mono font-bold text-black outline-none tracking-widest"
                    readOnly={!!editingProduct}
                  />
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Classic Oxford Shirt"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-black/10 px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all placeholder:text-gray-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-black/10 px-5 py-4 text-xs font-bold outline-none focus:border-black transition-all resize-none placeholder:text-gray-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                />
              </div>

              {/* Row: Price + Category + Gender */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                    Price (Rs.)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full border border-black/10 px-5 py-4 text-sm font-serif font-bold outline-none focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                    Category (Product Type)
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all bg-white"
                  >
                    <option value="" disabled>SELECT CATEGORY</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Gender
                </label>
                <div className="flex gap-3">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.gender === g
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black/20 hover:border-black"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ruler size={12} />
                    <span>Variants (Size & Stock)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-black hover:underline"
                  >
                    + ADD VARIANT
                  </button>
                </label>
                
                {formData.variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-4 bg-gray-50 p-4 border border-black/5 relative group/variant">
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Size</label>
                      <select
                        required
                        value={v.size}
                        onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                        className="w-full bg-transparent text-[10px] font-bold uppercase outline-none"
                      >
                        <option value="" disabled>SIZE</option>
                        <optgroup label="CLOTHING SIZES">
                          {SIZE_GROUPS.clothing.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </optgroup>
                        <optgroup label="RECOMMENDED SHOE SIZES">
                          {SIZE_GROUPS.shoes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </optgroup>
                        <optgroup label="PANTS / WAIST SIZES">
                          {SIZE_GROUPS.pants.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))}
                        className="w-full bg-transparent text-[10px] font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                          className="w-full bg-transparent text-[8px] font-mono outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-red-500 opacity-0 group-hover/variant:opacity-100 transition-opacity"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {formData.variants.length === 0 && (
                  <p className="text-[9px] text-gray-400 italic">No variants added yet. Please add at least one.</p>
                )}
              </div>

              {/* Product Gallery */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center space-x-2">
                  <ImagePlus size={12} />
                  <span>Product Gallery (Multiple Images Support)</span>
                </label>

                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square bg-gray-50 border border-black/5 overflow-hidden">
                      <img
                        src={img.startsWith("/uploads") ? `http://localhost:5000${img}` : img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash size={10} />
                      </button>
                    </div>
                  ))}
                  
                  <label className="border-2 border-dashed border-black/10 hover:border-black/30 transition-all cursor-pointer bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center aspect-square">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Upload size={16} className="text-gray-300 mb-1" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Add Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-black/10 px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all bg-white"
                >
                  <option value="approved">APPROVED</option>
                  <option value="pending">PENDING</option>
                  <option value="rejected">REJECTED</option>
                </select>
              </div>

              {/* Submit */}
              <div className="pt-6 flex items-center justify-between border-t border-black/5">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                  This product will be added to the global marketplace inventory.
                </p>
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-10 py-4 text-xs font-black uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl border border-black"
                  >
                    <Save size={14} />
                    <span>{editingProduct ? "UPDATE" : "SAVE PRODUCT"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
