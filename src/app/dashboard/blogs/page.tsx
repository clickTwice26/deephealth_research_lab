'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faEye, faFileAlt, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { api, BlogPost } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function BlogDashboardPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const data = await api.getMyBlogPosts(1, 100);
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.deleteBlogPost(slug);
            setPosts(posts.filter(p => p.slug !== slug));
        } catch (error) {
            console.error('Failed to delete post', error);
            alert('Failed to delete post');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Blog Posts</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your articles and drafts.</p>
                </div>
                <Link href="/dashboard/blogs/create">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <FontAwesomeIcon icon={faPlus} /> Create New Post
                    </button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FontAwesomeIcon icon={faFileAlt} className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-6">Start sharing your research with the world.</p>
                    <Link href="/dashboard/blogs/create">
                        <button className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            Create your first post
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {posts.map((post) => (
                                <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {post.cover_image && (
                                                <img src={post.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-gray-500">{post.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.is_published ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                <FontAwesomeIcon icon={faCheckCircle} /> Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                <FontAwesomeIcon icon={faTimesCircle} /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faEye} />
                                            {post.views}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link href={`/dashboard/blogs/${post.slug}/edit`}>
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.slug)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
