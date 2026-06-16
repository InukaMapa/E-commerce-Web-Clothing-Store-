import React, { useState, useEffect } from "react";
import {
  Package,
  Edit2,
  Trash2,
  Plus,
  X,
  Upload,
  Save,
  ChevronRight,
  Hash,
} from "lucide-react";
import api from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PRODUCT_CATEGORIES = ["T-Shirt", "Shirt", "Hoodies", "Jeans", "Pants", "Shoes", "Caps", "Backpacks", "Wallets"];
const GENDERS = ["men", "women", "unisex"];

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    gender: "",
    variants: [{ size: "M", color: "Black", stock: 10, sku: "" }],
    images: [],
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/producer/products");
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

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category || "",
        gender: product.gender || "",
        variants: product.variants || [
          { size: "M", color: "Black", stock: 10, sku: "" },
        ],
        images: product.images || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        gender: "",
        variants: [{ size: "M", color: "Black", stock: 10, sku: "" }],
        images: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/api/producer/products/${editingProduct._id}`, formData);
      } else {
        await api.post("/api/producer/products", formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Synchronization failed");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("ARE YOU SURE?")) return;
    try {
      await api.delete(`/api/producer/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Deletion failed");
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { size: "M", color: "Black", stock: 0, sku: "" },
      ],
    });
  };

  if (loading) return <div>Fetching your inventory...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Inventory Management
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Lifecycle of your clothing line
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl"
        >
          <Plus size={16} />
          <span>INITIALIZE NEW PRODUCT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-black/5 flex flex-col group hover:border-black/20 transition-all"
          >
            <div className="h-64 bg-gray-50 relative overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={resolveImage(product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 text-xs font-black uppercase tracking-widest ${
                    product.status === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {product.status || "PENDING"}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                    {product.category || "GENERAL"}
                  </p>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-black">
                    {product.name}
                  </h4>
                </div>
                <p className="text-sm font-serif font-bold text-black">
                  Rs. {product.price}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest mb-1 text-gray-300">
                      Total Stock
                    </span>
                    <span className="text-xs font-bold text-black uppercase tracking-widest">
                      {product.variants?.reduce((acc, v) => acc + v.stock, 0) ||
                        0}{" "}
                      UNITS
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all text-red-500 hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-4xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-10 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-20">
              <div>
                <h3 className="text-xl font-serif font-bold uppercase tracking-widest text-black">
                  {editingProduct ? "Update Product" : "Initialize Product"}
                </h3>
                <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mt-1">
                  Lifecycle stage:{" "}
                  {editingProduct ? "Optimization" : "Inception"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Product Identity
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. LUXURY SILK SHIRT"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Valuation (USD)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full border-b border-black/10 py-3 text-sm font-serif font-bold outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Category Classification
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all bg-transparent"
                    >
                      <option value="" disabled>SELECT CATEGORY</option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Gender
                    </label>
                    <div className="flex space-x-2">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${formData.gender === g ? 'bg-black text-white' : 'border-black/10 text-gray-400'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Visual Assets (URLs)
                    </label>
                    <input
                      type="text"
                      placeholder="IMAGE URLS (COMMA SEPARATED)"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          images: e.target.value
                            .split(",")
                            .map((s) => s.trim()),
                        })
                      }
                      className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 block">
                  Variant Matrix
                </label>
                <div className="space-y-4">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-4 gap-6 bg-gray-50 p-6 items-end group relative"
                    >
                      <div className="space-y-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Dimension
                        </span>
                        <input
                          type="text"
                          value={v.size}
                          placeholder="SIZE"
                          onChange={(e) =>
                            handleVariantChange(idx, "size", e.target.value)
                          }
                          className="w-full bg-transparent border-b border-black/5 py-2 text-xs font-black uppercase outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Spectrum
                        </span>
                        <input
                          type="text"
                          value={v.color}
                          placeholder="COLOR"
                          onChange={(e) =>
                            handleVariantChange(idx, "color", e.target.value)
                          }
                          className="w-full bg-transparent border-b border-black/5 py-2 text-xs font-black uppercase outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Units
                        </span>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              idx,
                              "stock",
                              Number(e.target.value),
                            )
                          }
                          className="w-full bg-transparent border-b border-black/5 py-2 text-xs font-black outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Logic Code (SKU)
                        </span>
                        <input
                          type="text"
                          value={v.sku}
                          placeholder="SKU"
                          onChange={(e) =>
                            handleVariantChange(idx, "sku", e.target.value)
                          }
                          className="w-full bg-transparent border-b border-black/5 py-2 text-xs font-mono outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full h-12 border border-dashed border-black/10 flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                  >
                    + APPEND VARIANT
                  </button>
                </div>
              </div>

              <div className="pt-10 flex items-center justify-between border-t border-black/5">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                  By submitting, you initiate the synchronization process.
                  Products require administrative validation before global
                  visibility.
                </p>
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black"
                  >
                    Disregard
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-12 py-4 text-xs font-black uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl"
                  >
                    <Save size={14} />
                    <span>Synchronize</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="py-40 text-center bg-white border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mb-4">
            You have no active products in your portfolio.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="text-black border-b-2 border-black pb-1 text-xs font-black uppercase tracking-[0.2em]"
          >
            Launch Project
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
