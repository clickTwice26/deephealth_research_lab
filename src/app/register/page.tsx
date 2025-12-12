'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faUser, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');

    // State machine: 'initial' -> 'otp_sent' -> 'submitting'
    const [step, setStep] = useState<'initial' | 'otp_sent'>('initial');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await api.sendOTP(email);
            setStep('otp_sent');
        } catch (err: any) {
            console.error('Failed to send OTP', err);
            setError(err.message || 'Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (step === 'initial') {
            await handleSendOTP();
            return;
        }

        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit verification code sent to your email');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/signup', {
                email,
                password,
                full_name: name,
                otp,
                role: 'user' // Default to user
            });
            // Redirect to login on success
            router.push('/login');
        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        // TODO: Implement Google register logic
        console.log('Google register attempt');
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-20">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDuration: '5s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 transition-colors duration-300">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                            <p className="text-gray-500 dark:text-gray-400">Join our research community today</p>
                        </div>

                        {/* Google Register Button */}
                        <button
                            onClick={handleGoogleRegister}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow group mb-6"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="text-blue-500 text-lg group-hover:scale-110 transition-transform" />
                            <span>Sign up with Google</span>
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-400 dark:text-gray-500">Or register with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Initial Step Fields */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faUser} className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={step === 'otp_sent'}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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
                                        disabled={step === 'otp_sent'}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                                        placeholder="researcher@institute.edu"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            disabled={step === 'otp_sent'}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FontAwesomeIcon icon={faLock} className="text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={step === 'otp_sent'}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* OTP Step */}
                            {step === 'otp_sent' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-1"
                                >
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Verification Code</label>
                                    <p className="text-xs text-gray-500 mb-2">We sent a 6-digit code to {email}</p>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="block w-full px-3 py-3 border border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                                            placeholder="000000"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <>
                                            <span>{step === 'initial' ? 'Send Verification Code' : 'Verify & Create Account'}</span>
                                            <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                        </>
                                    )}
                                </button>
                                {step === 'otp_sent' && (
                                    <button
                                        type="button"
                                        onClick={() => setStep('initial')}
                                        className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
                                    >
                                        Change Email
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                Sign in instead
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </main>
    );
}
