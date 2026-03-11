import React, { useState, useEffect } from 'react';
import { MoreVertical, ShieldAlert, UserCheck, Trash2, Search } from 'lucide-react';
import api from '../../api/axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
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
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        try {
            await api.put(`/api/admin/users/${id}/status`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">Customer Registry</h2>
                    <p className="text-[12px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lifecycle management and access control</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="SEARCH USERS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-black/5 pl-12 pr-6 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black/20 w-80"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-black/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#fafafa] border-b border-black/5">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">User Details</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Join Date</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center">Status</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-[#fafafa] transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-[12px] font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold uppercase tracking-widest text-black mb-1">{user.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-10 py-8 text-center">
                                    <span className={`inline-block px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] ${user.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end space-x-4">
                                        <button
                                            onClick={() => toggleStatus(user._id, user.status)}
                                            className="p-2 hover:bg-black hover:text-white transition-all border border-transparent hover:border-black"
                                            title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                        >
                                            {user.status === 'active' ? <ShieldAlert size={16} /> : <UserCheck size={16} />}
                                        </button>
                                        <button className="p-2 hover:bg-black hover:text-white transition-all border border-transparent hover:border-black">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] italic">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
