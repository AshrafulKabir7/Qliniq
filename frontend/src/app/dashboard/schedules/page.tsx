'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Trash2, X, Calendar } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Schedule {
    id: string; doctor_user_id: string; day_of_week: number;
    start_time: string; end_time: string; slot_duration_min: number;
    doctor?: { name: string; doctorProfile?: { specialty: string } };
}

export default function SchedulesPage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        doctor_user_id: '', day_of_week: 0, start_time: '09:00', end_time: '17:00', slot_duration_min: 15,
    });

    useEffect(() => {
        api.get('/clinics').then(r => {
            setClinics(r.data);
            if (r.data.length > 0) setSelectedClinic(r.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!selectedClinic) return;
        api.get(`/doctors?clinicId=${selectedClinic}`).then(r => {
            setDoctors(r.data);
            if (r.data.length > 0) setForm(f => ({ ...f, doctor_user_id: r.data[0].user_id }));
        });
    }, [selectedClinic]);

    const fetchSchedules = () => {
        if (!selectedClinic) return;
        setLoading(true);
        api.get(`/schedules?clinicId=${selectedClinic}`)
            .then(r => setSchedules(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSchedules(); }, [selectedClinic]);

    const handleCreate = async () => {
        await api.post('/schedules', { ...form, clinic_id: selectedClinic });
        setShowModal(false);
        fetchSchedules();
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/schedules/${id}`);
        fetchSchedules();
    };

    // Group by doctor
    const byDoctor: Record<string, Schedule[]> = {};
    schedules.forEach(s => {
        const key = s.doctor?.name || s.doctor_user_id;
        if (!byDoctor[key]) byDoctor[key] = [];
        byDoctor[key].push(s);
    });

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
                    <p className="text-gray-500 mt-1">Manage when each doctor is available.</p>
                </div>
                <div className="flex gap-3">
                    {clinics.length > 1 && (
                        <select value={selectedClinic} onChange={e => setSelectedClinic(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <Plus size={18} /> Add Slot
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center h-40 items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            ) : Object.keys(byDoctor).length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No schedules configured. Add a schedule slot to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(byDoctor).map(([doctorName, slots]) => (
                        <div key={doctorName} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-3">
                                <h3 className="font-semibold text-indigo-900">{doctorName}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {slots.sort((a, b) => a.day_of_week - b.day_of_week).map(s => (
                                    <div key={s.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <span className="w-24 font-medium text-gray-900 text-sm">{DAYS[s.day_of_week]}</span>
                                            <span className="text-sm text-gray-600">{s.start_time} – {s.end_time}</span>
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{s.slot_duration_min}min slots</span>
                                        </div>
                                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add Schedule Slot</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select value={form.doctor_user_id} onChange={e => setForm({ ...form, doctor_user_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {doctors.map(d => <option key={d.user_id} value={d.user_id}>{d.user.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                <select value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: +e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (minutes)</label>
                                <input type="number" value={form.slot_duration_min} onChange={e => setForm({ ...form, slot_duration_min: +e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <button onClick={handleCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors">
                                Add Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
