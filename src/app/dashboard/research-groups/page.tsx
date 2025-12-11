'use client';

import { useState, useEffect } from 'react';
import { api, ResearchGroup } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers, faArrowRight, faFlask } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CreateGroupModal from '@/components/research-groups/CreateGroupModal';

export default function ResearchGroupsPage() {
    const [groups, setGroups] = useState<ResearchGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchGroups = async () => {
        try {
            const data = await api.researchGroups.list();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Research Groups</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Collaborate with other researchers in real-time
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Create New Group
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faUsers} className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No research groups found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create a group to start collaborating with your team.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Create Your First Group
                    </button>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {groups.map((group) => (
                        <motion.div
                            key={group._id}
                            variants={item}
                        >
                            <Link href={`/dashboard/research-groups/${group._id}`}>
                                <div className="group h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                        <FontAwesomeIcon icon={faFlask} className="w-24 h-24" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                                                {group.name.charAt(0)}
                                            </div>
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                                                {group.members.length} Members
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {group.name}
                                        </h3>

                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                                            {group.topic}
                                        </p>

                                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                                            {group.description || 'No description provided.'}
                                        </p>

                                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                                            Enter Group <FontAwesomeIcon icon={faArrowRight} className="ml-2 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={fetchGroups}
            />
        </div>
    );
}
