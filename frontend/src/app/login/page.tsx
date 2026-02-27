'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Stethoscope } from 'lucide-react';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setToken, setUser, user } = useAuthStore();

    useEffect(() => {
        if (user) {
            redirectByRole(user.role);
        }
    }, [user]);

    const redirectByRole = (role: string) => {
        if (role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN') router.push('/dashboard');
        else if (role === 'RECEPTIONIST') router.push('/queue');
        else router.push('/appointments');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            setToken(res.data.access_token);
            setUser(res.data.user);
            redirectByRole(res.data.user.role);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, phone: phone || undefined });
            setToken(res.data.access_token);
            setUser(res.data.user);
            redirectByRole(res.data.user.role);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
                        <Stethoscope size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Qliniq</h1>
                    <p className="text-gray-500 mt-1">{isRegister ? 'Create your patient account' : 'Sign in to your account'}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4 border border-red-100">{error}</div>
                    )}

                    <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
                        {isRegister && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880..."
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-lg font-semibold shadow-sm shadow-indigo-200 transition-all">
                            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            {isRegister ? 'Already have an account? Sign In' : 'New patient? Create Account'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">Qliniq — Smart Clinic Management</p>
            </div>
        </div>
    );
}
