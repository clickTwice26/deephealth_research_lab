'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faBell, faShieldAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    );

    if (!mounted) return null;

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

            {/* Appearance */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-8 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faMoon} className="text-blue-500" />
                        Appearance
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                        </div>
                        <Toggle
                            active={theme === 'dark'}
                            onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-8 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faBell} className="text-amber-500" />
                        Notifications
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your experiments</p>
                        </div>
                        <Toggle active={true} onToggle={() => { }} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Project Alerts</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when team members update projects</p>
                        </div>
                        <Toggle active={false} onToggle={() => { }} />
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                        Security
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Enable
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
