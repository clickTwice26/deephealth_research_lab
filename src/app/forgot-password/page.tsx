'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowRight, faArrowLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual reset logic
        console.log('Reset password attempt:', email);
        setIsSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-20">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '5s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 transition-colors duration-300">

                        {!isSubmitted ? (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
                                    <p className="text-gray-500 dark:text-gray-400">Enter your email to receive recovery instructions</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                placeholder="researcher@institute.edu"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <span>Send Reset Link</span>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">
                                    We've sent password reset instructions to <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                >
                                    Try a different email
                                </button>
                            </motion.div>
                        )}

                        <div className="mt-8 text-center">
                            <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2 text-xs" />
                                Back to Log In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
