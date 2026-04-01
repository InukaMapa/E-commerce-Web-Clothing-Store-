import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  History,
  Search,
  Mail,
} from "lucide-react";
import api from "../../api/axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      await api.put(`/api/admin/users/${id}/block`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert("Protocol override failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("ARE YOU SURE?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Erase operation failed");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <div>Analyzing customer database...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
            User Directory
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
            Lifecycle management for global customers
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="PROBE USER DATA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-black/5 pl-12 pr-6 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-black/20 w-80 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-black/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fafafa] border-b border-black/5">
            <tr>
              <th className="px-10 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em]">
                Customer
              </th>
              <th className="px-10 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-center">
                Status
              </th>
              <th className="px-10 py-6 text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-right">
                Synchronization Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-[#fafafa] transition-colors group"
              >
                <td className="px-10 py-10">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-serif text-sm font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-black mb-1">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center">
                        <Mail size={12} className="mr-2" /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-10 text-center">
                  <span
                    className={`px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] ${
                      user.status === "blocked"
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {user.status || "ACTIVE"}
                  </span>
                </td>
                <td className="px-10 py-10 text-right">
                  <div className="flex items-center justify-end space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleStatus(user._id, user.status)}
                      className={`p-2 border border-black/5 transition-all ${
                        user.status === "blocked"
                          ? "text-green-600 hover:bg-green-50"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      title={
                        user.status === "blocked"
                          ? "RESTORE ACCESS"
                          : "SUSPEND ACCESS"
                      }
                    >
                      {user.status === "blocked" ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <ShieldAlert size={18} />
                      )}
                    </button>
                    <button className="p-2 border border-black/5 text-gray-300 hover:text-black hover:border-black transition-all">
                      <History size={18} />
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="p-2 border border-black/5 text-gray-200 hover:text-red-600 hover:border-red-600 transition-all"
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
          <div className="py-40 text-center uppercase text-xs font-black text-gray-300 tracking-[0.3em] italic">
            No entities match the current probe parameters
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
