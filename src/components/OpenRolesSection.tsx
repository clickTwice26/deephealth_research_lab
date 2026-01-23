'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faMapMarkerAlt, faLayerGroup, faArrowRight, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { api, Job } from '@/lib/api';

export default function OpenRolesSection() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch only active jobs
                const response = await api.getJobs(1, 100, '', true);
                setJobs(response.items);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (!isLoading && jobs.length === 0) return null; // Don't show section if no jobs

    return (
        <section id="careers" className="relative py-20 bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 2xl:px-24">

                {/* Header */}
                <div className="mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Open Roles
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                        Tell us where you will have the most fun and impact - roles flex based on the person.
                    </p>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 2xl:gap-8">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                        >
                            {/* Top Badges */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-full">
                                    {job.type}
                                </span>
                                <span className="px-3 py-1 text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white rounded-full">
                                    {job.level}
                                </span>
                            </div>

                            {/* Title & Meta */}
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {job.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium text-sm flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faBriefcase} className="text-gray-400" />
                                    {job.description}
                                </span>
                            </p>

                            <div className="text-sm text-gray-500 dark:text-gray-500 mb-8 flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faLayerGroup} />
                                    {job.department}
                                </span>
                            </div>

                            {/* Lists */}
                            <div className="space-y-6 flex-grow">
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">You will</h4>
                                        <ul className="space-y-2">
                                            {job.responsibilities.slice(0, 4).map((item, i) => (
                                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {job.requirements && job.requirements.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">You bring</h4>
                                        <ul className="space-y-2">
                                            {job.requirements.slice(0, 4).map((item, i) => (
                                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Tags */}
                            <div className="flex flex-wrap gap-2 mt-8 mb-8">
                                {job.skills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                                <a
                                    href={`/jobs/${job._id}/apply`}
                                    className="px-5 py-2.5 bg-white dark:bg-white text-gray-900 dark:text-black font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors text-sm"
                                >
                                    Apply Now
                                </a>

                                <a
                                    href="mailto:lab@deephealthlab.com"
                                    className="px-5 py-2.5 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Ask a question
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
