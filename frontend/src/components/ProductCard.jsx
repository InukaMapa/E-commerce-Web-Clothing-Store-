import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function resolveImage(img) {
  if (!img) return null;
  return img.startsWith("/uploads") ? `${BASE_URL}${img}` : img;
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const isLowStock = product.variants?.some(v => v.stock <= 5 && v.stock > 0);

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group cursor-pointer flex flex-col bg-white overflow-hidden transition-all pb-6 border border-transparent hover:border-black/5 hover:shadow-xl"
    >
      <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
        <img
          src={resolveImage(product.images?.[0]) || "https://images.unsplash.com/photo-1523381235212-d73f49380fbb?q=80&w=800&auto=format&fit=crop"}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {isLowStock && (
          <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl">
            Limited Edition
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
            <span className="text-white text-xs font-black uppercase tracking-[0.3em] border-b border-white pb-1">View Details</span>
        </div>
      </div>
      <div className="flex flex-col pt-6 px-4 space-y-2 text-center items-center">
        <h3 className="text-xs font-black text-black uppercase tracking-widest group-hover:text-gray-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 tracking-widest line-clamp-1 italic font-serif">
          {product.description || "Crafted from Premium Materials"}
        </p>
        <p className="text-xs font-black text-black mt-4 border-t border-black/10 pt-4 w-12 text-center">
          Rs. {product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
