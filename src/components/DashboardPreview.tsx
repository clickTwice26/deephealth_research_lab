'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faUserMd,
    faDna,
    faMicroscope,
    faSearch,
    faBell,
    faEllipsisH,
    faSpinner,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { MouseEvent, TouchEvent, useState, useEffect } from 'react';

export default function DashboardPreview() {
    const [activeTab, setActiveTab] = useState('analytics');
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const tabs = ['analytics', 'patients', 'genetics', 'lab'];

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveTab((current) => {
                const currentIndex = tabs.indexOf(current);
                const nextIndex = (currentIndex + 1) % tabs.length;
                return tabs[nextIndex];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const handleTabClick = (tab: string) => {
        setIsAutoPlaying(false);
        setActiveTab(tab);
    };

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation for the rotation
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Get coordinates depending on event type
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleLeave = () => {
        x.set(0);
        y.set(0);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-auto md:h-40">
                            <div className="col-span-1 sm:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 relative overflow-hidden transition-colors h-40 md:h-auto">
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

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors h-40 md:h-auto">
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
                    </>
                );
            case 'patients':
                return (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Patients</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Recent Admissions</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Sarah Connor', id: '#P-9021', condition: 'Stable' },
                                { name: 'James Howlett', id: '#P-1974', condition: 'Critical' },
                                { name: 'Wade Wilson', id: '#P-2016', condition: 'Recovering' },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${p.condition === 'Stable' ? 'bg-green-100 text-green-700' : p.condition === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {p.condition}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'genetics':
                return (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Genomic Analysis</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sequencing in progress</p>
                            </div>
                            <div className="animate-spin text-blue-500">
                                <FontAwesomeIcon icon={faSpinner} />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm h-48 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 gap-4">
                                {/* Fake DNA bars */}
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-2 h-32 bg-blue-500 rounded-full transform rotate-12" style={{ height: Math.random() * 100 + 20 + 'px' }} />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 text-center relative z-10">
                                Analyzing Gene Sequence<br />
                                <span className="font-mono text-xs text-blue-500">AGCT-TCGA-AGAG-TGCA</span>
                            </p>
                        </div>
                    </>
                );
            case 'lab':
                return (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lab Results</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Microscopy & Pathology</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                <div className="w-8 h-8 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                                    <FontAwesomeIcon icon={faMicroscope} />
                                </div>
                                <p className="text-xs font-semibold">Sample A-12</p>
                                <p className="text-[10px] text-green-500">Completed <FontAwesomeIcon icon={faCheckCircle} /></p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                                <div className="w-8 h-8 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
                                    <FontAwesomeIcon icon={faDna} />
                                </div>
                                <p className="text-xs font-semibold">Sample B-08</p>
                                <p className="text-[10px] text-blue-500 animate-pulse">Processing...</p>
                            </div>
                            <div className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center text-xs text-gray-400">
                                + Add New Sample
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative w-full max-w-[800px] perspective-1000">
            <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 0, rotateY: 0 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d"
                }}
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                onTouchMove={handleMove}
                onTouchEnd={handleLeave}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300" // Removed cursor-pointer to avoid assuming whole card is clickable
            >
                {/* Top Bar */}
                <div className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50/50 dark:bg-gray-800/50 pointer-events-none">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm pointer-events-auto cursor-text">
                            <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            <span className="text-xs">Search...</span>
                            <span className="text-xs border border-gray-200 dark:border-gray-700 rounded px-1 ml-4 hidden sm:inline">⌘K</span>
                        </div>
                        <FontAwesomeIcon icon={faBell} className="pointer-events-auto cursor-pointer hover:text-gray-600 dark:hover:text-gray-300" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-auto md:h-[400px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-16 h-14 md:h-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-row md:flex-col justify-around md:justify-center items-center py-0 md:py-4 gap-0 md:gap-6 text-gray-400 dark:text-gray-500 bg-gray-50/30 dark:bg-gray-800/30 shrink-0 pointer-events-none">
                        <div
                            onClick={() => handleTabClick('analytics')}
                            className={`p-2 rounded-lg cursor-pointer transition-colors pointer-events-auto ${activeTab === 'analytics' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <div
                            onClick={() => handleTabClick('patients')}
                            className={`p-2 rounded-lg cursor-pointer transition-colors pointer-events-auto ${activeTab === 'patients' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={faUserMd} />
                        </div>
                        <div
                            onClick={() => handleTabClick('genetics')}
                            className={`p-2 rounded-lg cursor-pointer transition-colors pointer-events-auto ${activeTab === 'genetics' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={faDna} />
                        </div>
                        <div
                            onClick={() => handleTabClick('lab')}
                            className={`p-2 rounded-lg cursor-pointer transition-colors pointer-events-auto ${activeTab === 'lab' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <FontAwesomeIcon icon={faMicroscope} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 md:p-6 bg-gray-50/30 dark:bg-gray-900/50 overflow-y-auto md:overflow-visible pointer-events-none">
                        <div className="pointer-events-auto h-full"> {/* Allow interaction inside content */}
                            {renderContent()}
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
