'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faUser, faArrowLeft, faShareAlt, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faLinkedin, faFacebook } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api, BlogPost } from '@/lib/api';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.id as string;
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await api.getBlogPost(slug);
                if (data) {
                    setPost(data);
                    // Generate TOC
                    generateToc(data.content);
                }
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (slug) fetchPost();
    }, [slug]);

    const generateToc = (content: string) => {
        if (!content) return;

        // Simple regex to find h2 and h3
        // Note: This assumes content is HTML. If it's markdown, we'd need a parser.
        // Assuming the RichTextEditor saves HTML.

        const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
        const matches = [...content.matchAll(headingRegex)];

        const tocItems = matches.map((match, index) => {
            const level = parseInt(match[1]);
            const text = match[2].replace(/<[^>]*>/g, ''); // Strip inner tags if any
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return { id, text, level };
        });

        setToc(tocItems);
    };

    // Function to inject IDs into content for TOC linking
    // This is a bit hacky but works for client-side rendered HTML string
    const processContent = (content: string) => {
        if (!content) return '';
        let processed = content;
        toc.forEach(item => {
            // Replace the specific heading with one that has the ID
            // We use a specific regex to match the exact text to avoid replacing wrong things
            const regex = new RegExp(`(<h${item.level}[^>]*>)(${item.text})(<\/h${item.level}>)`, 'i');
            processed = processed.replace(regex, `$1<span id="${item.id}" class="scroll-mt-32">$2</span>$3`);
        });
        return processed;
    };

    // Helpers
    const getReadTime = (content: string) => {
        if (!content) return "1 min read";
        const words = content.trim().split(/\s+/).length;
        const time = Math.ceil(words / 200);
        return `${time} min read`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!post) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link href="/blog" className="text-blue-600 hover:underline">Return to Blog</Link>
        </div>
    );

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
                    {post.cover_image ? (
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-900" />
                    )}
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
                                {post.category || "General"}
                            </span>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white/20">
                                        {post.author_avatar ? (
                                            <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                                        ) : (
                                            post.author_name ? post.author_name.charAt(0).toUpperCase() : "A"
                                        )}
                                    </div>
                                    <Link href={post.author_id ? `/profile/${post.author_id}` : '#'} className="hover:text-white transition-colors">
                                        <p className="font-semibold text-white group-hover:underline">{post.author_name || "Unknown Author"}</p>
                                        <p className="text-xs opacity-80">Author</p>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-4 border-l border-gray-700 pl-6 h-10">
                                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(post.created_at)}</span>
                                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} /> {getReadTime(post.content)}</span>
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
                    <div className="w-px h-20 bg-gray-200 dark:bg-gray-800 my-2" />
                </div>

                {/* Main Article Content */}
                <article className="lg:col-span-8">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 
                        prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        prose-img:rounded-2xl prose-img:shadow-lg
                        [&>ul]:list-disc [&>ul]:pl-6
                        [&>ol]:list-decimal [&>ol]:pl-6"
                        dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
                    />

                    {/* Author Bio Card */}
                    <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-md overflow-hidden">
                            {post.author_avatar ? (
                                <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
                            ) : (
                                post.author_name ? post.author_name.charAt(0).toUpperCase() : "A"
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">About {post.author_name || "Author"}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                                Author at DeepHealth Research Lab.
                            </p>
                            {post.author_id && (
                                <Link href={`/profile/${post.author_id}`}>
                                    <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors">
                                        View Full Profile
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </article>

                {/* Right Sidebar (Table of Contents / Newsletter) */}
                <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-32 h-fit">
                    {toc.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Table of Contents</h4>
                            <nav className="space-y-2 text-sm">
                                {toc.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={`#${item.id}`}
                                        className={`block hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${idx === 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                                            } ${item.level === 3 ? 'pl-4' : ''}`}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    )}

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
