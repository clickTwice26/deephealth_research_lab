'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, BlogPost } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faSpinner, faImage, faTimes, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import RichTextEditor from '@/components/RichTextEditor';
import ConfirmModal from '@/components/ConfirmModal';
import axios from 'axios';

interface BlogEditorProps {
    slug?: string;
    isNew?: boolean;
}

export default function BlogEditor({ slug, isNew = false }: BlogEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(!!slug);
    const [saving, setSaving] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant?: 'confirm' | 'alert';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        } else {
            setLoading(false); // If it's a new post, no initial loading is needed
        }
    }, [slug, isNew]);

    const fetchPost = async () => {
        try {
            const post = await api.getBlogPost(slug!);
            setFormData(post);
        } catch (error) {
            console.error('Failed to load post', error);
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to load post',
                variant: 'alert',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setLoading(false);
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

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCover(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            const response = await axios.post(`${apiUrl}/upload/s3`, uploadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData({ ...formData, cover_image: response.data.url });
        } catch (error) {
            console.error('Failed to upload image', error);
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to upload image',
                variant: 'alert',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setUploadingCover(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
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
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to save post. Please ensure slug is unique.',
                variant: 'alert',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cover Image
                            </label>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleCoverUpload}
                            />

                            {formData.cover_image ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-800">
                                    <img
                                        src={formData.cover_image}
                                        alt="Cover"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors text-sm font-medium"
                                        >
                                            Change
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, cover_image: '' })}
                                            className="p-2 bg-red-500/80 hover:bg-red-600/80 text-white rounded-lg backdrop-blur-sm transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                                >
                                    {uploadingCover ? (
                                        <div className="flex flex-col items-center gap-2 text-blue-500">
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
                                            <span className="text-sm font-medium">Uploading...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                                                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-xl" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload cover image</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
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
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                        {saving ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
            />
        </div>
    );
}
