import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const isLowStock = product.variants?.some(v => v.stock <= 5 && v.stock > 0);

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden rounded-2xl border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1523381235212-d73f49380fbb?q=80&w=800&auto=format&fit=crop"}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        {isLowStock && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Selling Fast
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <p className="text-sm font-black text-gray-900">${product.price?.toFixed(2)}</p>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="w-full rounded-lg bg-gray-950 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
