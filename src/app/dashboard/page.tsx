'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { faNewspaper, faBriefcase, faBookOpen } from '@fortawesome/free-solid-svg-icons';
import PaginatedResourceSection from '@/components/dashboard/PaginatedResourceSection';

export default function DashboardPage() {
    const { user } = useAuth();
    const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
    const [loadingActiveUsers, setLoadingActiveUsers] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const users = await api.getLiveUsers();
                setActiveUsersCount(users.length);
            } catch (err) {
                console.error("Failed to fetch active users", err);
            } finally {
                setLoadingActiveUsers(false);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Note: Loading and auth check are handled in layout.tsx now, but we can keep a safe check or just rely on user being present
    if (!user) return null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.full_name?.split(' ')[0] || 'Researcher'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Here's an overview of your ongoing research projects and lab updates.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Active Projects', value: '12', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Total Experiments', value: '148', color: 'from-purple-500 to-pink-500' },
                    { label: 'Hours Logged', value: '324', color: 'from-amber-500 to-orange-500' },
                    { label: 'Active Researchers', value: loadingActiveUsers ? '...' : activeUsersCount.toString(), color: 'from-green-500 to-emerald-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"
                    >
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <div className={`text-3xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Resources Grid */}
            <div className="space-y-8">
                {/* News Section */}
                <PaginatedResourceSection
                    title="Latest News"
                    icon={faNewspaper}
                    fetchData={api.getNews}
                    color="text-orange-600"
                    renderItem={(item: any) => (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700/50">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{item.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap bg-white dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Open Positions */}
                    <PaginatedResourceSection
                        title="Open Positions"
                        icon={faBriefcase}
                        fetchData={(p, s, q) => api.getJobs(p, s, q, true)}
                        color="text-blue-600"
                        renderItem={(job: any) => (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">{job.type}</span>
                                        <span>•</span>
                                        <span>{job.department}</span>
                                    </div>
                                </div>
                                <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                    Apply &rarr;
                                </button>
                            </div>
                        )}
                    />

                    {/* Publications */}
                    <PaginatedResourceSection
                        title="Recent Publications"
                        icon={faBookOpen}
                        fetchData={api.getPublications}
                        color="text-purple-600"
                        renderItem={(pub: any) => (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">
                                    {pub.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">{pub.journal} • {new Date(pub.date).getFullYear()}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {pub.tags.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="text-[10px] bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
