'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faBars, faTimes, faFlask, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        {/* Main Navigation */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo - Left Side */}
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  DeepHealth <span className="text-cyan-400">Research Lab</span>
                </h1>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-auto">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${pathname === item.href ? 'text-gray-900 mb-0.5' : 'text-gray-600'
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

              <Link
                href="/login"
                className="ml-4 pl-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="text-blue-400" />
                  <span>Join Lab</span>
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-4 ml-auto">
              <Link
                href="/login"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-900 text-xs font-semibold rounded-lg border border-gray-200"
                >
                  <FontAwesomeIcon icon={faSignInAlt} className="text-blue-600" />
                  <span>Login</span>
                </motion.button>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-menu"
                animate={{
                  height: isMobileMenuOpen ? 'auto' : 0,
                  opacity: isMobileMenuOpen ? 1 : 0,
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden border-t border-gray-200"
              >
                <div className="px-4 py-4 space-y-2">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-14 sm:h-16" />
    </>
  );
}
