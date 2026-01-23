'use client';

import { useState, useEffect } from 'react';
import { api, TeamMember, SocialLinks } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUpload, faUser, faSpinner, faTimes, faSearch, faSave } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '@/components/ConfirmModal';
import { faGoogle, faLinkedin, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    // Form State
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant?: 'confirm' | 'alert';
        onConfirm: () => void;
        isDestructive?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<Partial<TeamMember>>({
        name: '',
        designation: '',
        university: '',
        designation_weight: 0,
        bio: '',
        email: '',
        phone: '',
        profile_image: '',
        social_links: { google_scholar: '', linkedin: '', twitter: '', website: '', github: '' }
    });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const data = await api.getTeamMembers();
            setMembers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setSelectedFile(null);
        setFormData({
            ...member,
            social_links: { ...member.social_links } // deep copy
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Team Member',
            message: `Are you sure you want to delete ${name}?`,
            variant: 'confirm',
            isDestructive: true,
            onConfirm: async () => {
                setDeleteLoading(id);
                setModalConfig(prev => ({ ...prev, isOpen: false })); // Close confirm modal
                try {
                    await api.deleteTeamMember(id);
                    await fetchMembers();
                } catch (error) {
                    console.error(error);
                    setModalConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete member',
                        variant: 'alert',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                } finally {
                    setDeleteLoading(null);
                }
            }
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setSelectedFile(file);
        // Create local preview
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, profile_image: previewUrl }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalData = { ...formData }; // copy

            // Upload image if selected
            if (selectedFile) {
                try {
                    const uploadRes = await api.uploadImage(selectedFile);
                    finalData.profile_image = uploadRes.url;
                } catch (err) {
                    setModalConfig({
                        isOpen: true,
                        title: 'Upload Failed',
                        message: 'Failed to upload new image. Saving profile without it.',
                        variant: 'alert',
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                    // Optionally return here to stop
                    // return; 
                }
            }

            // Clean up preview URL if it was a blob and upload failed or logic changed
            // Actually, if upload succeeded, finalData.profile_image is the remote URL. 
            // If upload failed, it might still be the blob URL, which is bad for backend. 
            // Ideally we check if profile_image starts with blob: and fail hard or retry.
            // But for now let's assume valid flow or careful error handling.

            if (editingMember) {
                await api.updateTeamMember(editingMember._id, finalData);
            } else {
                await api.createTeamMember(finalData);
            }
            setIsModalOpen(false);
            fetchMembers();
            resetForm();
        } catch (error) {
            console.error(error);
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to save member',
                variant: 'alert',
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingMember(null);
        setSelectedFile(null);
        setFormData({
            name: '',
            designation: '',
            university: '',
            designation_weight: 0,
            bio: '',
            email: '',
            phone: '',
            profile_image: '',
            social_links: { google_scholar: '', linkedin: '', twitter: '', website: '', github: '' }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
                    <p className="text-gray-500 text-sm">Manage faculty, students, and staff profiles.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Member
                </button>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-gray-400">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Profile</th>
                                <th className="px-6 py-4">Name & Designation</th>
                                <th className="px-6 py-4">Weight</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {members.map(member => (
                                <tr key={member._id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            {member.profile_image ? (
                                                <img src={member.profile_image} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                                        <div className="text-xs text-gray-500">{member.designation}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                                            {member.designation_weight}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member._id, member.name)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {members.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No team members found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingMember ? 'Edit Profile' : 'New Team Member'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form id="team-form" onSubmit={handleSubmit} className="space-y-6">
                                    {/* Image Upload */}
                                    <div className="flex justify-center">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                                {formData.profile_image ? (
                                                    <img src={formData.profile_image} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faUser} className="text-3xl text-gray-400" />
                                                )}
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                        <FontAwesomeIcon icon={faSpinner} spin className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="absolute bottom-0 right-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-sm">
                                                <FontAwesomeIcon icon={faUpload} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Associate Professor"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                                value={formData.designation}
                                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">University / Affiliation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Stanford University"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                            value={formData.university || ''}
                                            onChange={e => setFormData({ ...formData, university: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                            Order Weight <span className="text-gray-400 font-normal ml-1">(Higher shows first)</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                            value={formData.designation_weight}
                                            onChange={e => setFormData({ ...formData, designation_weight: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                            value={formData.bio || ''}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>

                                    {/* Contact */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                                value={formData.email || ''}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500"
                                                value={formData.phone || ''}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Social Profiles</label>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-gray-400"><FontAwesomeIcon icon={faGoogle} /></div>
                                                <input
                                                    type="text"
                                                    placeholder="Google Scholar URL"
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:border-blue-500"
                                                    value={formData.social_links?.google_scholar || ''}
                                                    onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, google_scholar: e.target.value } })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-gray-400"><FontAwesomeIcon icon={faLinkedin} /></div>
                                                <input
                                                    type="text"
                                                    placeholder="LinkedIn URL"
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:border-blue-500"
                                                    value={formData.social_links?.linkedin || ''}
                                                    onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-gray-400"><FontAwesomeIcon icon={faTwitter} /></div>
                                                <input
                                                    type="text"
                                                    placeholder="Twitter/X URL"
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:border-blue-500"
                                                    value={formData.social_links?.twitter || ''}
                                                    onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 flex justify-center text-gray-400"><FontAwesomeIcon icon={faGithub} /></div>
                                                <input
                                                    type="text"
                                                    placeholder="GitHub URL"
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm focus:outline-none focus:border-blue-500"
                                                    value={formData.social_links?.github || ''}
                                                    onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, github: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="team-form"
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2 font-medium"
                                >
                                    {submitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                                    Save Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
