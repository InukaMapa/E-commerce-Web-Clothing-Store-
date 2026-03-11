import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Plus, Search, Filter } from 'lucide-react';
import api from '../../api/axios';

const MyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/api/producer/products');
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

    if (loading) return <div>Fetching your inventory...</div>;

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">Inventory Management</h2>
                    <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lifecycle of your clothing line</p>
                </div>
                <button className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center space-x-3 hover:bg-gray-800 transition-all">
                    <Plus size={16} />
                    <span>INITIALIZE NEW PRODUCT</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product) => (
                    <div key={product._id} className="bg-white border border-black/5 flex flex-col group hover:border-black/20 transition-all">
                        <div className="h-64 bg-gray-50 relative overflow-hidden">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <Package size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest ${product.status === 'approved' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                                    }`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.category || 'GENERAL'}</p>
                                    <h4 className="text-[14px] font-bold uppercase tracking-widest text-black">{product.name}</h4>
                                </div>
                                <p className="text-[14px] font-serif font-bold text-black">${product.price}</p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center space-x-6 text-gray-400">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-widest mb-1 text-gray-300">Total Stock</span>
                                        <span className="text-[11px] font-bold text-black">
                                            {product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0} UNITS
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all">
                                        <Edit2 size={14} />
                                    </button>
                                    <button className="p-2 border border-black/5 hover:bg-black hover:text-white transition-all text-red-500 hover:text-white">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div className="py-40 text-center bg-white border border-dashed border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-4">You have no active products in your portfolio.</p>
                    <button className="text-black border-b-2 border-black pb-1 text-[10px] font-black uppercase tracking-[0.2em]">Launch Project</button>
                </div>
            )}
        </div>
    );
};

export default MyProducts;
