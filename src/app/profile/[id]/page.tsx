'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faFlask, faGraduationCap, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PublicProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.getPublicProfile(userId);
                setUser(data);
            } catch (err) {
                console.error("Failed to load profile", err);
                setError('User not found');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center text-gray-900 dark:text-white">
                <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                <p className="text-gray-500">The researcher profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
            <Navbar />

            {/* Header / Banner */}
            <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-20">

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
                >
                    <div className="p-8 sm:p-12">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">

                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-gray-200">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-5xl font-bold">
                                            {user.full_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center" title="Verified Researcher">
                                    <FontAwesomeIcon icon={faFlask} className="text-white text-[10px]" />
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                                    {user.full_name}
                                </h1>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-4 flex items-center justify-center md:justify-start gap-2">
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                    {user.role === 'admin' ? 'Lab Director / Administrator' : 'Researcher'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mx-auto md:mx-0">
                                    {user.bio}
                                </p>
                            </div>

                            {/* Contact / Socials */}
                            <div className="flex flex-row md:flex-col gap-4 justify-center">
                                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faTwitter} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faGithub} />
                                </button>
                                <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-700 hover:text-white transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faLinkedin} />
                                </button>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100 dark:border-gray-800">

                            {/* Research Interests */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Research Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.research_interests && user.research_interests.length > 0 ? (
                                        user.research_interests.map((interest: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                                                {interest}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 italic">No specific interests listed.</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats / Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Affiliation & Status</h3>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <FontAwesomeIcon icon={faFlask} className="text-gray-400 w-5" />
                                    <span>DeepHealth Research Lab</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-5" />
                                    <span>Tech City, TC</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5" />
                                    <span>Verified Member</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity / Publications Placeholders */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-6">Recent Publications</h2>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <p className="text-gray-500 italic text-center py-8">No publications linked yet.</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-6">Groups</h2>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                            <p className="text-gray-500 italic text-center py-8">No public groups.</p>
                        </div>
                    </div>
                </div>

            </div>

            <Footer />
        </main>
    );
}
