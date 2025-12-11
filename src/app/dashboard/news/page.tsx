'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, News } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faPlus, faTrash, faBullhorn, faCalendarAlt, faPen, faLink, faSave, faTimes, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { useDebounce } from 'use-debounce'; // Assuming this exists or using simple timeout

export default function NewsPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    // Data State
    const [news, setNews] = useState<News[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500); // Need to install use-debounce or implement manually

    // Other State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'default';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'default'
    });

    const showModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
        setModalConfig({ isOpen: true, title, message, type });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const data = await api.getNews(page, size, debouncedSearch);
            setNews(data.items);
            setTotal(data.total);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch news', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auth Check
    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    // Fetch on params change
    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchNews();
        }
    }, [currentUser, page, size, debouncedSearch]);

    const handleEdit = (item: News) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setDate(new Date(item.date).toISOString().split('T')[0]);
        setCtaText(item.cta_text || '');
        setCtaLink(item.cta_link || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setCtaText('');
        setCtaLink('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                description,
                date: new Date(date).toISOString(),
                is_published: true,
                cta_text: ctaText || undefined,
                cta_link: ctaLink || undefined
            };

            if (editingId) {
                await api.updateNews(editingId, payload);
                showModal('Success', 'News updated successfully!', 'success');
                cancelEdit();
                fetchNews(); // Refresh list to see updates (important if title changed affecting sort order)
            } else {
                await api.createNews(payload);
                cancelEdit();
                showModal('Success', 'News published successfully!', 'success');
                // Refresh list
                fetchNews();
            }
        } catch (error) {
            console.error('Failed to save news', error);
            showModal('Error', `Failed to ${editingId ? 'update' : 'publish'} news. Please try again.`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this news item?')) return;
        try {
            await api.deleteNews(id);
            setNews(news.filter(n => n._id !== id));
            showModal('Deleted', 'News item has been removed.', 'success');
            if (editingId === id) cancelEdit();
            fetchNews();
        } catch (error) {
            console.error('Failed to delete news', error);
            showModal('Error', 'Failed to delete news.', 'error');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faBullhorn} className="text-blue-600 dark:text-blue-400" />
                        News Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage and publish updates to the landing page
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                {/* 1. Form Column */}
                <div className="xl:col-span-1 order-2 xl:order-1">
                    <motion.div
                        layout
                        className={`rounded-xl shadow-sm border p-6 sticky top-8 transition-colors ${editingId
                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 ring-2 ring-blue-500/20'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-lg font-bold flex items-center gap-2 ${editingId ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                                <FontAwesomeIcon icon={editingId ? faPen : faPlus} />
                                {editingId ? 'Edit News Item' : 'Publish New Update'}
                            </h2>
                            {editingId && (
                                <button onClick={cancelEdit} className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Headline</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    placeholder="e.g., Paper Accepted at EMNLP"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Content</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                                    placeholder="Details about the news..."
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faLink} className="text-gray-400" />
                                    Call to Action <span className="text-gray-400 font-normal lowercase">(optional)</span>
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={ctaText}
                                        onChange={(e) => setCtaText(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 text-sm"
                                        placeholder="Button Text (e.g. Read Paper)"
                                    />
                                    <input
                                        type="url"
                                        value={ctaLink}
                                        onChange={(e) => setCtaLink(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/50 text-sm"
                                        placeholder="URL (https://...)"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 text-white rounded-lg font-bold transition-all transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${editingId
                                        ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                        : "bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-gray-500/20"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={editingId ? faSave : faPlus} />
                                        {editingId ? 'Save Changes' : 'Publish Update'}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* 2. List Column */}
                <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">

                    {/* Controls Bar */}
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-auto flex-1 max-w-md">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search news by title..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-sm text-gray-500">
                            <span>Show:</span>
                            <select
                                value={size}
                                onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
                                className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-2 py-1 focus:ring-0 font-semibold cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="space-y-4 min-h-[400px]">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6 h-32 border border-gray-100 dark:border-gray-800" />
                                ))}
                            </div>
                        ) : news.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                                <FontAwesomeIcon icon={faNewspaper} className="text-4xl mb-4 opacity-20" />
                                <p>No news items found.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {news.map((item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className={`bg-white dark:bg-gray-900 rounded-xl p-5 border shadow-sm hover:shadow-md transition-all group ${editingId === item._id
                                                ? 'border-blue-500 ring-1 ring-blue-500'
                                                : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold">
                                                {new Date(item.date).getDate()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white truncate pr-4 text-lg">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                                                            {new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                            {item.cta_text && (
                                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                                                    <FontAwesomeIcon icon={faLink} className="text-[10px]" />
                                                                    {item.cta_text}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{(page - 1) * size + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(page * size, total)}</span> of <span className="font-bold text-gray-900 dark:text-white">{total}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                type={modalConfig.type}
            >
                <p>{modalConfig.message}</p>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
}
