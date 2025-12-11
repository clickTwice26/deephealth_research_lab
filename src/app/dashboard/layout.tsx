'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faSignOutAlt,
    faChartLine,
    faFlask,
    faCog,
    faBars,
    faTimes,
    faShieldAlt,
    faBullhorn,
    faBook,
    faBriefcase,
    faUsers,
    faUserFriends
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import GlobalSearch from '@/components/GlobalSearch';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const SidebarLink = ({ icon, label, href }: { icon: any, label: string, href: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => setIsSidebarOpen(false)}
            >
                <FontAwesomeIcon icon={icon} className="w-5 h-5" />
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                            Research Lab
                        </h2>
                        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        <SidebarLink icon={faChartLine} label="Dashboard" href="/dashboard" />
                        <SidebarLink icon={faFlask} label="Experiments" href="/dashboard/experiments" />
                        <SidebarLink icon={faUser} label="Profile" href="/dashboard/profile" />
                        <SidebarLink icon={faCog} label="Settings" href="/dashboard/settings" />

                        {/* Researcher & Admin Community */}
                        {((user.access_weight || 0) >= 50 || user.role === 'admin' || user.role === 'researcher') && (
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Community</p>
                                <SidebarLink icon={faUsers} label="Researcher Feed" href="/dashboard/community" />
                                <SidebarLink icon={faUserFriends} label="Research Groups" href="/dashboard/research-groups" />
                            </div>
                        )}

                        {/* Admin Only Link */}
                        {user.role === 'admin' && (
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin</p>
                                <SidebarLink icon={faChartLine} label="Overview" href="/dashboard/admin" />
                                <SidebarLink icon={faBullhorn} label="News / Content" href="/dashboard/news" />
                                <SidebarLink icon={faBook} label="Publications" href="/dashboard/publications" />
                                <SidebarLink icon={faBriefcase} label="Jobs / Careers" href="/dashboard/jobs" />
                                <SidebarLink icon={faShieldAlt} label="User Management" href="/dashboard/users" />
                            </div>
                        )}
                    </nav>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white">
                        {pathname === '/dashboard' ? 'Dashboard' :
                            pathname === '/dashboard/experiments' ? 'Experiments' :
                                pathname === '/dashboard/profile' ? 'Profile' :
                                    pathname === '/dashboard/settings' ? 'Settings' : 'Research Lab'}
                    </span>
                    <div className="w-8" /> {/* Spacer for balance */}
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>

                {/* Desktop Header for Notifications & Search (New) */}
                <div className="hidden lg:grid grid-cols-3 items-center p-4 px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-30">
                    <div className="text-sm font-semibold text-gray-400">
                        {/* Left Spacer / Breadcrumbs could go here */}
                    </div>
                    <div className="flex justify-center w-full max-w-2xl mx-auto">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center justify-end gap-4">
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-2" />
                        <NotificationsDropdown />
                    </div>
                </div>

                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
