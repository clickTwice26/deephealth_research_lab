'use client';

import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
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
    faCheckCircle,
    faHeartbeat
} from '@fortawesome/free-solid-svg-icons';
import { MouseEvent, TouchEvent, useState, useEffect } from 'react';

export default function DashboardPreview() {
    const [activeTab, setActiveTab] = useState('analytics');
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Dynamic Data States
    const [chartData, setChartData] = useState([40, 65, 45, 80, 55, 90, 75, 85]);
    const [cpuUsage, setCpuUsage] = useState(85);
    const [latency, setLatency] = useState(12);
    const [dnaSequence, setDnaSequence] = useState('AGCT-TCGA-AGAG-TGCA');

    const tabs = ['analytics', 'patients', 'genetics', 'lab'];

    // Auto-play Tab Switching
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setActiveTab((current) => {
                const currentIndex = tabs.indexOf(current);
                const nextIndex = (currentIndex + 1) % tabs.length;
                return tabs[nextIndex];
            });
        }, 4000); // Slower switch time to let user see animations

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    // Dynamic Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Update Chart
            setChartData(prev => {
                const newData = [...prev.slice(1), Math.floor(Math.random() * 50) + 40];
                return newData;
            });

            // Update Stats
            setCpuUsage(prev => Math.min(99, Math.max(70, prev + (Math.random() * 10 - 5))));
            setLatency(prev => Math.min(30, Math.max(5, prev + (Math.random() * 4 - 2))));

            // Rotate DNA
            setDnaSequence(prev => {
                const char = prev.charAt(0);
                return prev.slice(1) + char;
            });

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleTabClick = (tab: string) => {
        setIsAutoPlaying(false);
        setActiveTab(tab);
    };

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation for the rotation
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]); // Reduced rotation for robustness
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMove = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

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
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 sm:gap-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Patient Analytics</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Real-time inference • Model: DH-Transformer-v4</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1.5 shadow-sm border border-green-200 dark:border-green-800">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Live Inference
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { label: 'Risk Score', value: `${(cpuUsage + 10).toFixed(1)}%`, color: 'blue', icon: faHeartbeat },
                                { label: 'Confidence', value: 'High', color: 'cyan', icon: faCheckCircle },
                                { label: 'Anomalies', value: Math.floor(latency / 5).toString(), color: 'amber', icon: faBell },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors relative overflow-hidden group"
                                    whileHover={{ y: -2 }}
                                >
                                    <div className={`absolute top-0 right-0 p-2 opacity-10 text-${stat.color}-500`}>
                                        <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className={`text-lg font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="col-span-1 sm:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 relative overflow-hidden transition-colors h-48 sm:h-auto flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
                                        Vital Trends
                                    </p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />)}
                                    </div>
                                </div>
                                {/* Dynamic Chart */}
                                <div className="flex items-end h-full gap-1.5 pt-2">
                                    {chartData.map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 bg-gradient-to-t from-blue-500/10 via-blue-500/50 to-blue-500 rounded-t-sm relative group"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {h}%
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 transition-colors flex flex-col justify-center gap-4">
                                <div>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                        <span>GPU Load</span>
                                        <span className="font-mono text-blue-500">{cpuUsage.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500 rounded-full"
                                            animate={{ width: `${cpuUsage}%` }}
                                            transition={{ ease: "linear" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                        <span>Latency</span>
                                        <span className="font-mono text-green-500">{latency.toFixed(0)}ms</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500 rounded-full"
                                            animate={{ width: `${Math.min(100, latency * 3)}%` }}
                                            transition={{ ease: "linear" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                                        <span>Memory</span>
                                        <span className="font-mono text-purple-500">14GB</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full w-[60%] bg-purple-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'patients':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Patients</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Recent Admissions</p>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">
                                Today
                            </div>
                        </div>
                        <div className="space-y-3 flex-1 overflow-visible">
                            {[
                                { name: 'Sarah Connor', id: '#P-9021', condition: 'Stable', time: '2m ago' },
                                { name: 'James Howlett', id: '#P-1974', condition: 'Critical', time: '14m ago' },
                                { name: 'Wade Wilson', id: '#P-2016', condition: 'Recovering', time: '1h ago' },
                                { name: 'Tony Stark', id: '#P-3000', condition: 'Stable', time: '2h ago' },
                            ].map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shadow-inner">
                                            {p.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">{p.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                                                <span className="text-[10px] text-gray-300">•</span>
                                                <p className="text-[10px] text-gray-400">{p.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${p.condition === 'Stable' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : p.condition === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                                        {p.condition}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'genetics':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Genomic Analysis</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Sequencing in progress</p>
                            </div>
                            <div className="animate-spin text-blue-500 opacity-50">
                                <FontAwesomeIcon icon={faDna} />
                            </div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
                            {/* DNA Background Animation */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-20">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 bg-blue-500 rounded-full"
                                        animate={{
                                            height: [40, 100, 40],
                                            opacity: [0.5, 1, 0.5],
                                            backgroundColor: ["#3b82f6", "#06b6d4", "#3b82f6"]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="mb-4 inline-block relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-gray-700 border-t-blue-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-500">
                                        94%
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Target Sequence Identified</h4>
                                <p className="text-xs text-gray-500 mb-4 max-w-[200px] mx-auto">Matching variants against global phenotype database.</p>

                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 font-mono text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                                    <motion.div
                                        animate={{ x: [-20, 0] }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="whitespace-nowrap flex gap-4"
                                    >
                                        <span>{dnaSequence}</span>
                                        <span>{dnaSequence}</span>
                                    </motion.div>
                                    {/* Vignette for Fade Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50 dark:from-gray-900 dark:via-transparent dark:to-gray-900" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'lab':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lab Results</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Microscopy & Pathology</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center cursor-pointer group">
                                <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faMicroscope} />
                                </div>
                                <p className="text-xs font-semibold dark:text-gray-200">Sample A-12</p>
                                <p className="text-[10px] text-green-500 mt-1 flex items-center justify-center gap-1">Completed <FontAwesomeIcon icon={faCheckCircle} /></p>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center cursor-pointer group">
                                <div className="w-10 h-10 mx-auto bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faDna} />
                                </div>
                                <p className="text-xs font-semibold dark:text-gray-200">Sample B-08</p>
                                <p className="text-[10px] text-blue-500 mt-1 flex items-center justify-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                    Processing
                                </p>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.01 }} className="col-span-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center text-xs text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 h-[88px]">
                                <div className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    +
                                </div>
                                Upload New Sample
                            </motion.div>
                        </div>
                    </motion.div>
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
                className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transition-colors duration-300"
            >
                {/* Top Bar */}
                <div className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 bg-gray-50/50 dark:bg-gray-800/50 pointer-events-none sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                            <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-950 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm pointer-events-auto cursor-text transition-colors hover:border-gray-300 dark:hover:border-gray-600">
                            <FontAwesomeIcon icon={faSearch} className="text-xs" />
                            <span className="text-xs hidden sm:inline">Search patients, samples...</span>
                            <span className="text-xs sm:hidden">Search...</span>
                            <span className="text-[10px] border border-gray-200 dark:border-gray-700 rounded px-1 ml-2 hidden sm:inline bg-gray-50 dark:bg-gray-900">⌘K</span>
                        </div>
                        <div className="relative pointer-events-auto cursor-pointer">
                            <FontAwesomeIcon icon={faBell} className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-900" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-inner border border-white dark:border-gray-800" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-[520px] md:h-[420px]">
                    {/* Sidebar */}
                    <div className="w-full md:w-16 h-14 md:h-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-row md:flex-col justify-around md:justify-center items-center py-0 md:py-4 gap-0 md:gap-6 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 shrink-0 backdrop-blur-sm z-10">
                        {tabs.map((tab) => {
                            let icon;
                            switch (tab) {
                                case 'analytics': icon = faChartLine; break;
                                case 'patients': icon = faUserMd; break;
                                case 'genetics': icon = faDna; break;
                                case 'lab': icon = faMicroscope; break;
                            }
                            return (
                                <div
                                    key={tab}
                                    onClick={() => handleTabClick(tab)}
                                    className={`p-2.5 rounded-xl cursor-pointer transition-all duration-300 pointer-events-auto relative group ${activeTab === tab ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md transform scale-105' : 'hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}
                                >
                                    <FontAwesomeIcon icon={icon!} className="text-lg" />
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute left-0 top-1/2 -translate-y-[55%] w-1 h-6 bg-blue-500 rounded-r-full hidden md:block" // Desktop indicator: Adjusted height and position
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabIndicatorMobile"
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 bg-blue-500 rounded-t-full md:hidden" // Mobile indicator
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-5 bg-gray-50/30 dark:bg-gray-900/50 overflow-y-auto md:overflow-visible relative">
                        {/* Background Grid Pattern within Content */}
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                        <div className="pointer-events-auto h-full relative z-10">
                            <AnimatePresence mode="wait">
                                {renderContent()}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Decorative Elements */}
            <div className="absolute -z-10 top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute -z-10 -bottom-10 -left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
    );
}
