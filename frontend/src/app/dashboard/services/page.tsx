'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Trash2, X, Package } from 'lucide-react';

interface ServiceItem {
    id: string; name: string; duration_min: number; status: string;
}

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', duration_min: 15 });

    useEffect(() => {
        api.get('/clinics').then(r => {
            setClinics(r.data);
            if (r.data.length > 0) setSelectedClinic(r.data[0].id);
        });
    }, []);

    const fetchServices = () => {
        if (!selectedClinic) return;
        setLoading(true);
        api.get(`/services?clinicId=${selectedClinic}`)
            .then(r => setServices(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchServices(); }, [selectedClinic]);

    const handleCreate = async () => {
        if (!form.name) return;
        await api.post('/services', { ...form, clinic_id: selectedClinic });
        setShowModal(false);
        setForm({ name: '', duration_min: 15 });
        fetchServices();
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/services/${id}`);
        fetchServices();
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Services</h1>
                    <p className="text-gray-500 mt-1">Clinic services available for booking.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <Plus size={18} /> Add Service
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-40 items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No services yet. Add services that patients can book.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {services.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-5 hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{s.name}</p>
                                    <p className="text-sm text-gray-500">{s.duration_min} minutes</p>
                                </div>
                                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add Service</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Service Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="number" placeholder="Duration (minutes)" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: +e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button onClick={handleCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
