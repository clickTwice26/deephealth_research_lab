'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faBars, faTimes, faFlask, faSignInAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: 'Home', href: '/#home' },
  { name: 'News', href: '/#news' },
  { name: 'Research', href: '/#research' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Publications', href: '/#publications' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname(); // Added usePathname
  const { user } = useAuth();

  const navOpacity = useTransform(scrollY, [0, 100], [0.7, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        style={{
          backdropFilter: useTransform(navBlur, (value) => `blur(${value}px)`),
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'glass-strong shadow-lg' : 'glass'
        )}
      >
        {/* Development Banner */}
        <div className="bg-gray-900/95 text-white/90 text-[10px] sm:text-xs py-2 text-center font-medium tracking-wide">
          <span className="opacity-80">🚧 Development Preview:</span>  Data and metrics shown are simulated for demonstration purposes.
        </div>

        {/* Navbar Container */}
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* =========================================
                DESKTOP LAYOUT (lg:flex)
               ========================================= */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* Logo - Left */}
              <motion.a
                href="/"
                className="flex items-center gap-3 group flex-shrink-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-2.5 border border-blue-400/20">
                    <FontAwesomeIcon icon={faMicrochip} className="text-white text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    DeepHealth <span className="text-cyan-400">Research Lab</span>
                  </h1>
                </div>
              </motion.a>

              {/* Navigation Links - Center/Right */}
              <div className="flex items-center gap-1 ml-auto">
                {navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 ${pathname === item.href ? 'text-gray-900 dark:text-white mb-0.5' : 'text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {item.name}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}

                <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <ThemeToggle />
                  {user ? (
                    <Link href="/dashboard">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-gray-900/20"
                      >
                        <FontAwesomeIcon icon={faChartLine} className="text-blue-400 dark:text-white" />
                        <span>Dashboard</span>
                      </motion.button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors shadow-lg shadow-gray-900/20"
                      >
                        <FontAwesomeIcon icon={faSignInAlt} className="text-blue-400 dark:text-white" />
                        <span>Join Lab</span>
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* =========================================
                MOBILE LAYOUT (lg:hidden)
               ========================================= */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* Left: Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <FontAwesomeIcon icon={faBars} className="text-xl" />
              </button>

              {/* Center: Logo */}
              <motion.a
                href="/"
                className="flex items-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-1.5 border border-blue-400/20">
                  <FontAwesomeIcon icon={faMicrochip} className="text-white text-sm" />
                </div>
                <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                  DeepHealth
                </h1>
              </motion.a>

              {/* Right: Theme Toggle */}
              <div className="-mr-2">
                <ThemeToggle />
              </div>
            </div>

          </div>
        </div>

      </motion.nav>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 z-50 lg:hidden shadow-2xl border-r border-gray-200 dark:border-gray-800 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-900">
                <div className="flex items-center gap-2">
                  <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-1.5">
                    <FontAwesomeIcon icon={faMicrochip} className="text-white text-sm" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-lg" />
                </button>
              </div>

              {/* Sidebar Links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-medium transition-all ${pathname === item.href
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Sidebar Footer (Login Button) */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                      <span>Dashboard</span>
                    </motion.button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <FontAwesomeIcon icon={faSignInAlt} />
                      <span>Join / Login</span>
                    </motion.button>
                  </Link>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-24 sm:h-28" />
    </>
  );
}
