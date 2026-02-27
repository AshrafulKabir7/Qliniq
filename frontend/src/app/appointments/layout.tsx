'use client';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ClipboardList, Radio } from 'lucide-react';

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!user) {
            router.push('/login');
        } else if (user.role === 'SUPER_ADMIN' || user.role === 'CLINIC_ADMIN') {
            router.push('/dashboard/appointments');
        }
    }, [user, router]);

    if (!mounted || !user) return null;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-indigo-600 text-white h-16 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ClipboardList size={24} className="text-indigo-200" />
                        {user.role === 'DOCTOR' ? 'Doctor Portal' : 'My Appointments'}
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span>{user.name}</span>
                    <span className="text-indigo-200 text-xs">({user.role.replace('_', ' ')})</span>
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-indigo-700/50 hover:bg-indigo-700 rounded-full transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
