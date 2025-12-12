import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useHeartbeat() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const sendHeartbeat = async () => {
            if (document.visibilityState === 'visible') {
                try {
                    await api.sendHeartbeat();
                } catch (error) {
                    console.error('Heartbeat failed', error);
                }
            }
        };

        // Initial heartbeat
        sendHeartbeat();

        const interval = setInterval(sendHeartbeat, 60000); // Every 60 seconds

        return () => clearInterval(interval);
    }, [user]);
}
