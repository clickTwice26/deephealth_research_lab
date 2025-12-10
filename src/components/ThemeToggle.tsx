'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-9 h-9 rounded-lg bg-gray-100/50 animate-pulse border border-gray-200" />
        );
    }

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else setTheme('light');
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Toggle theme"
        >
            <div className="relative w-4 h-4 overflow-hidden">
                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 0 : 1,
                        rotate: theme === 'dark' ? 90 : 0,
                        opacity: theme === 'dark' ? 0 : 1,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center text-amber-500"
                >
                    <FontAwesomeIcon icon={faSun} />
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{
                        scale: theme === 'dark' ? 1 : 0,
                        rotate: theme === 'dark' ? 0 : -90,
                        opacity: theme === 'dark' ? 1 : 0,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute inset-0 flex items-center justify-center text-blue-400"
                >
                    <FontAwesomeIcon icon={faMoon} />
                </motion.div>
            </div>
        </motion.button>
    );
}
