'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { User } from 'lucide-react';

interface Token {
    id: string;
    token_number: number;
    status: string;
    doctor: { name: string; doctorProfile?: { room_no: string } };
}

export default function DisplayKioskPage() {
    const params = useParams();
    const clinicId = params.clinicId as string;

    const [tokens, setTokens] = useState<Token[]>([]);
    const [calledToken, setCalledToken] = useState<Token | null>(null);
    const [time, setTime] = useState(new Date());

    const fetchQueue = useCallback(() => {
        fetch(`http://localhost:3001/queue/tokens/public?clinicId=${clinicId}`)
            .then(res => res.json())
            .then((data: Token[]) => {
                setTokens(data);
                const called = data.find(t => t.status === 'CALLED');
                setCalledToken(called || null);
            })
            .catch(err => console.error(err));
    }, [clinicId]);

    useEffect(() => {
        fetchQueue();
        // Poll every 5 seconds for kiosk simplicity
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [fetchQueue]);

    // Clock update
    useEffect(() => {
        const clockInterval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clockInterval);
    }, []);

    const waitingTokens = tokens.filter(t => t.status === 'WAITING');

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans selection:bg-indigo-500/30">
            <header className="px-10 py-6 flex justify-between items-center border-b border-gray-800 bg-black/20 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Clinic Queue Display</h1>
                    <p className="text-indigo-400 font-medium text-lg mt-1 tracking-wide">Live Queue System</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="text-4xl font-black tabular-nums tracking-tighter text-white">
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 font-medium">
                        {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Now Serving */}
                <div className="w-1/2 p-10 flex flex-col border-r border-gray-800 bg-gray-900/50">
                    <div className="bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-[0.2em] text-sm py-2 px-4 rounded-full self-start mb-8 border border-indigo-500/20">
                        Currently Calling
                    </div>

                    {calledToken ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center -mt-10">
                            <div className="text-[12rem] leading-none font-black text-white tracking-tighter drop-shadow-2xl">
                                {calledToken.token_number}
                            </div>

                            <div className="w-full max-w-lg mt-12 bg-gray-800 rounded-3xl p-8 border border-gray-700 shadow-2xl flex items-center justify-between">
                                <div className="text-left">
                                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Please proceed to</p>
                                    <p className="text-3xl font-bold text-white">{calledToken.doctor.doctorProfile?.room_no || 'Room A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Doctor</p>
                                    <p className="text-2xl font-semibold text-indigo-300">{calledToken.doctor.name}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-gray-600">
                            <User size={120} className="mb-8 opacity-20" />
                            <p className="text-2xl font-light">Waiting for the next patient...</p>
                        </div>
                    )}
                </div>

                {/* Right: Waiting List */}
                <div className="w-1/2 flex flex-col bg-black/40 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>

                    <div className="p-10 flex-1 flex flex-col relative z-10">
                        <h2 className="text-xl font-bold text-gray-300 uppercase tracking-widest pl-2 border-l-4 border-indigo-500 mb-8">
                            Up Next ({waitingTokens.length})
                        </h2>

                        <div className="flex-1 overflow-hidden">
                            <div className="grid grid-cols-1 gap-4">
                                {waitingTokens.slice(0, 6).map((token) => (
                                    <div key={token.id} className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 flex items-center shadow-lg">
                                        <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center border-2 border-indigo-500/30 text-3xl font-bold text-white shadow-inner">
                                            {token.token_number}
                                        </div>
                                        <div className="ml-8 flex-1">
                                            <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-1">Waiting For</p>
                                            <p className="text-xl font-semibold text-gray-100">{token.doctor.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-block bg-white/10 px-4 py-2 rounded-lg text-sm font-medium text-gray-300">
                                                Room {token.doctor.doctorProfile?.room_no || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {waitingTokens.length === 0 && (
                                    <div className="text-center py-20 text-gray-600">
                                        <p className="text-xl">No patients currently waiting</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                    <div className="py-4 px-10 bg-indigo-600/20 text-indigo-200 text-xl font-medium truncate flex items-center relative z-10 overflow-hidden">
                        <span className="animate-pulse mr-4 text-indigo-400">●</span>
                        <span>Welcome! Please check in at the reception desk or scan the QR code for quick token generation.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
