import React, { useState, useEffect } from "react";
import { Tag, Plus, Save, Trash2, X } from "lucide-react";
import api from "../../api/axios";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/categories", formData);
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      alert("Initialization failed");
    }
  };

  if (loading) return <div>Synchronizing taxonomy...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Taxonomy
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Platform category framework
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl"
        >
          <Plus size={16} />
          <span>CREATE CATEGORY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white border text-center border-black/5 p-10 hover:border-black/20 transition-all group"
          >
            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
              <Tag size={24} />
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-black mb-2">
              {cat.name}
            </h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest min-h-[40px]">
              {cat.description || "BASIC CLASSIFICATION ALGORITHM"}
            </p>

            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-red-500 uppercase font-bold tracking-widest hover:text-red-400 transition-all flex items-center">
                <Trash2 size={12} className="mr-1" /> Decommission
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-40 text-center bg-white border border-dashed border-gray-200">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] mb-4">
            No structural nodes currently exist.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-xl relative z-10 shadow-2xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-serif font-bold uppercase tracking-widest text-black">
                New Node
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                  Classification String
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. OUTERWEAR"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                  Matrix Description (Optional)
                </label>
                <textarea
                  placeholder="DEFINE THE BOUNDARIES OF THIS VECTOR..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-black/10 p-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all h-24"
                />
              </div>
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center space-x-3 hover:bg-gray-800 transition-all"
                >
                  <Save size={14} />
                  <span>Synchronize Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
