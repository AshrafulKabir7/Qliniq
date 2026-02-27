'use client';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, LogOut, Settings, Stethoscope, ClipboardList, Clock, Package } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CLINIC_ADMIN')) {
            router.push('/login');
        }
    }, [user, router]);

    if (!mounted || !user) return null;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/appointments', label: 'Appointments', icon: ClipboardList },
        { href: '/dashboard/doctors', label: 'Doctors', icon: Stethoscope },
        { href: '/dashboard/schedules', label: 'Schedules', icon: Clock },
        { href: '/dashboard/services', label: 'Services', icon: Package },
        { href: '/dashboard/users', label: 'Staff', icon: Users },
        { href: '/queue', label: 'Queue Control', icon: Calendar },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                    <h1 className="text-xl font-bold tracking-tighter text-indigo-600">Qliniq</h1>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                    <div className="flex-1"></div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-600 hover:bg-red-50 text-left w-full transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800">Admin Workspace</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
                        </div>
                        <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="p-8 flex-1">{children}</div>
            </main>
        </div>
    );
}
