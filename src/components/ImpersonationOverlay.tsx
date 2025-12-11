'use client';

import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret, faStopCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

export default function ImpersonationOverlay() {
    const { isImpersonating, stopImpersonating, user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    useEffect(() => {
        if (!isImpersonating) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    stopImpersonating();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isImpersonating, stopImpersonating]);

    if (!isImpersonating) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 shadow-lg flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-bold animate-pulse">
                    <FontAwesomeIcon icon={faUserSecret} className="text-xl" />
                    <span className="uppercase tracking-wider text-sm hidden sm:inline">Impersonating Mode</span>
                </div>
                <div className="h-6 w-px bg-white/30 hidden sm:block"></div>
                <p className="text-sm font-medium">
                    Viewing as: <span className="font-bold underline decoration-white/50 underline-offset-2">{user?.full_name}</span> ({user?.email})
                </p>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 bg-red-700/50 px-3 py-1.5 rounded-lg border border-red-500/50">
                    <FontAwesomeIcon icon={faClock} className="text-red-200" />
                    <span className="font-mono font-bold tracking-widest">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </span>
                </div>

                <button
                    onClick={stopImpersonating}
                    className="bg-white text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
                >
                    <FontAwesomeIcon icon={faStopCircle} />
                    <span className="hidden sm:inline">Stop Impersonating</span>
                    <span className="sm:hidden">Stop</span>
                </button>
            </div>
        </div>
    );
}
