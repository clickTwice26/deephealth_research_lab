'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faClock, faArrowRight, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { api, Job } from '@/lib/api';

export default function CareersPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch active jobs only
                const response = await api.getJobs(1, 100, '', true);
                setJobs(response.items);
                setIsLoading(false);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
                setError('Failed to load open positions. Please try again later.');
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Helper to format date relative (e.g. "2 days ago")
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl">
                    <div className="w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                </div>
                <div className="absolute bottom-0 left-0 p-12 opacity-10 blur-3xl">
                    <div className="w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                            Join Our Team
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Help Shape the Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Medical AI</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                            We're decoding life's most complex challenges. Join a team of researchers, engineers, and scientists dedicated to transforming healthcare through artificial intelligence.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-2xl font-bold">Open Positions</h2>
                            <p className="text-gray-500 dark:text-gray-400">Current opportunities to join the lab.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FontAwesomeIcon icon={faSpinner} className="text-3xl text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-500">Loading positions...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
                                <FontAwesomeIcon icon={faExclamationCircle} className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Unavailable</h3>
                            <p className="text-gray-500 max-w-md">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No open positions at the moment.</p>
                            <p className="text-sm text-gray-400">Please check back later or follow us on social media.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((position, index) => (
                                <motion.div
                                    key={position._id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-500/30 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-50/50 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {position.title}
                                                </h3>
                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                                    {position.department}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0 line-clamp-2">
                                                {position.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faBriefcase} className="text-gray-400" />
                                                    {position.type}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                                                    {position.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                                    {position.posted_date ? getRelativeTime(position.posted_date) : 'Recently'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <a
                                                href={position.application_link || `/jobs/${position._id}/apply`}
                                                target={position.application_link ? '_blank' : undefined}
                                                rel={position.application_link ? "noopener noreferrer" : undefined}
                                                className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-sm flex items-center gap-2 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white transition-colors"
                                            >
                                                Apply Now
                                                <FontAwesomeIcon icon={faArrowRight} className="transform group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
