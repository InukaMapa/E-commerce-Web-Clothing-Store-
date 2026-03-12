import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../cart/CartContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/api/products/${id}`);
        let data = res.data?.data?.product;
        if (!data) throw new Error("Product data is missing");

        // Merge logic
        try {
          const othersRes = await api.get(`/api/products?search=${encodeURIComponent(data.name)}`);
          const otherProducts = othersRes.data?.data?.products || [];
          const exactMatches = otherProducts.filter(p => 
            p.name.trim().toLowerCase() === data.name.trim().toLowerCase() && 
            p._id !== data._id
          );

          // Tag original variants first
          const allVariants = (data.variants || []).map(v => ({...v, originalProductId: data._id}));

          if (exactMatches.length > 0) {
            exactMatches.forEach(p => {
              const tagged = (p.variants || []).map(v => ({...v, originalProductId: p._id}));
              allVariants.push(...tagged);
            });
            
            const allImages = [...(data.images || [])];
            exactMatches.forEach(p => { allImages.push(...(p.images || [])); });
            data.images = Array.from(new Set(allImages));
          }
          data.variants = allVariants;
        } catch (othersErr) {
          console.error("Merging failed:", othersErr);
        }

        setProduct(data);
        if (data.variants?.length > 0) {
          const firstInStock = data.variants.find(v => v.stock > 0);
          setSelectedVariant(firstInStock || data.variants[0]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setAdding(true);
    addItem({
      productId: selectedVariant.originalProductId || product._id,
      name: product.name,
      image: product.images?.[0] || "",
      variantId: selectedVariant._id,
      variantName: selectedVariant.size,
      variantSku: selectedVariant.sku,
      price: product.price,
      quantity,
    });
    setTimeout(() => {
      setAdding(false);
      setSuccessMsg("Added to bag!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 600);
  };

  const adjustQty = (delta) => {
    const max = selectedVariant?.stock || 1;
    setQuantity(prev => {
      const next = prev + delta;
      return next >= 1 && next <= max ? next : prev;
    });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div></div>;
  if (error || !product) return <div className="flex min-h-screen flex-col items-center justify-center p-6"><h2 className="text-2xl font-bold mb-4">Error loading product</h2><button onClick={() => navigate("/")} className="bg-black text-white px-6 py-2 rounded-lg">Return to Shop</button></div>;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
          <div className="flex flex-col-reverse">
            <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-4">
                {product.images?.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white ring-2 ring-offset-2 ${activeImage === idx ? 'ring-black' : 'ring-transparent'}`}>
                    <img src={resolveImage(img)} alt="" className="h-full w-full object-cover object-center rounded-md" />
                  </button>
                ))}
              </div>
            </div>
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
              <img src={resolveImage(product.images?.[activeImage]) || ""} className="h-full w-full object-cover object-center" alt={product.name} />
            </div>
          </div>
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            <div className="mt-3"><p className="text-3xl text-gray-900 font-bold">Rs. {product.price?.toFixed(2)}</p></div>
            <div className="mt-6"><div className="space-y-6 text-sm text-gray-700 leading-relaxed min-h-[100px]">{product.description}</div></div>
            <div className="mt-10">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Select Dimension (Size)</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.variants?.map((v, idx) => (
                      <button key={`${v.sku}-${idx}`} disabled={v.stock === 0} onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        className={`px-4 py-2 border rounded-full text-xs font-bold transition-all ${selectedVariant?.sku === v.sku && selectedVariant?.originalProductId === v.originalProductId ? 'bg-black text-white border-black shadow-md' : v.stock === 0 ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50' : 'bg-white text-gray-700 border-gray-200 hover:border-black'}`}>
                        {v.size} {v.stock === 0 ? '(Out of Stock)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Quantity</h3>
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button onClick={() => adjustQty(-1)} className="p-2 hover:text-black"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
                    <span className="w-12 text-center text-xs font-bold">{quantity}</span>
                    <button onClick={() => adjustQty(1)} className="p-2 hover:text-black"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
                  </div>
                </div>
              </div>
              <div className="mt-10 flex flex-col space-y-4">
                <button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0 || adding} className={`flex w-full items-center justify-center rounded-xl bg-black px-8 py-4 text-xs font-bold text-white transition-all ${(!selectedVariant || selectedVariant.stock === 0 || adding) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}`}>
                  {adding ? 'Processing...' : (selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Bag')}
                </button>
                {successMsg && <p className="text-center text-xs font-bold text-green-600 animate-bounce">{successMsg}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
