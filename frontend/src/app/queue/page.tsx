'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/lib/store';
import { Play, CheckCircle, SkipForward, Clock, Plus, X } from 'lucide-react';

interface Token {
    id: string;
    token_number: number;
    status: string;
    doctor: { name: string; doctorProfile?: { room_no: string; specialty: string } };
    appointment?: { patient: { name: string; phone: string } } | null;
    patient_name?: string;
}

export default function QueuePage() {
    const { user } = useAuthStore();
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [walkInData, setWalkInData] = useState({ doctor_user_id: '', patient_name: '' });
    const [actionLoading, setActionLoading] = useState('');

    // Fetch clinics on mount
    useEffect(() => {
        api.get('/clinics').then(res => {
            setClinics(res.data);
            if (res.data.length > 0) setSelectedClinic(res.data[0].id);
        }).catch(console.error);
    }, []);

    // Fetch doctors for the selected clinic
    useEffect(() => {
        if (!selectedClinic) return;
        api.get(`/doctors?clinicId=${selectedClinic}`)
            .then(res => setDoctors(res.data))
            .catch(console.error);
    }, [selectedClinic]);

    // Fetch today's queue
    const fetchQueue = useCallback(() => {
        if (!selectedClinic) return;
        api.get(`/queue/tokens/today?clinicId=${selectedClinic}`)
            .then(res => setTokens(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedClinic]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // WebSocket for live updates
    useEffect(() => {
        if (!selectedClinic) return;
        const socket = getSocket();
        socket.connect();
        socket.emit('joinClinicRoom', { tenantId: user?.tenantId || 'default', clinicId: selectedClinic });

        socket.on('queue.tokenCreated', () => fetchQueue());
        socket.on('queue.tokenCalled', () => fetchQueue());
        socket.on('queue.tokenUpdated', () => fetchQueue());

        return () => {
            socket.off('queue.tokenCreated');
            socket.off('queue.tokenCalled');
            socket.off('queue.tokenUpdated');
            socket.disconnect();
        };
    }, [selectedClinic, user, fetchQueue]);

    const getPatientName = (token: Token) => {
        return token.appointment?.patient?.name || token.patient_name || 'Walk-in Patient';
    };

    const callToken = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/queue/tokens/${id}/call`);
            fetchQueue();
        } catch (err) { console.error(err); }
        setActionLoading('');
    };

    const updateStatus = async (id: string, status: string) => {
        setActionLoading(id);
        try {
            await api.patch(`/queue/tokens/${id}`, { status });
            fetchQueue();
        } catch (err) { console.error(err); }
        setActionLoading('');
    };

    const handleWalkIn = async () => {
        if (!walkInData.doctor_user_id) return;
        try {
            await api.post('/queue/tokens/walk-in', {
                clinic_id: selectedClinic,
                doctor_user_id: walkInData.doctor_user_id,
                patient_name: walkInData.patient_name || 'Walk-in Patient',
            });
            setShowWalkInModal(false);
            setWalkInData({ doctor_user_id: '', patient_name: '' });
            fetchQueue();
        } catch (err) { console.error(err); }
    };

    const activeToken = tokens.find(t => t.status === 'CALLED' || t.status === 'IN_SERVICE');
    const waitingTokens = tokens.filter(t => t.status === 'WAITING').sort((a, b) => a.token_number - b.token_number);
    const nextWaiting = waitingTokens[0];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Queue Control</h2>
                    <p className="text-gray-500">Live queue tracking for {clinics.find(c => c.id === selectedClinic)?.name || 'Clinic'}</p>
                </div>
                <div className="flex gap-3">
                    {clinics.length > 1 && (
                        <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button
                        onClick={() => setShowWalkInModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus size={18} /> Walk-in Token
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Token Controller */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">Currently Serving</h3>

                        {activeToken ? (
                            <>
                                <div className="text-7xl font-black text-indigo-600 my-6">{activeToken.token_number}</div>
                                <p className="text-xl font-medium text-gray-800 mb-2">{getPatientName(activeToken)}</p>
                                <p className="text-sm text-gray-500 mb-8">{activeToken.doctor.name} • Room {activeToken.doctor.doctorProfile?.room_no || 'N/A'}</p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => updateStatus(activeToken.id, 'DONE')}
                                        disabled={actionLoading === activeToken.id}
                                        className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} /> Mark Done
                                    </button>
                                    <button
                                        onClick={() => updateStatus(activeToken.id, 'SKIPPED')}
                                        disabled={actionLoading === activeToken.id}
                                        className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                                    >
                                        <SkipForward size={20} /> No Show
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-gray-400">
                                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No patient currently active</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Next up</p>
                            <p className="text-lg font-bold text-gray-900">
                                {nextWaiting ? `#${nextWaiting.token_number} - ${getPatientName(nextWaiting)}` : 'Queue Empty'}
                            </p>
                        </div>
                        <button
                            onClick={() => nextWaiting && callToken(nextWaiting.id)}
                            disabled={!nextWaiting || actionLoading === nextWaiting?.id}
                            className="bg-indigo-600 disabled:bg-indigo-300 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all disabled:cursor-not-allowed"
                        >
                            <Play fill="currentColor" size={20} /> Call Next
                        </button>
                    </div>
                </div>

                {/* Waiting List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
                        <h3 className="font-semibold text-gray-900">Waiting List ({waitingTokens.length})</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {waitingTokens.map((token, i) => (
                            <div key={token.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                                        {token.token_number}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{getPatientName(token)}</p>
                                        <p className="text-xs text-gray-500">{token.doctor.name} • ~{(i + 1) * 15}m</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => callToken(token.id)}
                                    className="text-indigo-600 opacity-0 group-hover:opacity-100 text-sm font-medium transition-opacity"
                                >
                                    Call Now
                                </button>
                            </div>
                        ))}
                        {waitingTokens.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">No more patients waiting</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Walk-in Modal */}
            {showWalkInModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Add Walk-in Patient</h3>
                            <button onClick={() => setShowWalkInModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={walkInData.patient_name}
                                    onChange={(e) => setWalkInData({ ...walkInData, patient_name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                <select
                                    value={walkInData.doctor_user_id}
                                    onChange={(e) => setWalkInData({ ...walkInData, doctor_user_id: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map(d => <option key={d.user_id} value={d.user_id}>{d.user.name} - {d.specialty || 'General'}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleWalkIn}
                                disabled={!walkInData.doctor_user_id}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Generate Token
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
