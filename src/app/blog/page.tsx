'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUser, faArrowRight, faSearch, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useState } from 'react';

// Mock Data
const categories = ["All", "AI Research", "Genomics", "Healthcare", "Ethics", "Technology"];

const featuredPost = {
    id: 1,
    title: "The Future of Personalized Medicine: How AI is Decoding the Human Genome",
    excerpt: "We are entering a new era where machine learning models can predict disease risks with unprecedented accuracy by analyzing vast datasets of genetic information. This breakthrough promises to revolutionize how we approach preventative care.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    author: "Dr. Sarah Chen",
    date: "Oct 15, 2025",
    readTime: "8 min read",
    tag: "Genomics"
};

const posts = [
    {
        id: 2,
        title: "Understanding Transformer Models in Biological Sequence Analysis",
        excerpt: "Exploring the architecture behind our latest DNA-BERT model and how it captures long-range dependencies in genetic sequences.",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "James Wilson",
        date: "Oct 10, 2025",
        readTime: "12 min read",
        tag: "AI Research"
    },
    {
        id: 3,
        title: "Ethical Considerations in AI-Driven Diagnostics",
        excerpt: "As we deploy more autonomous systems in clinical settings, we must address bias, transparency, and accountability to ensure fair outcomes for all patients.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Dr. Aisha Patel",
        date: "Oct 5, 2025",
        readTime: "6 min read",
        tag: "Ethics"
    },
    {
        id: 4,
        title: "Accelerating Drug Discovery with Generative Models",
        excerpt: "How generative adversarial networks (GANs) are helping us simulate molecular interactions and identify potential drug candidates faster than ever before.",
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "David Kim",
        date: "Sep 28, 2025",
        readTime: "10 min read",
        tag: "Technology"
    },
    {
        id: 5,
        title: "Case Study: Early Detection of Rare Genetic Disorders",
        excerpt: "A deep dive into a recent collaboration with Mayo Clinic where our algorithms successfully identified markers for a rare condition in pediatric patients.",
        image: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Elena Rodriguez",
        date: "Sep 22, 2025",
        readTime: "7 min read",
        tag: "Healthcare"
    },
    {
        id: 6,
        title: "From Lab to Bedside: Translating Research into Clinical Practice",
        excerpt: "The journey of moving a machine learning model from a research environment to a regulated clinical tool is fraught with challenges. Here is how we navigate it.",
        image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Michael Chang",
        date: "Sep 15, 2025",
        readTime: "9 min read",
        tag: "Technology"
    }
];

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredPosts = activeCategory === "All"
        ? posts
        : posts.filter(post => post.tag === activeCategory);

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            <Navbar />

            {/* Featured Hero Section */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        <div className="order-2 lg:order-1">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                    Featured
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" /> {featuredPost.date}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
                                {featuredPost.title}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                {featuredPost.excerpt}
                            </p>

                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                        SC
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{featuredPost.author}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{featuredPost.readTime}</p>
                                    </div>
                                </div>
                                <Link href={`/blog/${featuredPost.id}`}>
                                    <button className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                        Read Article <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 relative group cursor-pointer overflow-hidden rounded-2xl shadow-2xl">
                            <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
                            <img
                                src={featuredPost.image}
                                alt={featuredPost.title}
                                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-bold rounded-md shadow-sm">
                                            {post.tag}
                                        </span>
                                    </div>
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        <span className="flex items-center gap-1"><FontAwesomeIcon icon={faCalendarAlt} /> {post.date}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                        <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
                                        <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUser} className="text-gray-400" /> {post.author}
                                        </span>
                                        <Link href={`/blog/${post.id}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform cursor-pointer flex items-center">
                                            Read <FontAwesomeIcon icon={faArrowRight} className="text-xs ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Pagination / Load More */}
                    <div className="mt-16 text-center">
                        <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                            Load More Articles
                        </button>
                    </div>

                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform -rotate-6">
                        <FontAwesomeIcon icon={faEnvelope} className="text-3xl" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay at the Forefront of AI & Health</h2>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                        Get the latest research breakthroughs, team insights, and industry news delivered directly to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="flex-1 px-5 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all">
                            Subscribe
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">No spam, ever. Unsubscribe anytime.</p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
