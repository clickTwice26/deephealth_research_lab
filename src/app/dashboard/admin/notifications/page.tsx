'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { api, AdminNotificationSend } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faBell, faEnvelope, faUsers, faUser, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminNotificationsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<AdminNotificationSend>({
        title: '',
        message: '',
        type: 'info',
        target_type: 'all',
        target_id: '',
        channels: ['in-app']
    });

    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && user?.role !== 'admin') {
            router.push('/dashboard');
        }
        // Fetch groups for dropdown
        const fetchGroups = async () => {
            // Fetch groups if admin wants to target them
            try {
                const data = await api.researchGroups.list();
                setGroups(data);
            } catch (e) {
                console.error("Failed to fetch groups", e);
            }
        };
        fetchGroups();
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await api.sendAdminNotification(form);
            if (res.success) {
                setSuccess(`Successfully sent to ${res.count} users.`);
                setForm(prev => ({ ...prev, title: '', message: '' }));
            } else {
                setError(res.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to send notification");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChannel = (channel: 'in-app' | 'email') => {
        setForm(prev => {
            const channels = prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel];
            return { ...prev, channels };
        });
    };

    if (authLoading || !user) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500" />
                Send Notifications
            </h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">

                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Target Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Target Audience
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'all', label: 'All Users', icon: faUsers },
                                    { id: 'role', label: 'By Role', icon: faUser },
                                    { id: 'group', label: 'Research Group', icon: faLayerGroup },
                                    { id: 'user', label: 'Specific User', icon: faUser }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setForm({ ...form, target_type: type.id as any })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${form.target_type === type.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={type.icon} />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            {form.target_type === 'role' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Role</label>
                                    <select
                                        value={form.target_id || ''}
                                        onChange={(e) => setForm({ ...form, target_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        required
                                    >
                                        <option value="">Select Role...</option>
                                        <option value="admin">Admin</option>
                                        <option value="researcher">Researcher</option>
                                        <option value="member">Member</option>
                                        <option value="user">User</option>
                                    </select>
                                </div>
                            )}
                            {form.target_type === 'group' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Research Group</label>
                                    <select
                                        value={form.target_id || ''}
                                        onChange={(e) => setForm({ ...form, target_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        required
                                    >
                                        <option value="">Select Group...</option>
                                        {groups.map(group => (
                                            <option key={group._id} value={group._id}>
                                                {group.name} ({group.topic})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {form.target_type === 'user' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Email or ID</label>
                                    <input
                                        type="text"
                                        value={form.target_id || ''}
                                        onChange={(e) => setForm({ ...form, target_id: e.target.value })}
                                        placeholder="admin@example.com"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Important Update"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Enter your message here..."
                            required
                        />
                    </div>

                    {/* CTA Button (Optional) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button Label (Optional)</label>
                            <input
                                type="text"
                                value={form.action_label || ''}
                                onChange={(e) => setForm({ ...form, action_label: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="e.g., View Report"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Button URL (Optional)</label>
                            <input
                                type="text"
                                value={form.action_url || ''}
                                onChange={(e) => setForm({ ...form, action_url: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="e.g., /dashboard/reports/123"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                            <div className="flex gap-4">
                                {['info', 'success', 'warning', 'error'].map(t => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            className="accent-blue-600"
                                            name="type"
                                            checked={form.type === t}
                                            onChange={() => setForm({ ...form, type: t } as any)}
                                        />
                                        <span className="capitalize text-sm">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Channels</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => toggleChannel('in-app')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${form.channels.includes('in-app')
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faBell} />
                                    In-App
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleChannel('email')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${form.channels.includes('email')
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    Email
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || form.channels.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? 'Sending...' : (
                                <>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
