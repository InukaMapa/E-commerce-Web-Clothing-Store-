import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Store,
  Mail,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";

const ProducerManagement = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducers = async () => {
    try {
      const res = await api.get("/api/admin/producers");
      setProducers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducers();
  }, []);

  const approveProducer = async (id) => {
    try {
      await api.put(`/api/admin/producers/${id}/approve`);
      fetchProducers();
    } catch (err) {
      alert("Approval failed");
    }
  };

  const suspendProducer = async (id) => {
    try {
      await api.put(`/api/admin/producers/${id}/suspend`);
      fetchProducers();
    } catch (err) {
      alert("Suspension failed");
    }
  };

  const filtered = producers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.producerProfile?.storeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  if (loading) return <div>Analyzing vendor network...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            Vendor Ecosystem
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Lifecycle management of clothing brands
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="SEARCH BRANDS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-black/5 pl-12 pr-6 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:border-black/20 w-80 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filtered.map((producer) => (
          <div
            key={producer._id}
            className="bg-white border border-black/5 p-8 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-serif text-xl font-bold">
                  {producer.producerProfile?.storeName?.charAt(0) || "S"}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-black mb-1">
                    {producer.producerProfile?.storeName || "Unnamed Store"}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center">
                      <Mail size={12} className="mr-1.5" /> {producer.email}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1.5" /> JOINED{" "}
                      {new Date(producer.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${
                  producer.producerProfile?.isApproved
                    ? "bg-green-50 text-green-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {producer.producerProfile?.isApproved ? "VERIFIED" : "PENDING"}
              </span>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
              <button
                onClick={() => approveProducer(producer._id)}
                disabled={producer.producerProfile?.isApproved}
                className="flex items-center justify-center space-x-3 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
              >
                <CheckCircle size={14} />
                <span>Approve</span>
              </button>
              <button
                onClick={() => suspendProducer(producer._id)}
                className="flex items-center justify-center space-x-3 py-3 border border-black text-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                <XCircle size={14} />
                <span>Suspend</span>
              </button>
            </div>

            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-gray-300 hover:text-black">
                <Eye size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] italic">
            No brand partners matched your query
          </p>
        </div>
      )}
    </div>
  );
};

export default ProducerManagement;
