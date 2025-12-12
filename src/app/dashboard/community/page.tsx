'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, CommunityPost, Comment } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faPaperPlane, faUserCircle, faGlobeAmericas, faFire, faClock, faUser, faInfoCircle, faHashtag, faBolt } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveUsersWidget from '@/components/ActiveUsersWidget';

// Recursive Comment Tree Builder
interface CommentNode extends Comment {
    children: CommentNode[];
}

const buildCommentTree = (comments: Comment[]): CommentNode[] => {
    const commentMap = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    // Initialize map (Deduplicates by ID automatically)
    comments.forEach(c => {
        // If duplicate IDs exist, last one wins, which is fine.
        // We clone to ensure we don't mutate original state if reused elsewhere (though typically fresh from API)
        commentMap.set(c.id, { ...c, children: [] });
    });

    // Build tree using the UNIQUE values from the map
    Array.from(commentMap.values()).forEach(node => {
        if (node.parent_id && commentMap.has(node.parent_id)) {
            commentMap.get(node.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    });

    // Sort: Newest roots first, Oldest replies first
    roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Sort children recursively
    const sortChildren = (nodes: CommentNode[]) => {
        nodes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);

    return roots;
};

export default function CommunityPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    // State
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // Filters
    const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
    const [filterBy, setFilterBy] = useState<'all' | 'mine'>('all');

    // Comments & Interaction
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [activeCommentSection, setActiveCommentSection] = useState<string | null>(null);

    // Modal State
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Fetch details when modal opens
    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedPostId) {
                setSelectedPost(null);
                return;
            }

            // Find placeholder from posts list
            const placeholder = posts.find(p => p._id === selectedPostId);
            if (placeholder) setSelectedPost(placeholder);

            setIsLoadingDetails(true);
            try {
                const fullPost = await api.getCommunityPost(selectedPostId);
                setSelectedPost(fullPost);
            } catch (error) {
                console.error("Failed to fetch post details", error);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedPostId]); // don't depend on posts to avoid loops, just ID change

    // ... (rest of code)

    // Infinite Scroll Observer
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    // Access Control
    const RESEARCHER_WEIGHT = 50;
    const canAccess = currentUser && (
        (currentUser.access_weight || 0) >= RESEARCHER_WEIGHT ||
        currentUser.role === 'admin' ||
        currentUser.role === 'researcher'
    );

    useEffect(() => {
        if (currentUser && !canAccess) {
            router.push('/dashboard');
        }
    }, [currentUser, canAccess, router]);

    const fetchPosts = async (currentPage: number, isReset = false) => {
        setIsLoading(true);
        try {
            const data = await api.getCommunityPosts(currentPage, 10, sortBy, filterBy);

            if (isReset) {
                setPosts(data.items);
            } else {
                // Prevent duplicates
                setPosts(prev => {
                    const newItems = data.items.filter(item => !prev.some(p => p._id === item._id));
                    return [...prev, ...newItems];
                });
            }

            if (currentPage >= data.pages) setHasMore(false);
            else setHasMore(true);

        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset and fetch when filters change
    useEffect(() => {
        if (canAccess) {
            setPage(1);
            setPosts([]);
            setHasMore(true);
            fetchPosts(1, true);
        }
    }, [sortBy, filterBy, canAccess]);

    // Fetch next page
    useEffect(() => {
        if (canAccess && page > 1) {
            fetchPosts(page);
        }
    }, [page]);


    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            const newPost = await api.createCommunityPost(newPostContent);
            setPosts([newPost, ...posts]);
            setNewPostContent('');
        } catch (error) {
            console.error('Failed to create post', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleLike = async (postId: string) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                const isLiked = p.likes.includes(currentUser!.id);
                const newLikes = isLiked
                    ? p.likes.filter(id => id !== currentUser!.id)
                    : [...p.likes, currentUser!.id];

                // Also remove from dislikes if present
                const newDislikes = p.dislikes.filter(id => id !== currentUser!.id);

                return { ...p, likes: newLikes, dislikes: newDislikes };
            }
            return p;
        }));

        try {
            const updatedPost = await api.likePost(postId);
            // Sync with server response to be sure
            setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
        } catch (error) {
            console.error('Failed to like post', error);
            // Revert changes could go here
            fetchPosts(page, true);
        }
    };

    const handleDislike = async (postId: string) => {
        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p._id === postId) {
                const isDisliked = p.dislikes.includes(currentUser!.id);
                const newDislikes = isDisliked
                    ? p.dislikes.filter(id => id !== currentUser!.id)
                    : [...p.dislikes, currentUser!.id];

                // Also remove from likes if present
                const newLikes = p.likes.filter(id => id !== currentUser!.id);

                return { ...p, likes: newLikes, dislikes: newDislikes };
            }
            return p;
        }));

        try {
            const updatedPost = await api.dislikePost(postId);
            setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));
        } catch (error) {
            console.error('Failed to dislike post', error);
            fetchPosts(page, true);
        }
    };

    const handleComment = async (postId: string, e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        // If parentId is provided, we use a specific key in commentInputs or generic 'reply'
        // For simplicity, let's assume the main input is used for new comments, AND for replies we might need a separate state or input.
        // BUT, complex UI usually demands inline reply inputs.
        // Let's reuse commentInputs with a specific key for replies: `${postId}_${parentId}`

        const inputKey = parentId ? `${postId}_${parentId}` : postId;
        const content = commentInputs[inputKey];
        if (!content?.trim()) return;

        try {
            const updatedPost = await api.commentPost(postId, content, parentId);
            setPosts(prev => prev.map(p => p._id === postId ? updatedPost : p));

            // Also update selectedPost if it's the one we're editing
            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(updatedPost);
            }

            setCommentInputs(prev => ({ ...prev, [inputKey]: '' }));
            if (parentId) setReplyingTo(null); // Close reply box
        } catch (error) {
            console.error('Failed to comment', error);
        }
    };

    // Recursive Comment Component
    const CommentNodeItem = ({ node, postId, depth = 0 }: { node: CommentNode, postId: string, depth?: number }) => {
        const isReplying = replyingTo === node.id;
        const replyInputKey = `${postId}_${node.id}`;

        return (
            <div className={`flex gap-3 ${depth > 0 ? 'mt-3' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                    {node.author_name.charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 inline-block max-w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {node.author_name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {timeAgo(node.created_at)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                            {node.content}
                        </p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 font-semibold">
                        <button
                            onClick={() => setReplyingTo(isReplying ? null : node.id)}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Reply
                        </button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-2 flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                                {currentUser?.full_name?.charAt(0)}
                            </div>
                            <form onSubmit={(e) => handleComment(postId, e, node.id)} className="flex-grow relative">
                                <input
                                    autoFocus
                                    type="text"
                                    value={commentInputs[replyInputKey] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [replyInputKey]: e.target.value }))}
                                    placeholder={`Reply to ${node.author_name}...`}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-3 pr-10 text-xs focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xs mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!commentInputs[replyInputKey]?.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-30 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} size="sm" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {node.children.length > 0 && (
                        <div className="mt-0 border-l-2 border-gray-200 dark:border-gray-800 pl-3">
                            {node.children.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(child => (
                                <CommentNodeItem key={child.id} node={child} postId={postId} depth={depth + 1} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const toggleComments = (postId: string) => {
        setSelectedPostId(postId);
    };

    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "m";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return "now";
    };

    if (!canAccess) return null;

    return (
        <div className="w-full pb-20 px-4 lg:px-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Feed (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Header Area */}
                    <div className="pb-4 pt-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Feed</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Collaborate with fellow researchers</p>
                    </div>

                    {/* Create Post Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 transition-shadow hover:shadow-md">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
                                {currentUser?.full_name?.charAt(0) || 'U'}
                            </div>
                            <form onSubmit={handleCreatePost} className="flex-grow">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Share your latest findings or ask a question..."
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500/30 min-h-[80px] resize-none transition-all placeholder:text-gray-400"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={isPosting || !newPostContent.trim()}
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} />
                                        <span>Post</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => { setSortBy('latest'); setFilterBy('all'); }}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'latest' && filterBy === 'all'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <FontAwesomeIcon icon={faClock} />
                            Latest
                        </button>
                        <button
                            onClick={() => { setSortBy('popular'); setFilterBy('all'); }}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'popular' && filterBy === 'all'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <FontAwesomeIcon icon={faFire} />
                            Popular
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                        <button
                            onClick={() => setFilterBy('mine')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filterBy === 'mine'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <FontAwesomeIcon icon={faUser} />
                            My Posts
                        </button>
                    </div>

                    {/* Feed List */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {posts.map((post, index) => {
                                // Attach ref to last element for infinite scroll
                                const isLast = index === posts.length - 1;
                                const isLiked = post.likes.includes(currentUser!.id);
                                const isDisliked = post.dislikes.includes(currentUser!.id);

                                return (
                                    <motion.div
                                        key={post._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                                    >
                                        {/* Intersection Observer Target */}
                                        {isLast && <span ref={lastPostElementRef} className="sr-only" />}
                                        {/* Post Header */}
                                        <div className="p-5 flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 font-bold overflow-hidden flex-shrink-0">
                                                <span className="text-sm">{post.author_name?.charAt(0)}</span>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                            {post.author_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>@{post.author_email?.split('@')[0]}</span>
                                                            <span>•</span>
                                                            <span>{timeAgo(post.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px]">
                                                    {post.content}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats Bar */}
                                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between text-xs font-medium text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <div className="flex -space-x-1">
                                                        {post.likes.length > 0 && (
                                                            <div className="bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                                                <FontAwesomeIcon icon={faThumbsUp} className="text-[8px] text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {(post.likes.length > 0 || post.dislikes.length > 0) ? (
                                                        <span className="hover:underline cursor-pointer" onClick={() => setSelectedPostId(post._id)}>
                                                            {post.likes.length} likes
                                                        </span>
                                                    ) : (
                                                        <span>Be the first to like</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedPostId(post._id)}
                                                className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                {post.comments_count} comments
                                            </button>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800/50">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isLiked
                                                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={faThumbsUp} />
                                                <span>Like</span>
                                            </button>
                                            <button
                                                onClick={() => handleDislike(post._id)}
                                                className={`py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isDisliked
                                                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                                                    : 'text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'
                                                    }`}
                                            >
                                                <FontAwesomeIcon icon={faThumbsDown} />
                                                <span>Dislike</span>
                                            </button>
                                            <button
                                                onClick={() => setSelectedPostId(post._id)}
                                                className={`py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900`}
                                            >
                                                <FontAwesomeIcon icon={faComment} />
                                                <span>Comment</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="space-y-4 pt-4">
                                {[1].map(i => (
                                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
                                        <div className="flex gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                                            <div className="space-y-2 flex-grow">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                                                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasMore && posts.length > 0 && <p className="text-center text-sm text-gray-500 py-8">No more posts</p>}
                    </div>
                </div>

                {/* Right Column - Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Active Users Widget */}
                    <ActiveUsersWidget />

                    {/* Footer Info */}
                    <div className="text-xs text-gray-400 text-center">
                        <p>&copy; 2024 DeepHealth Lab. All rights reserved.</p>
                        <p className="mt-1">Community Guidelines • Privacy Policy</p>
                    </div>
                </div>
            </div>

            {/* Post Details Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedPostId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Post Details</h3>
                                <button
                                    onClick={() => setSelectedPostId(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="flex-grow overflow-y-auto p-0 custom-scrollbar">
                                <div className="p-6 pb-0">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 font-bold overflow-hidden flex-shrink-0 text-lg">
                                            {selectedPost.author_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {selectedPost.author_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>@{selectedPost.author_email?.split('@')[0]}</span>
                                                <span>•</span>
                                                <span>{timeAgo(selectedPost.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-base">
                                        {selectedPost.content}
                                    </p>

                                    <div className="py-4 mt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between text-sm font-medium text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <div className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                                <FontAwesomeIcon icon={faThumbsUp} className="text-[10px] text-white" />
                                            </div>
                                            <span>{selectedPost.likes.length}</span>
                                        </div>
                                        <span>{selectedPost.comments_count} comments</span>
                                    </div>

                                    {/* Action Buttons in Modal */}
                                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 dark:border-gray-800/50 mb-4">
                                        <button
                                            onClick={() => handleLike(selectedPost._id)}
                                            className={`py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${selectedPost.likes.includes(currentUser!.id)
                                                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faThumbsUp} />
                                            <span>Like</span>
                                        </button>
                                        <button
                                            onClick={() => handleDislike(selectedPost._id)}
                                            className={`py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${selectedPost.dislikes.includes(currentUser!.id)
                                                ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={faThumbsDown} />
                                            <span>Dislike</span>
                                        </button>
                                        <button className="py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <FontAwesomeIcon icon={faComment} />
                                            <span>Comment</span>
                                        </button>
                                    </div>

                                    {/* Comments Sections */}
                                    <div className="space-y-4 pb-6">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Comments</h4>

                                        {isLoadingDetails ? (
                                            <div className="flex justify-center p-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                            </div>
                                        ) : (
                                            selectedPost.comments && selectedPost.comments.length > 0 ? (
                                                <div className="space-y-4">
                                                    {buildCommentTree(selectedPost.comments).map(rootNode => (
                                                        <CommentNodeItem
                                                            key={rootNode.id}
                                                            node={rootNode}
                                                            postId={selectedPost._id}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No comments yet. Be the first to start the conversation!</p>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer - Main Input */}
                            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10">
                                <form onSubmit={(e) => handleComment(selectedPost._id, e)} className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {currentUser?.full_name?.charAt(0)}
                                    </div>
                                    <div className="flex-grow relative">
                                        <input
                                            type="text"
                                            value={commentInputs[selectedPost._id] || ''}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [selectedPost._id]: e.target.value }))}
                                            placeholder="Write a comment..."
                                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-full py-2.5 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentInputs[selectedPost._id]?.trim()}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-30 disabled:hover:text-blue-600 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
