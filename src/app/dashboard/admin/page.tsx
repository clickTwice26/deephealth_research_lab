'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faFlask,
    faServer,
    faChartLine,
    faExclamationTriangle,
    faCheckCircle,
    faArrowUp,
    faArrowDown,
    faClock
} from '@fortawesome/free-solid-svg-icons';

// Mock Data Types
interface SystemStat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: any;
    color: string;
}

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    time: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Mock Data
    const stats: SystemStat[] = [
        { label: 'Total Users', value: '1,248', change: '+12%', trend: 'up', icon: faUsers, color: 'blue' },
        { label: 'Active Experiments', value: '86', change: '+5%', trend: 'up', icon: faFlask, color: 'cyan' },
        { label: 'System Uptime', value: '99.9%', change: '0%', trend: 'neutral', icon: faServer, color: 'green' },
        { label: 'API Requests', value: '45.2k', change: '+24%', trend: 'up', icon: faChartLine, color: 'purple' },
    ];

    const activities: ActivityLog[] = [
        { id: '1', user: 'Dr. Sarah Connor', action: 'Published new findings on "Xolver"', time: '2 mins ago', type: 'success' },
        { id: '2', user: 'System', action: 'Daily backup completed successfully', time: '1 hour ago', type: 'info' },
        { id: '3', user: 'James Howlett', action: 'Failed login attempt (3x)', time: '2 hours ago', type: 'warning' },
        { id: '4', user: 'Wade Wilson', action: 'Registered new account', time: '3 hours ago', type: 'info' },
        { id: '5', user: 'API Gateway', action: 'High latency detected in region us-east', time: '5 hours ago', type: 'error' },
    ];

    useEffect(() => {
        setMounted(true);
        if (!isLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (!mounted || isLoading || !user || user.role !== 'admin') {
        return null; // Or a loader/access denied component
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">System overview and management insights</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        System Operational
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <FontAwesomeIcon icon={stat.icon} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                stat.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {stat.trend === 'up' && <FontAwesomeIcon icon={faArrowUp} className="mr-1" />}
                                {stat.trend === 'down' && <FontAwesomeIcon icon={faArrowDown} className="mr-1" />}
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mocked User Growth) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Growth & Engagement</h2>
                        <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-1">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    {/* CSS Chart Mockup */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 70, 88].map((h, i) => (
                            <div key={i} className="group relative flex-1 flex flex-col justify-end items-center gap-2 h-full">
                                <div
                                    className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-sm relative overflow-hidden transition-all duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30"
                                    style={{ height: `${h}%` }}
                                >
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: '100%' }}
                                        transition={{ duration: 1, delay: i * 0.05 }}
                                        className="w-full absolute bottom-0 bg-blue-500 opacity-60 rounded-t-sm"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:block">
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                </span>
                                {/* Tooltip */}
                                <div className="absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {h * 10} Users
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status / Recent Activity */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {activities.map((activity, i) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                                    ${activity.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                        activity.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                            activity.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                    <FontAwesomeIcon icon={
                                        activity.type === 'success' ? faCheckCircle :
                                            activity.type === 'warning' ? faExclamationTriangle :
                                                activity.type === 'error' ? faExclamationTriangle :
                                                    faClock
                                    } className="text-xs" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {activity.user}
                                        <span className="font-normal text-gray-500 dark:text-gray-400"> {activity.action.replace(activity.user, '')}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        View All Logs
                    </button>
                </div>
            </div>
        </div>
    );
}
