'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
      return;
    }

    if (user.role === 'SUPER_ADMIN' || user.role === 'CLINIC_ADMIN') {
      router.push('/dashboard');
    } else if (user.role === 'RECEPTIONIST') {
      router.push('/queue');
    } else {
      router.push('/appointments');
    }
  }, [user, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent mx-auto animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading Clinic Workspace...</p>
      </div>
    </div>
  );
}
