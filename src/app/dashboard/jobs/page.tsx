'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faPlus, faTrash, faPen, faSave, faSearch, faChevronLeft, faChevronRight, faMapMarkerAlt, faClock, faLayerGroup, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import { useDebounce } from 'use-debounce';

export default function JobsPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    // Data State
    const [jobs, setJobs] = useState<Job[]>([]);
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
    const [department, setDepartment] = useState('');
    const [location, setLocation] = useState('On-site');
    const [type, setType] = useState('Full-time');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState(''); // New line separated
    const [deadline, setDeadline] = useState('');

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

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const data = await api.getJobs(page, size, debouncedSearch);
            setJobs(data.items);
            setTotal(data.total);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [currentUser, router]);

    useEffect(() => {
        if (currentUser?.role === 'admin') {
            fetchJobs();
        }
    }, [currentUser, page, size, debouncedSearch]);

    const handleEdit = (item: Job) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDepartment(item.department);
        setLocation(item.location);
        setType(item.type);
        setDescription(item.description);
        setRequirements(item.requirements.join('\n'));
        setDeadline(item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '');
        setIsFormModalOpen(true);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setDepartment('');
        setLocation('On-site');
        setType('Full-time');
        setDescription('');
        setRequirements('');
        setDeadline('');
        setIsFormModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                department,
                location,
                type,
                description,
                requirements: requirements.split('\n').map(r => r.trim()).filter(Boolean),
                posted_date: new Date().toISOString(),
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                is_active: true
            };

            if (editingId) {
                await api.updateJob(editingId, payload);
                showModal('Success', 'Job position updated successfully!', 'success');
                setIsFormModalOpen(false);
                cancelEdit();
                fetchJobs();
            } else {
                await api.createJob(payload);
                setIsFormModalOpen(false);
                cancelEdit();
                showModal('Success', 'Job position posted successfully!', 'success');
                fetchJobs();
            }
        } catch (error) {
            console.error('Failed to save job', error);
            showModal('Error', `Failed to ${editingId ? 'update' : 'post'} job.`, 'error');
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
            await api.deleteJob(deleteId);
            setJobs(jobs.filter(j => j._id !== deleteId));
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            showModal('Deleted', 'Job has been removed.', 'success');
            if (editingId === deleteId) cancelEdit();
            fetchJobs();
        } catch (error) {
            console.error('Failed to delete job', error);
            showModal('Error', 'Failed to delete job.', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 dark:text-blue-400" />
                        Job Board Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage open roles and career opportunities
                    </p>
                </div>
            </header>


            <Modal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    cancelEdit();
                }}
                title={editingId ? 'Edit Position' : 'Post New Layout'}
                type="default"
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Job Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            placeholder="e.g. PhD Student - NLP"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                            <input
                                type="text"
                                required
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                placeholder="e.g. CS"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Internship</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            >
                                <option>On-site</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Application Deadline</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                            placeholder="What is this role about?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requirements (One per line)</label>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none font-mono text-sm"
                            placeholder="- Requirement 1&#10;- Requirement 2"
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
                                    {editingId ? 'Save Changes' : 'Post Position'}
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
                            placeholder="Search jobs..."
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
                            <span className="hidden sm:inline">Post Position</span>
                        </button>
                    </div>
                </div>

                {/* Content List */}
                <div className="space-y-4 min-h-[400px]">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6 h-48 border border-gray-100 dark:border-gray-800" />
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                            <FontAwesomeIcon icon={faBriefcase} className="text-4xl mb-4 opacity-20" />
                            <p>No open positions found.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {jobs.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className={`bg-white dark:bg-gray-900 rounded-xl p-6 border shadow-sm hover:shadow-md transition-all group ${editingId === item._id
                                        ? 'border-blue-500 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-800'
                                        }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start md:justify-between gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faBuilding} /> {item.department}
                                                </span>
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faClock} /> {item.type}
                                                </span>
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-md flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} /> {item.location}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                                                {item.description}
                                            </p>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                                                <span>Posted: {new Date(item.posted_date || item.created_at).toLocaleDateString()}</span>
                                                {item.deadline && (
                                                    <span className="font-semibold text-red-500">
                                                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex lg:flex-col items-center lg:items-end gap-2 border-t lg:border-t-0 border-gray-100 dark:border-gray-800 pt-4 lg:pt-0">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faPen} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item._id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/dashboard/jobs/${item._id}/applicants`)}
                                                className="ml-auto lg:ml-0 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                View Applicants
                                            </button>
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
