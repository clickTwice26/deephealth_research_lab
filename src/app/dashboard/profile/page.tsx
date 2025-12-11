'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSave } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
    const { user } = useAuth();
    // In a real app, you would use state to manage form fields
    const [name, setName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profile Settings</h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6 mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.full_name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{user?.roles?.join(', ') || 'Researcher'}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bio
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Tell us about your research interests..."
                            className="w-full px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                            <FontAwesomeIcon icon={faSave} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
