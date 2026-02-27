'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Save, Building2 } from 'lucide-react';

export default function SettingsPage() {
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<any>(null);
    const [form, setForm] = useState({ name: '', address: '', phone: '', timezone: 'UTC' });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/clinics').then(r => {
            setClinics(r.data);
            if (r.data.length > 0) {
                setSelectedClinic(r.data[0]);
                setForm({ name: r.data[0].name, address: r.data[0].address || '', phone: r.data[0].phone || '', timezone: r.data[0].timezone || 'UTC' });
            }
        });
    }, []);

    const handleSave = async () => {
        if (!selectedClinic) return;
        setSaving(true);
        try {
            await api.patch(`/clinics/${selectedClinic.id}`, form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Clinic Settings</h1>
                <p className="text-gray-500 mt-1">Update your clinic's information.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg"><Building2 size={20} className="text-indigo-600" /></div>
                    <h2 className="text-lg font-semibold text-gray-900">Clinic Information</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="UTC">UTC</option>
                            <option value="Asia/Dhaka">Asia/Dhaka (BST)</option>
                            <option value="America/New_York">America/New York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>
                </div>

                <button onClick={handleSave} disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
