'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUser, faArrowLeft, faShareAlt, faBookmark, faPlay } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Mock Data (Expanded for Detail View)
const posts = [
    {
        id: "1",
        title: "The Future of Personalized Medicine: How AI is Decoding the Human Genome",
        excerpt: "We are entering a new era where machine learning models can predict disease risks with unprecedented accuracy.",
        content: `
            <p class="lead">Getting personal with your DNA is no longer science fiction. It's the new standard of care, powered by artificial intelligence that can read the code of life faster than any human.</p>

            <p>Imagine a world where your doctor doesn't just treat your symptoms, but predicts them before they even appear. This is the promise of personalized medicine, and it's being realized today through the convergence of genomics and deep learning.</p>

            <h2>Decoding the Code of Life</h2>
            <p>The human genome consists of over 3 billion base pairs. Analyzing this vast dataset manually is impossible. However, modern transformer models, similar to those used in natural language processing (like GPT-4), are proving to be exceptionally good at understanding biological sequences.</p>
            
            <blockquote>
                "We are essentially teaching computers to read the language of biology, and they are finding patterns we never knew existed."
                <footer>— Dr. Sarah Chen, Principal Investigator</footer>
            </blockquote>

            <p>Our latest research focuses on identifying non-coding variants—mutations in the "junk DNA" that actually regulate gene expression. By training models on thousands of genomes, we've achieved a 40% improvement in predicting the pathogenicity of these elusive variants.</p>

            <h2>The Role of Transformer Models</h2>
            <p>Just as LLMs predict the next word in a sentence, our genomic models predict the functional impact of a mutation. This allows us to:</p>
            <ul>
                <li><strong>Predict rare disease risk</strong> with higher accuracy.</li>
                <li><strong>Tailor cancer therapies</strong> based on the tumor's specific genetic makeup.</li>
                <li><strong>Discover new drug targets</strong> that were previously "undruggable".</li>
            </ul>

            <div class="callout">
                <h3>Key Takeaway</h3>
                <p>AI isn't replacing biologists; it's giving them a super-powered microscope to see the functional logic hidden within our DNA.</p>
            </div>

            <h2>Ethical Considerations</h2>
            <p>With great power comes great responsibility. As we unlock these predictive capabilities, we must also address privacy concerns and ensure equitable access to these life-saving technologies. Use of genetic data must be strictly regulated to prevent discrimination.</p>

            <p>We are committed to open science and transparent AI development to ensure these tools benefit humanity as a whole.</p>
        `,
        image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        author: "Dr. Sarah Chen",
        authorRole: "Principal Investigator",
        authorImage: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff&size=200",
        date: "Oct 15, 2025",
        readTime: "8 min read",
        tag: "Genomics",
        related: [2, 3, 5]
    },
    // Fallback for other IDs for demo purposes
    {
        id: "default",
        title: "Understanding Transformer Models in Biological Sequence Analysis",
        content: "<p>Content for other posts would go here. This is a placeholder for the demo.</p>",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "James Wilson",
        authorRole: "Head of AI Research",
        authorImage: "https://ui-avatars.com/api/?name=James+Wilson&background=6366F1&color=fff&size=200",
        date: "Oct 10, 2025",
        readTime: "12 min read",
        tag: "AI Research",
        related: [1, 4, 6]
    }
];

export default function BlogPostPage() {
    const params = useParams();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Simple mock fetching logic
    const post = posts.find(p => p.id === params.id) || posts.find(p => p.id === "1") || posts[0];

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
            <Navbar />

            {/* Reading Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12 lg:p-20 z-10">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/blog" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors text-sm font-medium">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Blog
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
                                {post.tag}
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={post.authorImage}
                                        alt={post.author}
                                        className="w-10 h-10 rounded-full border-2 border-white/20"
                                    />
                                    <div>
                                        <p className="text-white font-semibold">{post.author}</p>
                                        <p className="text-xs opacity-80">{post.authorRole}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-l border-gray-700 pl-6 h-10">
                                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarAlt} /> {post.date}</span>
                                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} /> {post.readTime}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Sidebar (Share) */}
                <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-6 sticky top-32 h-fit">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest vertical-text transform -rotate-180 mb-2">Share</p>
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors flex items-center justify-center">
                        <FontAwesomeIcon icon={faTwitter} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-800 transition-colors flex items-center justify-center">
                        <FontAwesomeIcon icon={faLinkedin} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 transition-colors flex items-center justify-center">
                        <FontAwesomeIcon icon={faFacebook} />
                    </button>
                    <div className="w-px h-20 bg-gray-200 dark:bg-gray-800 my-2" />
                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 hover:text-yellow-500 transition-colors flex items-center justify-center" title="Bookmark">
                        <FontAwesomeIcon icon={faBookmark} />
                    </button>
                </div>

                {/* Main Article Content */}
                <article className="lg:col-span-8">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 
                        prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        prose-img:rounded-2xl prose-img:shadow-lg"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Author Bio Card */}
                    <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                        <img
                            src={post.authorImage}
                            alt={post.author}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                        />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">About {post.author}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                                Principal Investigator at DeepHealth Research Lab. Dedicated to decoding the complexities of the human genome using advanced artificial intelligence. Previously researcher at Broad Institute.
                            </p>
                            <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">
                                View Full Profile
                            </button>
                        </div>
                    </div>
                </article>

                {/* Right Sidebar (Table of Contents / Newsletter) */}
                <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-32 h-fit">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Table of Contents</h4>
                        <nav className="space-y-2 text-sm">
                            <a href="#" className="block text-blue-600 dark:text-blue-400 font-medium pl-2 border-l-2 border-blue-600">Introduction</a>
                            <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 pl-2 border-l-2 border-transparent transition-colors">Decoding the Code</a>
                            <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 pl-2 border-l-2 border-transparent transition-colors">Transformer Models</a>
                            <a href="#" className="block text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 pl-2 border-l-2 border-transparent transition-colors">Ethical Considerations</a>
                        </nav>
                    </div>

                    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FontAwesomeIcon icon={faBookmark} className="text-6xl" />
                        </div>
                        <h4 className="font-bold text-lg mb-2 relative z-10">Subscribe to DeepHealth</h4>
                        <p className="text-blue-100 text-xs mb-4 relative z-10 leading-relaxed">
                            Join 5,000+ researchers getting weekly AI & Biotech insights.
                        </p>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full px-3 py-2 rounded-lg bg-blue-700/50 border border-blue-500 text-white placeholder-blue-300 text-xs mb-3 focus:outline-none focus:bg-blue-700"
                        />
                        <button className="w-full py-2 bg-white text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </aside>
            </div>

            <Footer />
        </main>
    );
}
