'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Plus, X } from 'lucide-react';

interface AppointmentItem {
    id: string; appointment_date: string; slot_start: string; slot_end: string;
    status: string; source: string;
    patient: { name: string; phone: string | null; email: string | null };
    doctor: { name: string }; service: { name: string } | null;
}

export default function AppointmentsAdminPage() {
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [bookForm, setBookForm] = useState({
        doctor_user_id: '', service_id: '', patient_user_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        slot_start: '', slot_end: '',
    });

    useEffect(() => {
        api.get('/clinics').then(res => {
            setClinics(res.data);
            if (res.data.length > 0) setSelectedClinic(res.data[0].id);
        });
    }, []);

    const fetchAppointments = () => {
        if (!selectedClinic) return;
        setLoading(true);
        api.get(`/appointments/today?clinicId=${selectedClinic}`)
            .then(res => setAppointments(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAppointments(); }, [selectedClinic]);

    useEffect(() => {
        if (!selectedClinic) return;
        api.get(`/doctors?clinicId=${selectedClinic}`).then(r => {
            setDoctors(r.data);
            if (r.data.length > 0) setBookForm(f => ({ ...f, doctor_user_id: r.data[0].user_id }));
        });
        api.get(`/services?clinicId=${selectedClinic}`).then(r => {
            setServices(r.data);
            if (r.data.length > 0) setBookForm(f => ({ ...f, service_id: r.data[0].id }));
        });
        api.get('/users').then(r => setPatients(r.data.filter((u: any) => u.role === 'PATIENT')));
    }, [selectedClinic]);

    // Fetch slots when doctor or date changes
    useEffect(() => {
        if (!bookForm.doctor_user_id || !bookForm.appointment_date) return;
        api.get(`/doctors/${bookForm.doctor_user_id}/availability?date=${bookForm.appointment_date}`)
            .then(r => {
                const avail = r.data.availableSlots?.filter((s: any) => s.available) || [];
                setSlots(avail);
                if (avail.length > 0) setBookForm(f => ({ ...f, slot_start: avail[0].start, slot_end: avail[0].end }));
            })
            .catch(console.error);
    }, [bookForm.doctor_user_id, bookForm.appointment_date]);

    const handleBook = async () => {
        if (!bookForm.doctor_user_id || !bookForm.service_id || !bookForm.patient_user_id) return;
        try {
            await api.post('/appointments', {
                clinic_id: selectedClinic,
                doctor_user_id: bookForm.doctor_user_id,
                service_id: bookForm.service_id,
                patient_user_id: bookForm.patient_user_id,
                appointment_date: bookForm.appointment_date,
                slot_start: bookForm.slot_start,
                slot_end: bookForm.slot_end,
                source: 'ADMIN',
            });
            setShowBooking(false);
            fetchAppointments();
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id: string, status: string) => {
        await api.patch(`/appointments/${id}/status`, { status });
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const statusColor: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
        COMPLETED: 'bg-green-100 text-green-700', NO_SHOW: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 text-gray-500',
    };

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Today's Appointments</h1>
                    <p className="text-gray-500 mt-1">Manage today's appointment schedule.</p>
                </div>
                <div className="flex gap-3">
                    {clinics.length > 1 && (
                        <select value={selectedClinic} onChange={e => setSelectedClinic(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button onClick={() => setShowBooking(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <Plus size={18} /> Book Appointment
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center h-40 items-center">
                    <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No appointments scheduled for today.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-600">Patient</th>
                                <th className="text-left p-4 font-medium text-gray-600">Doctor</th>
                                <th className="text-left p-4 font-medium text-gray-600">Time</th>
                                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900">{appt.patient.name}</p>
                                        <p className="text-xs text-gray-500">{appt.patient.phone || appt.patient.email}</p>
                                    </td>
                                    <td className="p-4 text-gray-700">{appt.doctor.name}</td>
                                    <td className="p-4 text-gray-700">{appt.slot_start} – {appt.slot_end}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[appt.status] || ''}`}>{appt.status}</span></td>
                                    <td className="p-4">
                                        <div className="flex gap-1.5">
                                            {appt.status === 'PENDING' && <button onClick={() => updateStatus(appt.id, 'CONFIRMED')} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Confirm"><CheckCircle size={16} /></button>}
                                            {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                                                <>
                                                    <button onClick={() => updateStatus(appt.id, 'NO_SHOW')} className="p-1.5 rounded hover:bg-orange-50 text-orange-600" title="No Show"><AlertTriangle size={16} /></button>
                                                    <button onClick={() => updateStatus(appt.id, 'CANCELLED')} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Cancel"><XCircle size={16} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Booking Modal */}
            {showBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
                            <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <select value={bookForm.patient_user_id} onChange={e => setBookForm({ ...bookForm, patient_user_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                    <select value={bookForm.doctor_user_id} onChange={e => setBookForm({ ...bookForm, doctor_user_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {doctors.map(d => <option key={d.user_id} value={d.user_id}>{d.user.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                    <select value={bookForm.service_id} onChange={e => setBookForm({ ...bookForm, service_id: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={bookForm.appointment_date} onChange={e => setBookForm({ ...bookForm, appointment_date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot ({slots.length} available)</label>
                                <select value={bookForm.slot_start} onChange={e => {
                                    const slot = slots.find((s: any) => s.start === e.target.value);
                                    setBookForm({ ...bookForm, slot_start: e.target.value, slot_end: slot?.end || '' });
                                }}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {slots.length === 0 && <option>No slots available</option>}
                                    {slots.map((s: any) => <option key={s.start} value={s.start}>{s.start} – {s.end}</option>)}
                                </select>
                            </div>
                            <button onClick={handleBook} disabled={!bookForm.patient_user_id || !bookForm.slot_start}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-medium transition-colors">
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
