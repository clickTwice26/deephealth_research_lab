'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function TeamPage() {
    const leadership = [
        {
            name: "Dr. Sarah Chen",
            role: "Principal Investigator",
            bio: "Leading expert in computational genomics with over 15 years of experience bridging AI and biology.",
            image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff&size=200", // Placeholder
            links: { twitter: "#", linkedin: "#", github: "#" }
        },
        {
            name: "Dr. James Wilson",
            role: "Head of AI Research",
            bio: "Former Google Brain researcher focused on interpretability in deep learning models for healthcare.",
            image: "https://ui-avatars.com/api/?name=James+Wilson&background=6366F1&color=fff&size=200", // Placeholder
            links: { twitter: "#", linkedin: "#", github: "#" }
        }
    ];

    const researchers = [
        {
            name: "Elena Rodriguez",
            role: "Senior Bioinformatician",
            image: "https://ui-avatars.com/api/?name=Elena+Rodriguez&background=10B981&color=fff&size=150"
        },
        {
            name: "David Kim",
            role: "Machine Learning Engineer",
            image: "https://ui-avatars.com/api/?name=David+Kim&background=F59E0B&color=fff&size=150"
        },
        {
            name: "Dr. Aisha Patel",
            role: "Postdoctoral Fellow",
            image: "https://ui-avatars.com/api/?name=Aisha+Patel&background=EC4899&color=fff&size=150"
        },
        {
            name: "Michael Chang",
            role: "Research Scientist",
            image: "https://ui-avatars.com/api/?name=Michael+Chang&background=8B5CF6&color=fff&size=150"
        }
    ];

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

            {/* Leadership Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Leadership</h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {leadership.map((person, index) => (
                            <motion.div
                                key={person.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left"
                            >
                                <div className="relative group shrink-0">
                                    <div className="absolute inset-0 bg-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 relative z-10 shadow-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{person.name}</h3>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{person.role}</p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {person.bio}
                                    </p>
                                    <div className="flex gap-4 justify-center sm:justify-start text-gray-400">
                                        <a href={person.links.twitter} className="hover:text-blue-400 transition-colors"><FontAwesomeIcon icon={faTwitter} /></a>
                                        <a href={person.links.linkedin} className="hover:text-blue-700 transition-colors"><FontAwesomeIcon icon={faLinkedin} /></a>
                                        <a href={person.links.github} className="hover:text-gray-900 dark:hover:text-white transition-colors"><FontAwesomeIcon icon={faGithub} /></a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Researchers Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Core Research Team</h2>
                        <p className="text-gray-600 dark:text-gray-400">Driving innovation in labs every day.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {researchers.map((person, index) => (
                            <motion.div
                                key={person.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all text-center group"
                            >
                                <div className="mb-4 inline-block relative">
                                    <img
                                        src={person.image}
                                        alt={person.name}
                                        className="w-24 h-24 rounded-full object-cover mb-4 mx-auto group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{person.name}</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{person.role}</p>
                                <div className="flex justify-center gap-3">
                                    <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                                        <FontAwesomeIcon icon={faEnvelope} /> Email
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Interested in joining our team?</p>
                        <a
                            href="/careers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            View Open Positions <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
