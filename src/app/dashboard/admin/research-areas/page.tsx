'use client';

import { useState, useEffect } from 'react';
import { api, ResearchArea } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faEdit, faTrash, faSpinner,
    faBrain, faRobot, faEye, faUserMd, faNetworkWired, faLanguage,
    faArrowRight, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

// Icon mapper for selection
const ICON_OPTIONS = [
    { label: 'Brain', value: 'faBrain', icon: faBrain },
    { label: 'Robot', value: 'faRobot', icon: faRobot },
    { label: 'Eye', value: 'faEye', icon: faEye },
    { label: 'User MD', value: 'faUserMd', icon: faUserMd },
    { label: 'Network', value: 'faNetworkWired', icon: faNetworkWired },
    { label: 'Language', value: 'faLanguage', icon: faLanguage },
];

const COLOR_PALETTES = [
    { label: 'Blue', color: 'text-blue-600', bg_color: 'bg-blue-50', border: 'border-blue-100', hex: '#2563eb' },
    { label: 'Cyan', color: 'text-cyan-600', bg_color: 'bg-cyan-50', border: 'border-cyan-100', hex: '#0891b2' },
    { label: 'Purple', color: 'text-purple-600', bg_color: 'bg-purple-50', border: 'border-purple-100', hex: '#9333ea' },
    { label: 'Pink', color: 'text-pink-600', bg_color: 'bg-pink-50', border: 'border-pink-100', hex: '#db2777' },
    { label: 'Indigo', color: 'text-indigo-600', bg_color: 'bg-indigo-50', border: 'border-indigo-100', hex: '#4f46e5' },
    { label: 'Teal', color: 'text-teal-600', bg_color: 'bg-teal-50', border: 'border-teal-100', hex: '#0d9488' },
    { label: 'Green', color: 'text-green-600', bg_color: 'bg-green-50', border: 'border-green-100', hex: '#16a34a' },
    { label: 'Orange', color: 'text-orange-600', bg_color: 'bg-orange-50', border: 'border-orange-100', hex: '#ea580c' },
];

export default function AdminResearchAreasPage() {
    const [areas, setAreas] = useState<ResearchArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<ResearchArea | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'faBrain',
        color: 'text-blue-600',
        bg_color: 'bg-blue-50',
        number: '01',
        link: ''
    });

    useEffect(() => {
        fetchAreas();
    }, [page]);

    const fetchAreas = async () => {
        setLoading(true);
        try {
            const data = await api.getResearchAreas(page, 10);
            if (data && data.items) {
                setAreas(data.items);
                setTotalPages(Math.ceil(data.total / 10));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this research area?')) {
            try {
                await api.deleteResearchArea(id);
                fetchAreas();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingArea) {
                await api.updateResearchArea(editingArea._id, formData);
            } else {
                await api.createResearchArea(formData);
            }
            setIsModalOpen(false);
            setEditingArea(null);
            resetForm();
            fetchAreas();
        } catch (error) {
            console.error(error);
            alert('Operation failed');
        }
    };

    const openEdit = (area: ResearchArea) => {
        setEditingArea(area);
        setFormData({
            title: area.title,
            description: area.description,
            icon: area.icon,
            color: area.color,
            bg_color: area.bg_color,
            number: area.number,
            link: (area as any).link || ''
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            icon: 'faBrain',
            color: 'text-blue-600',
            bg_color: 'bg-blue-50',
            number: '01',
            link: ''
        });
    };

    const handleColorSelect = (palette: typeof COLOR_PALETTES[0]) => {
        setFormData({
            ...formData,
            color: palette.color,
            bg_color: palette.bg_color
        });
    };

    const getIcon = (name: string) => {
        return ICON_OPTIONS.find(opt => opt.value === name)?.icon || faBrain;
    };

    const currentIcon = getIcon(formData.icon);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research Areas</h1>
                    <p className="text-gray-500 text-sm">Manage research focus areas displayed on the landing page.</p>
                </div>
                <button
                    onClick={() => { setEditingArea(null); resetForm(); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Add Area
                </button>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center text-gray-400">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area) => (
                        <div key={area._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button onClick={() => openEdit(area)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button onClick={() => handleDelete(area._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </div>

                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${area.bg_color} ${area.color} bg-opacity-20`}>
                                <FontAwesomeIcon icon={getIcon(area.icon)} className="text-xl" />
                            </div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{area.title}</h3>
                                <span className="text-xs font-mono text-gray-400">#{area.number}</span>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{area.description}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center gap-2 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50">Next</button>
            </div>

            {/* Enhanced Modal with Live Preview */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* LEFT: Form */}
                        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                {editingArea ? 'Edit Research Area' : 'New Research Area'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Number (Order)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Icon</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        >
                                            {ICON_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g. Generative AI"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Short description of the research area..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-2">Theme Color</label>
                                    <div className="flex flex-wrap gap-3">
                                        {COLOR_PALETTES.map((palette) => (
                                            <button
                                                key={palette.label}
                                                type="button"
                                                onClick={() => handleColorSelect(palette)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${formData.color === palette.color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: palette.hex }}
                                                title={palette.label}
                                            >
                                                {formData.color === palette.color && (
                                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">CTA Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                                    >
                                        {editingArea ? 'Save Changes' : 'Create Area'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: Live Preview */}
                        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-950 p-8 border-l border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 ${formData.bg_color.replace('bg-', 'bg-').replace('50', '500')}`} />
                                <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 ${formData.bg_color.replace('bg-', 'bg-').replace('50', '500')}`} />
                            </div>

                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-8">Live Preview</p>

                            {/* The Card */}
                            <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl w-full max-w-sm">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${formData.bg_color} ${formData.color} bg-opacity-20`}>
                                    <FontAwesomeIcon icon={currentIcon} className="text-xl" />
                                </div>

                                <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:${formData.color} transition-colors`}>
                                    {formData.title || 'Area Title'}
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                    {formData.description || 'Description will appear here...'}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-4xl font-bold text-gray-200 dark:text-gray-800 select-none">
                                        {formData.number || '01'}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500`}>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
