'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement actual login logic
        console.log('Login attempt:', { email, password });
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login logic
        console.log('Google login attempt');
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-20">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[60px] md:blur-[100px] opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-cyan-50 dark:bg-cyan-900/10 rounded-full blur-[50px] md:blur-[80px] opacity-60" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 transition-colors duration-300">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                            <p className="text-gray-500 dark:text-gray-400">Sign in to access your research dashboard</p>
                        </div>

                        {/* Google Login Button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow group mb-6"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                            <span>Continue with Google</span>
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faLock} className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-600 dark:text-gray-400">
                                        Remember me
                                    </label>
                                </div>
                                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span>Sign In</span>
                                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                Apply for access
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
