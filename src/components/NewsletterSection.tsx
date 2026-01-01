'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.subscribeNewsletter(email);
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("Newsletter subscription failed", error);
      setStatus('error');
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Background Gradients/Glows to match the soft aesthetic */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950" />

      {/* Decorative LEFT: Ring Shape */}
      <motion.div
        className="absolute left-[5%] top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-[12px] border-blue-100 dark:border-blue-900/30 hidden lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Decorative RIGHT: Rotated Rounded Square */}
      <motion.div
        className="absolute right-[5%] bottom-1/3 w-28 h-28 bg-cyan-50 dark:bg-cyan-900/20 rounded-[2rem] rotate-45 transform hidden lg:block"
        animate={{ rotate: [45, 55, 45] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          Subscribe to newsletter &
        </h2>
        <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-10 leading-tight">
          get company news.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-3.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : (
              <>
                Sign Up
                <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
              </>
            )}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-red-500 text-sm mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
}
