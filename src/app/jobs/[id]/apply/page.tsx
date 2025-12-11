'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api'; // Assuming Job interface is exported from here
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faLayerGroup, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function JobApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        portfolio: '',
        coverLetter: '',
        resume: null as File | null
    });

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                // We might need a getJobById endpoint. 
                // If it doesn't exist, we can try fetching all and finding, or assume getJob exists.
                // Checking api.ts previously, I saw getJobs but not getJob. 
                // Let's assume for now we might need to fetch list and find, or just display generic if API is missing.
                // However, for better UX, I'll try to fetch all active jobs and filter.
                const response = await api.getJobs(1, 100, '', true);
                const foundJob = response.items.find(j => j._id === jobId);
                setJob(foundJob || null);
            } catch (error) {
                console.error('Failed to fetch job', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!job) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
                    <FontAwesomeIcon icon={faBriefcase} className="text-4xl text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Job Not Found</h1>
                    <p className="text-gray-500 mb-6">The position you are looking for might have been removed or closed.</p>
                    <button
                        onClick={() => router.push('/#careers')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Open Roles
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <button
                    onClick={() => router.push('/#careers')}
                    className="mb-8 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 flex items-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Open Roles
                </button>

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 border border-gray-200 dark:border-gray-800 text-center"
                    >
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faPaperPlane} className="text-2xl" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Sent!</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                            Thank you for applying to the <strong>{job.title}</strong> role. We have received your application and will review it shortly.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-colors"
                        >
                            Return Home
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-800">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-full">
                                    {job.type}
                                </span>
                                <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-full">
                                    {job.department}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location}
                                </span>
                                {job.deadline && (
                                    <span className="text-red-500 font-medium">
                                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Application</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Portfolio / LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={formData.portfolio}
                                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Resume / CV *</label>
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-black/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        required
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="pointer-events-none">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formData.resume ? formData.resume.name : "Click or drag to upload"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter</label>
                                <textarea
                                    rows={5}
                                    value={formData.coverLetter}
                                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                                    placeholder="Why do you want to join us?"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 transition-all transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
