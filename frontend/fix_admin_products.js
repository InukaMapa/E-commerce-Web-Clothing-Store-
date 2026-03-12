import fs from 'fs';
import path from 'path';

const targetPath = path.resolve('src/pages/admin/ProductManagement.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Insert the imports needed if missing
if (!content.includes('Plus')) {
    content = content.replace(/import {\n([\s\S]*?)} from "lucide-react";/, 'import {\n$1  Plus,\n  Save,\n  X,\n} from "lucide-react";');
}

// Ensure the state exists
let stateInsert = `
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    variants: [{ size: "M", color: "Black", stock: 10, sku: "" }],
    images: [],
    status: "approved"
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category || "",
        variants: product.variants || [{ size: "M", color: "Black", stock: 10, sku: "" }],
        images: product.images || [],
        status: product.status || "approved"
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category: "",
        variants: [{ size: "M", color: "Black", stock: 10, sku: "" }],
        images: [],
        status: "approved"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // use standard PUT since admin can update freely
        await api.put(\`/api/products/\${editingProduct._id}\`, formData);
      } else {
        await api.post("/api/products", formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Product update failed");
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
      variants: [...formData.variants, { size: "M", color: "Black", stock: 0, sku: "" }],
    });
  };
`;

if (!content.includes('isModalOpen')) {
    content = content.replace(/(const \[searchTerm, setSearchTerm\] = useState\(""\);)/, '$1\n' + stateInsert);
}

// Add the initialize button next to the search bar
const searchBarRegex = /(<div className="flex items-end justify-between">[\s\S]*?<div className="relative">[\s\S]*?<\/div>\s*<\/div>)/;
const buttonCode = `
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-6 py-3 ml-6 text-xs font-bold uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all shadow-xl"
        >
          <Plus size={16} />
          <span>INITIALIZE NEW PRODUCT</span>
        </button>
`;
content = content.replace(/(<div className="relative">[\s\S]*?<\/div>)/, '$1' + buttonCode);

const headerFlexRegex = /(<div className="flex items-end justify-between">[\s\S]*?<div>[\s\S]*?<\/div>)(\s*<div className="relative">[\s\S]*?<\/div>)(\s*<button[\s\S]*?<\/button>)/;
if (headerFlexRegex.test(content)) {
    content = content.replace(headerFlexRegex, '<div className="flex items-end justify-between"><div>$1</div><div className="flex items-center">$2$3</div>');
} else {
    // Alternatively manually wrap them 
    content = content.replace(/(<div className="relative">[\s\S]*?<\/div>[\s\S]*?<button[\s\S]*?<\/button>)/, '<div className="flex items-center">$1</div>');
}

// Add the edit button functionality!
content = content.replace(/<button className="p-2 border border-black\/5 hover:bg-black hover:text-white transition-all text-gray-400 hover:text-white">([\s\S]*?<\/button>)/, '<button onClick={() => handleOpenModal(product)} className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all text-gray-400 hover:text-white">$1');


// Append Modal JSX before the final </div>
const modalJSX = `
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
                  {editingProduct ? "Update Product Attributes" : "Initialize System Product"}
                </h3>
                <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] mt-1">
                  Global inventory synchronization
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
                      placeholder="e.g. CORE COLLECTION HOODIE"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Valuation (Rs.)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full border-b border-black/10 py-3 text-sm font-serif font-bold outline-none focus:border-black transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Category Classification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ESSENTIALS"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border-b border-black/10 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">
                      Visual Assets (URLs)
                    </label>
                    <input
                      type="text"
                      placeholder="IMAGE URLS (COMMA SEPARATED)"
                      value={formData.images.join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          images: e.target.value.split(",").map((s) => s.trim()),
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
                          onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
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
                          onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
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
                          onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))}
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
                          onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
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
                  By submitting, you directly update the global product registry for the marketplace ecosystem.
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
                    <span>OVERRIDE & SAVE</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
`;

if (!content.includes('form onSubmit={handleSubmit}')) {
    content = content.replace(/(<\/div>\s*)$/, modalJSX + '\n$1');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Done inserting admin add product modal');
