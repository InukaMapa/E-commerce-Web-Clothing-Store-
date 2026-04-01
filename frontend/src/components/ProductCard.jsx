import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const isLowStock = product.variants?.some(v => v.stock <= 5 && v.stock > 0);

  return (
    <div
      onClick={() => navigate(`/products/${product._id}`)}
      className="group cursor-pointer flex flex-col bg-white overflow-hidden transition-all"
    >
      <div className="aspect-[3/4] bg-muted overflow-hidden relative">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1523381235212-d73f49380fbb?q=80&w=800&auto=format&fit=crop"}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        {isLowStock && (
          <span className="absolute top-4 left-4 bg-black text-white text-[8px] font-sans font-bold px-2 py-1 uppercase tracking-[0.2em]">
            Limited Editon
          </span>
        )}
<<<<<<< Updated upstream
      </div>
      <div className="flex flex-col pt-4 pb-2 space-y-1">
        <h3 className="text-xs font-sans font-bold text-black uppercase tracking-widest group-hover:opacity-60 transition-opacity">
          {product.name}
        </h3>
        <p className="text-[10px] font-sans text-gray-500 tracking-tight line-clamp-1">
          {product.description || "Crafted from Premium Materials"}
        </p>
        <p className="text-xs font-sans font-bold text-black mt-1">
=======
        <div className="absolute inset-x-2 bottom-2 bg-black p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
          <span className="text-white text-sm font-black uppercase tracking-[0.3em] pb-1">View Details</span>
        </div>
      </div>
      <div className="flex flex-col pt-4 px-1 space-y-1 text-left ml-3 items-start">
        <h3 className="text-[12px] font-black text-black uppercase tracking-widest group-hover:text-gray-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-500 tracking-wider line-clamp-1 font-sans font-medium uppercase opacity-60">
          {product.description || "Crafted from Premium Materials"}
        </p>
        <p className="text-[12px] font-black text-black pt-2 tracking-widest">
>>>>>>> Stashed changes
          Rs. {product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
