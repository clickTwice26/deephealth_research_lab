'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChartLine, faFlask, faUser, faCog, faSignOutAlt, faLightbulb, faArrowRight, faUsers } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { api, SearchResult } from '@/lib/api';

// Extended type for internal use
interface DisplaySearchResult extends SearchResult {
    action?: () => void;
    icon: any;
}

export default function GlobalSearch() {
    const router = useRouter();
    const { logout } = useAuth();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<DisplaySearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Static items always available
    const staticItems: DisplaySearchResult[] = [
        { id: 'nav-dashboard', label: 'Dashboard', icon: faChartLine, href: '/dashboard', category: 'Navigation', type: 'navigation' },
        { id: 'nav-experiments', label: 'Experiments', icon: faFlask, href: '/dashboard/experiments', category: 'Navigation', type: 'navigation' },
        { id: 'nav-profile', label: 'Profile', icon: faUser, href: '/dashboard/profile', category: 'Navigation', type: 'navigation' },
        { id: 'nav-settings', label: 'Settings', icon: faCog, href: '/dashboard/settings', category: 'Navigation', type: 'navigation' },
        { id: 'act-new-exp', label: 'New Experiment', icon: faFlask, href: '/dashboard/experiments?new=true', category: 'Action', type: 'action' },
        { id: 'act-logout', label: 'Log Out', icon: faSignOutAlt, action: () => logout(), category: 'Action', type: 'action' },
    ];

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 0) {
                setIsLoading(true);
                try {
                    // Filter static items
                    const staticResults = staticItems.filter(item =>
                        item.label.toLowerCase().includes(query.toLowerCase())
                    );

                    // Fetch backend results
                    const serverResults = await api.search(query);

                    // Map server icons
                    const mappedServerResults = serverResults.map(item => ({
                        ...item,
                        icon: item.type === 'user' ? faUsers : faFlask // Default Mapping
                    }));

                    setResults([...staticResults, ...mappedServerResults]);
                } catch (error) {
                    console.error('Search failed', error);
                    // Fallback to static
                    setResults(staticItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())));
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    // Handle selection
    const handleSelect = (item: DisplaySearchResult) => {
        setQuery('');
        setIsOpen(false);
        if (item.action) {
            item.action();
        } else if (item.href) {
            router.push(item.href);
        }
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div className="relative">
                <FontAwesomeIcon
                    icon={faSearch}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-blue-500' : 'text-gray-400'}`}
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search experiments, users, or features..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {!isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
                        <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-500 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">⌘ K</kbd>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (query || results.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                    >
                        {results.length === 0 && !isLoading ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <div className="py-2">
                                {['Navigation', 'Action', 'Analysis', 'Users'].map(category => {
                                    const items = results.filter(i => i.category === category);
                                    if (items.length === 0) return null;

                                    return (
                                        <div key={category}>
                                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 backdrop-blur-sm">
                                                {category}
                                            </div>
                                            {items.map(item => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleSelect(item)}
                                                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        <FontAwesomeIcon icon={item.icon} className="text-sm" />
                                                    </div>
                                                    <span className="flex-1 font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                        {item.label}
                                                    </span>
                                                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-xs" />
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
