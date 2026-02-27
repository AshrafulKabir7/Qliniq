'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Calendar, CheckCircle, Clock, User, Stethoscope } from 'lucide-react';

interface DoctorAppointment {
    id: string;
    token_number: number;
    status: string;
    appointment?: { patient: { name: string; phone: string } } | null;
    patient_name?: string;
    doctor: { name: string; doctorProfile?: { room_no: string } };
}

interface PatientAppointment {
    id: string;
    appointment_date: string;
    slot_start: string;
    slot_end: string;
    status: string;
    doctor: { name: string };
    clinic: { name: string };
    service: { name: string } | null;
}

export default function AppointmentsPage() {
    const { user } = useAuthStore();
    const isDoctor = user?.role === 'DOCTOR';

    if (isDoctor) return <DoctorView />;
    return <PatientView />;
}

function DoctorView() {
    const [tokens, setTokens] = useState<DoctorAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');

    useEffect(() => {
        api.get('/clinics').then(res => {
            setClinics(res.data);
            if (res.data.length > 0) setSelectedClinic(res.data[0].id);
        }).catch(console.error);
    }, []);

    const fetchQueue = useCallback(() => {
        if (!selectedClinic) return;
        api.get(`/queue/tokens/today?clinicId=${selectedClinic}`)
            .then(res => setTokens(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedClinic]);

    useEffect(() => { fetchQueue(); }, [fetchQueue]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/queue/tokens/${id}`, { status });
            fetchQueue();
        } catch (err) { console.error(err); }
    };

    const getPatientName = (token: DoctorAppointment) => {
        return token.appointment?.patient?.name || token.patient_name || 'Walk-in Patient';
    };

    const calledToken = tokens.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
    const waitingTokens = tokens.filter(t => t.status === 'WAITING');
    const doneTokens = tokens.filter(t => t.status === 'DONE' || t.status === 'SKIPPED');

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Today's Queue</h1>
                <p className="text-gray-500">Manage your patients for today.</p>
            </div>

            {/* Currently Serving */}
            {calledToken && (
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
                    <p className="text-xs uppercase font-bold text-indigo-600 tracking-widest mb-3">Currently Serving</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-black text-indigo-600">
                                {calledToken.token_number}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">{getPatientName(calledToken)}</p>
                                <p className="text-sm text-gray-500">Token #{calledToken.token_number}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {calledToken.status === 'CALLED' && (
                                <button onClick={() => updateStatus(calledToken.id, 'IN_SERVICE')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Start Consultation
                                </button>
                            )}
                            <button onClick={() => updateStatus(calledToken.id, 'DONE')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1">
                                <CheckCircle size={16} /> Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Waiting */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock size={18} className="text-orange-500" /> Waiting ({waitingTokens.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {waitingTokens.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center">
                                    {t.token_number}
                                </div>
                                <p className="font-medium text-gray-900">{getPatientName(t)}</p>
                            </div>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Waiting</span>
                        </div>
                    ))}
                    {waitingTokens.length === 0 && (
                        <div className="p-6 text-center text-gray-400 text-sm">No patients waiting</div>
                    )}
                </div>
            </div>

            {/* Completed */}
            {doneTokens.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500" /> Completed ({doneTokens.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {doneTokens.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 text-gray-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center">
                                        {t.token_number}
                                    </div>
                                    <p>{getPatientName(t)}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.status === 'DONE' ? 'Completed' : 'Skipped'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function PatientView() {
    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/appointments/my')
            .then(res => setAppointments(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusColor: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        COMPLETED: 'bg-green-100 text-green-700',
        NO_SHOW: 'bg-red-100 text-red-700',
        CANCELLED: 'bg-gray-200 text-gray-500',
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-500">View all your past and upcoming appointments.</p>
            </div>

            {appointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">You don't have any appointments yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map(appt => (
                        <div key={appt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Stethoscope size={16} className="text-indigo-600" />
                                        <p className="font-semibold text-gray-900">{appt.doctor.name}</p>
                                    </div>
                                    <p className="text-sm text-gray-500">{appt.clinic.name}</p>
                                    {appt.service && <p className="text-xs text-gray-400">{appt.service.name}</p>}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[appt.status] || 'bg-gray-100 text-gray-500'}`}>
                                    {appt.status}
                                </span>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(appt.appointment_date).toLocaleDateString()}
                                </div>
                                {appt.slot_start && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} className="text-gray-400" />
                                        {appt.slot_start} - {appt.slot_end}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
