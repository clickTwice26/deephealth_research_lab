'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, Publication } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPlus, faTrash, faPen, faSave, faTimes, faSearch, faChevronLeft, faChevronRight, faExternalLinkAlt, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { useDebounce } from 'use-debounce';

export default function PublicationsPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    // Data State
    const [publications, setPublications] = useState<Publication[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Other State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [journal, setJournal] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [doi, setDoi] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState(''); // Comma separated

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

    const fetchPublications = async () => {
        setIsLoading(true);
        try {
            const data = await api.getPublications(page, size, debouncedSearch);
            setPublications(data.items);
            setTotal(data.total);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch publications', error);
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
            fetchPublications();
        }
    }, [currentUser, page, size, debouncedSearch]);

    const handleEdit = (item: Publication) => {
        setEditingId(item._id);
        setTitle(item.title);
        setAuthors(item.authors);
        setJournal(item.journal);
        setDate(new Date(item.date).toISOString().split('T')[0]);
        setDoi(item.doi);
        setUrl(item.url || '');
        setTags(item.tags.join(', '));
        setIsFormModalOpen(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setAuthors('');
        setJournal('');
        setDate(new Date().toISOString().split('T')[0]);
        setDoi('');
        setUrl('');
        setTags('');
        setIsFormModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                authors,
                journal,
                date: new Date(date).toISOString(),
                doi,
                url: url || undefined,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                is_featured: true
            };

            if (editingId) {
                await api.updatePublication(editingId, payload);
                showModal('Success', 'Publication updated successfully!', 'success');
                setIsFormModalOpen(false);
                cancelEdit();
                fetchPublications();
            } else {
                await api.createPublication(payload);
                setIsFormModalOpen(false);
                cancelEdit();
                showModal('Success', 'Publication added successfully!', 'success');
                fetchPublications();
            }
        } catch (error) {
            console.error('Failed to save publication', error);
            showModal('Error', `Failed to ${editingId ? 'update' : 'add'} publication.`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await api.deletePublication(deleteId);
            setPublications(publications.filter(p => p._id !== deleteId));
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            showModal('Deleted', 'Publication has been removed.', 'success');
            if (editingId === deleteId) cancelEdit();
            fetchPublications();
        } catch (error) {
            console.error('Failed to delete publication', error);
            showModal('Error', 'Failed to delete publication.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-full mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faBook} className="text-blue-600 dark:text-blue-400" />
                        Publications Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track and showcase lab research outputs
                    </p>
                </div>
            </header>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    cancelEdit();
                }}
                title={editingId ? 'Edit Publication' : 'Add New Publication'}
                type="default"
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                        <textarea
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                            placeholder="Paper Title..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Authors</label>
                        <input
                            type="text"
                            required
                            value={authors}
                            onChange={(e) => setAuthors(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            placeholder="Author 1, Author 2, ..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Venue / Journal</label>
                            <input
                                type="text"
                                required
                                value={journal}
                                onChange={(e) => setJournal(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                placeholder="e.g. NeurIPS"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">DOI</label>
                        <input
                            type="text"
                            required
                            value={doi}
                            onChange={(e) => setDoi(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            placeholder="10.1109/..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Link URL (Optional)</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tags (Comma Separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            placeholder="Journal, IEEE, AI"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsFormModalOpen(false);
                                cancelEdit();
                            }}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-6 py-2 text-white rounded-lg font-bold transition-all transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${editingId
                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                                : "bg-gray-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 shadow-gray-500/20"
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={editingId ? faSave : faPlus} />
                                    {editingId ? 'Save Changes' : 'Add Publication'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>


            {/* List Section */}
            <div className="space-y-6">

                {/* Controls Bar */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-auto flex-1 max-w-md">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search publications..."
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
                        <button
                            onClick={() => {
                                cancelEdit();
                                setIsFormModalOpen(true);
                            }}
                            className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="hidden sm:inline">Add Publication</span>
                        </button>
                    </div>
                </div>

                {/* Content List */}
                <div className="space-y-4 min-h-[400px]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6 h-40 border border-gray-100 dark:border-gray-800" />
                            ))}
                        </div>
                    ) : publications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                            <FontAwesomeIcon icon={faBook} className="text-4xl mb-4 opacity-20" />
                            <p>No publications found.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {publications.map((is_featured) => (
                                <motion.div
                                    key={is_featured._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={`bg-white dark:bg-gray-900 rounded-xl p-6 border shadow-sm hover:shadow-md transition-all group ${editingId === is_featured._id
                                        ? 'border-blue-500 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-800'
                                        }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap gap-2 mb-1">
                                                    {is_featured.tags.map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
                                                        {is_featured.journal}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                                    {is_featured.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(is_featured)}
                                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(is_featured._id)}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Authors */}
                                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <FontAwesomeIcon icon={faUser} className="mt-1 text-xs opacity-50" />
                                            <p className="line-clamp-2">{is_featured.authors}</p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
                                            <span>{new Date(is_featured.date).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <span className="font-mono">{is_featured.doi}</span>
                                            {is_featured.url && (
                                                <>
                                                    <span className="ml-auto flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                                                        <a href={is_featured.url} target="_blank" rel="noopener noreferrer">View Link</a>
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                    </span>
                                                </>
                                            )}
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
