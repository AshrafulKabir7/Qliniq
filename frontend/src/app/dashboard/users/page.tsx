'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { UserPlus, Trash2, X, Users, Shield } from 'lucide-react';

interface UserItem {
    id: string; name: string; email: string | null; phone: string | null;
    role: string; status: string; created_at: string;
    doctorProfile?: { specialty: string; room_no: string; clinic: { name: string } } | null;
}

const ROLES = ['CLINIC_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'];
const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    CLINIC_ADMIN: 'bg-blue-100 text-blue-700',
    RECEPTIONIST: 'bg-green-100 text-green-700',
    DOCTOR: 'bg-indigo-100 text-indigo-700',
    PATIENT: 'bg-gray-100 text-gray-600',
};

export default function UsersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'RECEPTIONIST' });
    const [search, setSearch] = useState('');

    const fetch_ = () => {
        api.get('/users').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
    };
    useEffect(() => { fetch_(); }, []);

    const handleCreate = async () => {
        if (!form.name || !form.email || !form.password) return;
        await api.post('/users', form);
        setShowModal(false);
        setForm({ name: '', email: '', phone: '', password: '', role: 'RECEPTIONIST' });
        fetch_();
    };

    const handleDeactivate = async (id: string) => {
        await api.delete(`/users/${id}`);
        fetch_();
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 mt-1">Create and manage staff accounts.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <UserPlus size={18} /> Add User
                </button>
            </div>

            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            {loading ? (
                <div className="flex justify-center h-40 items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-600">Name</th>
                                <th className="text-left p-4 font-medium text-gray-600">Email / Phone</th>
                                <th className="text-left p-4 font-medium text-gray-600">Role</th>
                                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900">{u.name}</p>
                                        {u.doctorProfile && <p className="text-xs text-gray-500">{u.doctorProfile.specialty} • {u.doctorProfile.clinic?.name}</p>}
                                    </td>
                                    <td className="p-4 text-gray-700">{u.email || u.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[u.role] || 'bg-gray-100 text-gray-500'}`}>{u.role.replace('_', ' ')}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-medium ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>{u.status}</span>
                                    </td>
                                    <td className="p-4">
                                        {u.role !== 'SUPER_ADMIN' && u.status === 'ACTIVE' && (
                                            <button onClick={() => handleDeactivate(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Deactivate">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No users found.</p>}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                            </select>
                            <button onClick={handleCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors">Create User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
