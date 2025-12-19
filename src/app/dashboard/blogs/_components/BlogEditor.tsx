'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, BlogPost } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import RichTextEditor from '@/components/RichTextEditor';

interface BlogEditorProps {
    slug?: string;
    isNew?: boolean;
}

export default function BlogEditor({ slug, isNew = false }: BlogEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        content: '',
        summary: '',
        category: 'General',
        tags: [],
        cover_image: '',
        is_published: false
    });

    // For tags input
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (!isNew && slug) {
            fetchPost();
        }
    }, [slug, isNew]);

    const fetchPost = async () => {
        try {
            const post = await api.getBlogPost(slug!);
            setFormData(post);
        } catch (error) {
            console.error('Failed to fetch post', error);
            alert('Failed to load post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateSlug = () => {
        if (formData.title) {
            const newSlug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData({ ...formData, slug: newSlug });
        }
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagInput.trim();
            if (tag && !formData.tags?.includes(tag)) {
                setFormData({
                    ...formData,
                    tags: [...(formData.tags || []), tag]
                });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isNew) {
                await api.createBlogPost(formData);
                router.push('/dashboard/blogs');
            } else {
                await api.updateBlogPost(slug!, formData);
                router.push('/dashboard/blogs');
            }
        } catch (error) {
            console.error('Failed to save post', error);
            alert('Failed to save post. Please ensure slug is unique.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 w-full mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isNew ? 'Create New Post' : 'Edit Post'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            onBlur={() => isNew && !formData.slug && handleGenerateSlug()}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter post title"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Slug (URL)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateSlug}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
                            >
                                Generate
                            </button>
                        </div>
                    </div>

                    {/* Category & Cover Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Research, News"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cover Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.cover_image || ''}
                                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Summary
                        </label>
                        <textarea
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            rows={2}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Brief summary for cards and SEO"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                        </label>
                        <RichTextEditor
                            content={formData.content || ''}
                            onChange={(html) => setFormData({ ...formData, content: html })}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black min-h-[42px]">
                            {formData.tags?.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="flex-1 bg-transparent outline-none min-w-[120px]"
                                placeholder="Type tag and press Enter"
                            />
                        </div>
                    </div>

                    {/* Publishing */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="is_published" className="text-sm font-medium text-gray-900 dark:text-white select-none cursor-pointer">
                            Publish immediately
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                        {isSaving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
