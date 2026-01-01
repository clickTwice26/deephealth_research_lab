'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter, faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowRight, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { api, TeamMember } from '@/lib/api';

export default function TeamPage() {
    const [leadership, setLeadership] = useState<TeamMember[]>([]);
    const [researchers, setResearchers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const data = await api.getTeamMembers();
            // Sort by weight descending
            const sorted = data.sort((a, b) => b.designation_weight - a.designation_weight);

            // Split into groups based on weight or role
            // Arbitrary threshold: weight >= 90 is Leadership
            const leaders = sorted.filter(m => m.designation_weight >= 90);
            const others = sorted.filter(m => m.designation_weight < 90);

            setLeadership(leaders);
            setResearchers(others);
        } catch (error) {
            console.error('Failed to fetch team', error);
        } finally {
            setLoading(false);
        }
    };

    const getAvatar = (name: string, image?: string) => {
        if (image) return image;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=200`;
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Meet the <span className="text-blue-600 dark:text-blue-400">Minds</span> Behind<br />
                            the Science
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We are a diverse group of scientists, engineers, and visionaries united by a common goal: ensuring AI benefits human health.
                        </p>
                    </motion.div>
                </div>
            </section>

            {loading ? (
                <div className="py-40 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Leadership Section */}
                    {leadership.length > 0 && (
                        <section className="py-20 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-6xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl font-bold mb-4">Leadership</h2>
                                    <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {leadership.map((person, index) => (
                                        <motion.div
                                            key={person._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.2 }}
                                            className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left"
                                        >
                                            <div className="relative group shrink-0">
                                                <div className="absolute inset-0 bg-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                                <img
                                                    src={getAvatar(person.name, person.profile_image)}
                                                    alt={person.name}
                                                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 relative z-10 shadow-lg"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{person.name}</h3>
                                                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{person.designation}</p>
                                                {person.bio && (
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3">
                                                        {person.bio}
                                                    </p>
                                                )}
                                                <div className="flex gap-4 justify-center sm:justify-start text-gray-400">
                                                    {person.social_links?.twitter && (
                                                        <a href={person.social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors"><FontAwesomeIcon icon={faTwitter} /></a>
                                                    )}
                                                    {person.social_links?.linkedin && (
                                                        <a href={person.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-blue-700 transition-colors"><FontAwesomeIcon icon={faLinkedin} /></a>
                                                    )}
                                                    {person.social_links?.github && (
                                                        <a href={person.social_links.github} target="_blank" rel="noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FontAwesomeIcon icon={faGithub} /></a>
                                                    )}
                                                    {person.social_links?.google_scholar && (
                                                        <a href={person.social_links.google_scholar} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors"><FontAwesomeIcon icon={faGoogle} /></a>
                                                    )}
                                                    {person.social_links?.website && (
                                                        <a href={person.social_links.website} target="_blank" rel="noreferrer" className="hover:text-gray-500 transition-colors"><FontAwesomeIcon icon={faGlobe} /></a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Researchers Grid */}
                    {researchers.length > 0 && (
                        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
                            <div className="max-w-6xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl font-bold mb-4">Core Research Team</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Driving innovation in labs every day.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {researchers.map((person, index) => (
                                        <motion.div
                                            key={person._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center group"
                                        >
                                            <div className="mb-4 inline-block relative">
                                                <img
                                                    src={getAvatar(person.name, person.profile_image)}
                                                    alt={person.name}
                                                    className="w-24 h-24 rounded-full object-cover mb-4 mx-auto group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{person.name}</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{person.designation}</p>

                                            <div className="flex justify-center gap-3 space-x-2">
                                                {person.social_links?.twitter && (
                                                    <a href={person.social_links.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors text-sm"><FontAwesomeIcon icon={faTwitter} /></a>
                                                )}
                                                {person.social_links?.linkedin && (
                                                    <a href={person.social_links.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors text-sm"><FontAwesomeIcon icon={faLinkedin} /></a>
                                                )}
                                                {person.email && (
                                                    <a href={`mailto:${person.email}`} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                                                        <FontAwesomeIcon icon={faEnvelope} />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}

            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Interested in joining our team?</p>
                    <a
                        href="/careers"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        View Open Positions <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
