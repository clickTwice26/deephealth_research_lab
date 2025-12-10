'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50" />

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Floating Icons */}
      <motion.div
        className="absolute top-20 left-20 text-blue-500/20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        <div className="w-16 h-16 rounded-full border-4 border-current" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-cyan-500/20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      >
        <div className="w-12 h-12 bg-current rounded-lg transform rotate-45" />
      </motion.div>

      <motion.div
        className="absolute top-40 right-1/3 text-teal-500/20"
        animate={{
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      >
        <FontAwesomeIcon icon={faPaperPlane} className="text-4xl" />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Subscribe to newsletter &
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-5">
            get company news.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-white border border-blue-500/30 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/60 transition-all"
                required
              />
              <motion.button
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Sign Up</span>
                <FontAwesomeIcon icon={faPaperPlane} />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
