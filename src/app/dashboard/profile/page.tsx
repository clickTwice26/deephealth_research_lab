'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSave, faUserCircle, faCog, faMoon, faBell, faShieldAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // In a real app, you would use state to manage form fields
    const [name, setName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [activeTab, setActiveTab] = useState('profile');

    // Profile Picture Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    // Use local state for avatar to update immediately before reload/context update
    const [avatarUrl, setAvatarUrl] = useState(user?.profile_image);

    // Update avatarUrl when user context updates (e.g. on mount/refresh)
    useEffect(() => {
        if (user?.profile_image) {
            setAvatarUrl(user.profile_image);
        }
    }, [user]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Get token from localStorage assuming it's stored there by AuthContext
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/upload/profile-picture`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state and ideally trigger a user refresh
            setAvatarUrl(response.data.url);
            // Optionally reload page or re-fetch user profile
            window.location.reload();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
        <button
            onClick={onToggle}
            className={`w-10 h-5 rounded-full p-1 transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    if (!mounted) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Settings</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 px-1 mr-6 text-sm font-medium transition-colors relative ${activeTab === 'profile'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                    Profile
                    {activeTab === 'profile' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'settings'
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                    Preferences
                    {activeTab === 'settings' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="relative group cursor-pointer" onClick={handleFileClick}>
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
                                    {uploading ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    ) : avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FontAwesomeIcon icon={faCamera} className="text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.full_name}</h2>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full inline-block mt-1">
                                    {user?.role?.toUpperCase() || 'RESEARCHER'}
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm font-medium"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    Bio
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your research interests..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm resize-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-800">
                                <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 text-sm font-bold">
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Appearance */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FontAwesomeIcon icon={faMoon} className="text-blue-500" />
                                Appearance
                            </h3>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">Dark Mode</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Toggle mobile & desktop theme</p>
                                </div>
                                <Toggle
                                    active={theme === 'dark'}
                                    onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                />
                            </div>
                        </section>

                        {/* Notifications */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FontAwesomeIcon icon={faBell} className="text-amber-500" />
                                Notifications
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">Email Notifications</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Updates about experiments</p>
                                    </div>
                                    <Toggle active={true} onToggle={() => { }} />
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">Project Alerts</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Team activity digest</p>
                                    </div>
                                    <Toggle active={false} onToggle={() => { }} />
                                </div>
                            </div>
                        </section>

                        {/* Security */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                                Security
                            </h3>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">Two-Factor Authentication</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Extra security layer</p>
                                </div>
                                <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Enable
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper for image error (mock)
const imgError = false;
