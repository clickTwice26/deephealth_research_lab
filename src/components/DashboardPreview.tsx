'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faUserMd,
    faDna,
    faMicroscope,
    faSearch,
    faBell,
    faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

export default function DashboardPreview() {
    return (
        <div className="relative w-full max-w-[800px] perspective-1000">
            <motion.div
                initial={{ rotateX: 10, rotateY: -10, opacity: 0, y: 50 }}
                animate={{ rotateX: 0, rotateY: 0, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300"
            >
                {/* Top Bar */}
                <div className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                            <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            <span className="text-xs">Search patient data...</span>
                            <span className="text-xs border border-gray-200 dark:border-gray-700 rounded px-1 ml-4">⌘K</span>
                        </div>
                        <FontAwesomeIcon icon={faBell} />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500" />
                    </div>
                </div>

                <div className="flex h-[400px]">
                    {/* Sidebar */}
                    <div className="w-16 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center py-4 gap-6 text-gray-400 dark:text-gray-500 bg-gray-50/30 dark:bg-gray-800/30">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <FontAwesomeIcon icon={faUserMd} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
                        <FontAwesomeIcon icon={faDna} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
                        <FontAwesomeIcon icon={faMicroscope} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 bg-gray-50/30 dark:bg-gray-900/50">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Patient Analytics</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Real-time inference • Model: DH-Transformer-v4</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: 'Risk Score', value: '98.2%', color: 'blue' },
                                { label: 'Confidence', value: 'High', color: 'cyan' },
                                { label: 'Anomalies', value: '2', color: 'amber' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className={`text-xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 h-40">
                            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 relative overflow-hidden transition-colors">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vital Trends</p>
                                    <FontAwesomeIcon icon={faEllipsisH} className="text-gray-400 text-xs" />
                                </div>
                                {/* Simulated Chart */}
                                <div className="flex items-end h-24 gap-2">
                                    {[40, 65, 45, 80, 55, 90, 75, 85].map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-500/80 rounded-t-sm"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Model Status</p>
                                <div className="space-y-3">
                                    <div className="text-xs">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
                                            <span>Processing</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="text-xs">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
                                            <span>Latency</span>
                                            <span className="text-green-600 dark:text-green-400">12ms</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[30%] bg-green-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-[60px]" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-[60px]" />
        </div>
    );
}
