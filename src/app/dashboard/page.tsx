'use client';

import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const { user } = useAuth();

    // Note: Loading and auth check are handled in layout.tsx now, but we can keep a safe check or just rely on user being present
    if (!user) return null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.full_name?.split(' ')[0] || 'Researcher'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Here's an overview of your ongoing research projects.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Active Projects', value: '12', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Total Experiments', value: '148', color: 'from-purple-500 to-pink-500' },
                    { label: 'Hours Logged', value: '324', color: 'from-amber-500 to-orange-500' },
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

            {/* Placeholder Content Area */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 min-h-[400px] flex items-center justify-center text-center">
                <div className="max-w-md">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faFlask} className="text-3xl text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active experiments</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Start a new experiment to see real-time analytics and data visualization.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                        Start New Experiment
                    </button>
                </div>
            </div>
        </div>
    );
}
