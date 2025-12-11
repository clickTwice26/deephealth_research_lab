'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faPlus, faTrash, faPen, faSave, faSearch, faChevronLeft, faChevronRight, faMapMarkerAlt, faClock, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';
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

    // Other State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Full-time');
    const [level, setLevel] = useState('Mid-level');
    const [location, setLocation] = useState('Remote');
    const [department, setDepartment] = useState('');
    const [description, setDescription] = useState('');
    const [responsibilities, setResponsibilities] = useState(''); // Newlines
    const [requirements, setRequirements] = useState(''); // Newlines
    const [skills, setSkills] = useState(''); // Comma separated
    const [applicationLink, setApplicationLink] = useState('');
    const [isActive, setIsActive] = useState(true);

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
        setType(item.type);
        setLevel(item.level);
        setLocation(item.location);
        setDepartment(item.department);
        setDescription(item.description);
        setResponsibilities(item.responsibilities.join('\n'));
        setRequirements(item.requirements.join('\n'));
        setSkills(item.skills.join(', '));
        setApplicationLink(item.application_link || '');
        setIsActive(item.is_active);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setType('Full-time');
        setLevel('Mid-level');
        setLocation('Remote');
        setDepartment('');
        setDescription('');
        setResponsibilities('');
        setRequirements('');
        setSkills('');
        setApplicationLink('');
        setIsActive(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                title,
                type,
                level,
                location,
                department,
                description,
                responsibilities: responsibilities.split('\n').map(l => l.trim()).filter(Boolean),
                requirements: requirements.split('\n').map(l => l.trim()).filter(Boolean),
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                application_link: applicationLink || undefined,
                is_active: isActive
            };

            if (editingId) {
                await api.updateJob(editingId, payload);
                showModal('Success', 'Job updated successfully!', 'success');
                cancelEdit();
                fetchJobs();
            } else {
                await api.createJob(payload);
                cancelEdit();
                showModal('Success', 'Job posted successfully!', 'success');
                fetchJobs();
            }
        } catch (error) {
            console.error('Failed to save job', error);
            showModal('Error', `Failed to ${editingId ? 'update' : 'post'} job.`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.deleteJob(id);
            setJobs(jobs.filter(j => j._id !== id));
            showModal('Deleted', 'Job has been removed.', 'success');
            if (editingId === id) cancelEdit();
            fetchJobs();
        } catch (error) {
            console.error('Failed to delete job', error);
            showModal('Error', 'Failed to delete job.', 'error');
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
                                {editingId ? 'Edit Job' : 'Post New Job'}
                            </h2>
                            {editingId && (
                                <button onClick={cancelEdit} className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    placeholder="e.g. Senior Researcher"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Level</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    >
                                        <option value="Junior">Junior</option>
                                        <option value="Mid-level">Mid-level</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Lead">Lead</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                        placeholder="e.g. Remote"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</label>
                                    <input
                                        type="text"
                                        required
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                        placeholder="e.g. AI Research"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Summary)</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none"
                                    placeholder="Brief overview..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Responsibilities (1 per line)</label>
                                <textarea
                                    value={responsibilities}
                                    onChange={(e) => setResponsibilities(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none font-mono text-sm"
                                    placeholder="- Lead research projects&#10;- Mentor junior devs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requirements (1 per line)</label>
                                <textarea
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    rows={5}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow resize-none font-mono text-sm"
                                    placeholder="- 5yrs Python exp&#10;- PhD in ML"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Skills Tags (Comma Sep)</label>
                                <input
                                    type="text"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    placeholder="Python, PyTorch, React"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Application URL</label>
                                <input
                                    type="url"
                                    value={applicationLink}
                                    onChange={(e) => setApplicationLink(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Active / Published
                                </label>
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
                                        {editingId ? 'Save Changes' : 'Post Job'}
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
                                placeholder="Search roles..."
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
                                    <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6 h-40 border border-gray-100 dark:border-gray-800" />
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-500">
                                <FontAwesomeIcon icon={faBriefcase} className="text-4xl mb-4 opacity-20" />
                                <p>No active job posts.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {jobs.map((job) => (
                                    <motion.div
                                        key={job._id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className={`bg-white dark:bg-gray-900 rounded-xl p-6 border shadow-sm hover:shadow-md transition-all group ${editingId === job._id
                                                ? 'border-blue-500 ring-1 ring-blue-500'
                                                : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {!job.is_active && (
                                                            <span className="px-2 py-1 text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
                                                                Inactive
                                                            </span>
                                                        )}
                                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                                                            {job.type}
                                                        </span>
                                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                                                            {job.level}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                                                            {job.department}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                    <button
                                                        onClick={() => handleEdit(job)}
                                                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FontAwesomeIcon icon={faPen} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job._id)}
                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {job.description}
                                            </p>

                                            {/* Footer Info */}
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                {job.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills.length > 3 && (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400">+{job.skills.length - 3}</span>
                                                )}
                                                <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faClock} />
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </span>
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
