'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function DemoToast() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast after a short delay when page loads
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // Auto hide after 8 seconds
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 9500);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed top-20 right-4 sm:right-6 z-[100] max-w-sm"
        >
          <div className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-br from-gray-900 via-gray-900/95 to-blue-900/30 backdrop-blur-xl shadow-2xl">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse" />
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-xl opacity-50">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </div>

            <div className="relative p-4 sm:p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-50 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg p-2.5 border border-cyan-400/30">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-white text-lg" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Demo Website Notice</h3>
                    <p className="text-xs text-cyan-400 font-medium">Preview Mode</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-sm" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300 leading-relaxed">
                  This is a <span className="font-semibold text-cyan-400">demonstration version</span> of the website.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The final product will be customized with your actual content, data, and branding requirements.
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">
                  Design inspired by{' '}
                  <a 
                    href="https://elitelab.ai/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    elitelab.ai
                  </a>
                </p>
              </div>

              {/* Footer badge */}
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sample Content Only</span>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-600/20 border border-cyan-500/30 text-xs font-semibold text-cyan-400">
                    DEMO
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 8, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
