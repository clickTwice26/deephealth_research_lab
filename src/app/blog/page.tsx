'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUser, faArrowRight, faSearch, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api, BlogPost } from '@/lib/api';

// Static categories for now
const categories = ["All", "AI Research", "Genomics", "Healthcare", "Ethics", "Technology"];

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const categoryParam = activeCategory === "All" ? undefined : activeCategory;
            const searchParam = searchQuery.trim() === "" ? undefined : searchQuery;

            const data = await api.getBlogPosts(1, 100, categoryParam, undefined, searchParam);

            if (data.length > 0 && !searchParam && activeCategory === "All") {
                // If defaults, pick first as featured
                setFeaturedPost(data[0]);
                setPosts(data.slice(1));
            } else {
                setFeaturedPost(null); // Or keep it? Let's hide featured if searching/filtering
                setPosts(data);
            }

            // If we have data but no featured set yet (e.g. searching), just show all in grid
            if (activeCategory !== "All" || searchParam) {
                setFeaturedPost(null);
                setPosts(data);
            }

        } catch (error) {
            console.error("Failed to fetch blog posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [activeCategory, searchQuery]);

    // Helper to estimate read time
    const getReadTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const time = Math.ceil(words / wordsPerMinute);
        return `${time} min read`;
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            <Navbar />

            {/* Featured Hero Section */}
            {!loading && featuredPost && (
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
                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" /> {formatDate(featuredPost.created_at)}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white">
                                    {featuredPost.title}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed line-clamp-3">
                                    {featuredPost.summary}
                                </p>

                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                            {featuredPost.author_name ? featuredPost.author_name.charAt(0).toUpperCase() : "A"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{featuredPost.author_name || "Unknown Author"}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getReadTime(featuredPost.content)}</p>
                                        </div>
                                    </div>
                                    <Link href={`/blog/${featuredPost.slug}`}>
                                        <button className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                            Read Article <FontAwesomeIcon icon={faArrowRight} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 relative group cursor-pointer overflow-hidden rounded-2xl shadow-2xl">
                                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                {featuredPost.cover_image ? (
                                    <img
                                        src={featuredPost.cover_image}
                                        alt={featuredPost.title}
                                        className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-[400px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Content Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        </div>
                    </div>

                    {/* Articles Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 && !featuredPost ? (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No articles found</h3>
                            <p className="text-gray-500">Try adjusting your search or category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post, index) => (
                                <motion.article
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow duration-300 group flex flex-col h-full"
                                >
                                    <div className="h-48 overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-xs font-bold rounded-md shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                        {post.cover_image && (
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex items-center gap-1"><FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(post.created_at)}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            <span className="flex items-center gap-1"><FontAwesomeIcon icon={faClock} /> {getReadTime(post.content)}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {post.summary}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
                                            <span className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUser} className="text-gray-400" /> {post.author_name || "Unknown"}
                                            </span>
                                            <Link href={`/blog/${post.slug}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform cursor-pointer flex items-center">
                                                Read <FontAwesomeIcon icon={faArrowRight} className="text-xs ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}

                    {/* Pagination / Load More */}
                    {!loading && posts.length > 0 && (
                        <div className="mt-16 text-center">
                            <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                Load More Articles
                            </button>
                        </div>
                    )}

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
