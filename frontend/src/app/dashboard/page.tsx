'use client';

import { useEffect, useState } from 'react';
import { Activity, Users, Clock, AlertCircle, Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
    totalAppointments: number;
    waitingCount: number;
    avgWaitTime: number;
    noShowCount: number;
    activeDoctors: { userId: string; name: string; specialty: string; roomNo: string; clinicName: string }[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/stats/dashboard')
            .then(res => setStats(res.data))
            .catch(err => console.error('Failed to load stats:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const metrics = [
        { title: "Total Appointments", value: stats?.totalAppointments ?? 0, icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Waiting Room", value: stats?.waitingCount ?? 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
        { title: "Avg. Wait Time", value: `${stats?.avgWaitTime ?? 0}m`, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
        { title: "No Shows", value: stats?.noShowCount ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    ];

    return (
        <div className="max-w-6xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Today's Overview</h1>
                <p className="text-gray-500 mt-1">Here's what's happening at the clinic today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Doctors */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 p-6 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Active Doctors</h2>
                        <Link href="/dashboard/doctors" className="text-sm text-indigo-600 hover:underline font-medium">View All →</Link>
                    </div>
                    <div className="p-0">
                        {stats?.activeDoctors && stats.activeDoctors.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {stats.activeDoctors.map((doc) => (
                                    <div key={doc.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <Stethoscope size={20} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{doc.name}</p>
                                            <p className="text-sm text-gray-500">{doc.specialty || 'General'} • Room {doc.roomNo || 'N/A'}</p>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 p-6 text-sm text-center">No doctors registered yet.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/queue" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors">
                            <p className="font-medium text-sm text-gray-900">Open Queue Management</p>
                            <p className="text-xs text-gray-500 mt-0.5">Manage tokens and walk-ins</p>
                        </Link>
                        <Link href="/dashboard/appointments" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors">
                            <p className="font-medium text-sm text-gray-900">Today's Appointments</p>
                            <p className="text-xs text-gray-500 mt-0.5">View and manage today's bookings</p>
                        </Link>
                        <Link href="/dashboard/doctors" className="block w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors">
                            <p className="font-medium text-sm text-gray-900">Doctor Directory</p>
                            <p className="text-xs text-gray-500 mt-0.5">View all registered doctors</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
