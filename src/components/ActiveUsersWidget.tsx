'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

interface LiveUser {
    id: string;
    name: string;
    email: string;
    role: string;
    last_active: string;
    profile_image?: string;
    status: 'online' | 'offline';
}

export default function ActiveUsersWidget() {
    const [users, setUsers] = useState<LiveUser[]>([]);

    useEffect(() => {
        const fetchLiveUsers = async () => {
            try {
                const data = await api.getLiveUsers() as any; // Type assertion since api return type update is not strictly enforced in frontend yet or needs api.ts update
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch live users', error);
            }
        };

        fetchLiveUsers();
        const interval = setInterval(fetchLiveUsers, 30000); // Refresh every 30s

        return () => clearInterval(interval);
    }, []);

    // if (users.length === 0) return null; // Always show widget

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Active Users</span>
                <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {users.length} Online
                </span>
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {users.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No active users currently.</p>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase overflow-hidden">
                                        {user.profile_image ? (
                                            <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                                        <FontAwesomeIcon icon={faCircle} className="text-[8px] text-green-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {user.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
