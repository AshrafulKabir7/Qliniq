'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Stethoscope, MapPin, DollarSign, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

interface Doctor {
    user_id: string;
    clinic_id: string;
    specialty: string | null;
    room_no: string | null;
    fee: string;
    average_consultation_time: number;
    user: { name: string; phone: string | null; email: string | null };
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState<any[]>([]);
    const [selectedClinic, setSelectedClinic] = useState('');

    useEffect(() => {
        api.get('/clinics').then(res => {
            setClinics(res.data);
            if (res.data.length > 0) {
                setSelectedClinic(res.data[0].id);
            }
        }).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedClinic) return;
        setLoading(true);
        api.get(`/doctors?clinicId=${selectedClinic}`)
            .then(res => setDoctors(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [selectedClinic]);

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Directory</h1>
                    <p className="text-gray-500 mt-1">All registered doctors and their profiles.</p>
                </div>
                <div className="flex gap-3">
                    {clinics.length > 1 && (
                        <select
                            value={selectedClinic}
                            onChange={(e) => setSelectedClinic(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <Link href="/dashboard/doctors/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <Plus size={18} /> Register Doctor
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
            ) : doctors.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Stethoscope size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No doctors registered for this clinic yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doc) => (
                        <div key={doc.user_id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {doc.user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{doc.user.name}</p>
                                    <p className="text-sm text-indigo-600">{doc.specialty || 'General Practice'}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span>Room: {doc.room_no || 'Not assigned'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={14} className="text-gray-400" />
                                    <span>Fee: ৳{doc.fee}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-gray-400" />
                                    <span>Avg. {doc.average_consultation_time} min/patient</span>
                                </div>
                            </div>
                            {doc.user.email && (
                                <p className="text-xs text-gray-400 mt-3 truncate">{doc.user.email}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
