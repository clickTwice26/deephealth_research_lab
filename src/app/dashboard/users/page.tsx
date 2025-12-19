'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserShield, faUserGraduate, faUserTag, faUser, faEdit, faCheck, faTimes, faShieldAlt, faPaperPlane, faInfoCircle, faIdBadge, faCalendarAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';

export default function UsersPage() {
    const { user: currentUser, login, impersonate } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

    // Modals
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Forms
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [newRole, setNewRole] = useState<string>('');

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await api.getUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch users', error);
                showToast('Failed to fetch users', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser, router, showToast]);

    const handleRoleUpdate = async () => {
        if (!selectedUser || !newRole) return;
        const userId = selectedUser.id || (selectedUser as any)._id;

        try {
            await api.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole as any } : u));
            showToast(`Role updated to ${newRole}`, 'success');
            setIsRoleModalOpen(false);
        } catch (error) {
            console.error('Failed to update role', error);
            showToast('Failed to update role', 'error');
        }
    };

    const handleDeactivate = async (user: User) => {
        const userId = user.id || (user as any)._id;
        try {
            await api.updateUserStatus(userId, !user.is_active);
            setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, is_active: !user.is_active } : u));
            showToast(`User ${user.is_active ? 'deactivated' : 'activated'}`, 'success');
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        const userId = selectedUser.id || (selectedUser as any)._id;
        try {
            await api.deleteUser(userId);
            setUsers(prev => prev.filter(u => (u.id || (u as any)._id) !== userId));
            showToast('User deleted successfully', 'success');
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Failed to delete user', error);
            showToast('Failed to delete user', 'error');
        }
    };

    const handleImpersonate = async (user: User) => {
        const userId = user.id || (user as any)._id;
        try {
            const { access_token } = await api.impersonateUser(userId);
            await impersonate(access_token);
            showToast(`Impersonating ${user.full_name}`, 'success');
        } catch (error) {
            console.error('Failed to impersonate', error);
            showToast('Failed to impersonate user', 'error');
        }
    };

    const handleEmail = async () => {
        if (!selectedUser) return;
        const userId = selectedUser.id || (selectedUser as any)._id;
        try {
            await api.sendUserEmail(userId, emailSubject, emailMessage);
            showToast('Email sent successfully', 'success');
            setIsEmailModalOpen(false);
            setEmailSubject('');
            setEmailMessage('');
        } catch (error) {
            console.error('Failed to send email', error);
            showToast('Failed to send email', 'error');
        }
    };

    const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <FontAwesomeIcon icon={faUserShield} className="text-red-500" />;
            case 'researcher': return <FontAwesomeIcon icon={faUserGraduate} className="text-blue-500" />;
            case 'member': return <FontAwesomeIcon icon={faUserTag} className="text-green-500" />;
            default: return <FontAwesomeIcon icon={faUser} className="text-gray-500" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'researcher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    // Dropdown Logic
    const [actionDropdown, setActionDropdown] = useState<string | null>(null);

    const toggleDropdown = (userId: string) => {
        if (actionDropdown === userId) {
            setActionDropdown(null);
        } else {
            setActionDropdown(userId);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setActionDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const openRoleModalForUser = (user: User) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setIsRoleModalOpen(true);
    };

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    const handleAction = (e: React.MouseEvent, action: string, user: User) => {
        e.stopPropagation();
        setActionDropdown(null);
        setSelectedUser(user);

        switch (action) {
            case 'edit':
                openRoleModalForUser(user);
                break;
            case 'deactivate':
                handleDeactivate(user);
                break;
            case 'impersonate':
                handleImpersonate(user);
                break;
            case 'email':
                setIsEmailModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" onClick={() => setActionDropdown(null)}>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 dark:text-blue-400" />
                        User Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage user roles and permissions
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-visible"
            >
                <div className="overflow-x-auto md:overflow-visible min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id || (user as any)._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{user.full_name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleIcon(user.role)}
                                            <span className="capitalize">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${user.is_active ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(user); }}
                                            className="p-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="View Details"
                                        >
                                            <FontAwesomeIcon icon={faInfoCircle} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleDropdown(user.id || (user as any)._id); }}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>

                                        {actionDropdown === (user.id || (user as any)._id) && (
                                            <div className={`absolute right-8 ${index > filteredUsers.length - 3 ? 'bottom-8' : 'top-8'} w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden`}>
                                                <div className="py-1">
                                                    <button onClick={(e) => handleAction(e, 'edit', user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faEdit} className="w-4" /> Change Role
                                                    </button>
                                                    <button onClick={(e) => handleAction(e, 'deactivate', user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faShieldAlt} className="w-4" /> {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={(e) => handleAction(e, 'impersonate', user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faUser} className="w-4" /> Impersonate
                                                    </button>
                                                    <button onClick={(e) => handleAction(e, 'email', user)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faUserTag} className="w-4" /> Quick Mail
                                                    </button>
                                                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                                                    <button onClick={(e) => handleAction(e, 'delete', user)} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faTimes} className="w-4" /> Delete User
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No users found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="User Details"
                footer={
                    <button onClick={() => setIsDetailsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Close</button>
                }
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.full_name || 'No Name'}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                                <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${getRoleBadgeColor(selectedUser.role)}`}>
                                    {getRoleIcon(selectedUser.role)}
                                    <span className="capitalize">{selectedUser.role}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faIdBadge} className="w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">User ID</span>
                                </div>
                                <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{selectedUser.id || (selectedUser as any)._id}</p>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faShieldAlt} className="w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>

                            {(selectedUser as any).created_at && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Joined At</span>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date((selectedUser as any).created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                    <FontAwesomeIcon icon={faEnvelope} className="w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Contact</span>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-white truncate" title={selectedUser.email}>{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Access Level</h4>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(selectedUser.access_weight || (selectedUser.role === 'admin' ? 100 : selectedUser.role === 'researcher' ? 50 : selectedUser.role === 'member' ? 10 : 1))}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right">
                                Weight: {selectedUser.access_weight || (selectedUser.role === 'admin' ? 100 : selectedUser.role === 'researcher' ? 50 : selectedUser.role === 'member' ? 10 : 1)} / 100
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Role Modal */}
            <Modal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                title="Change User Role"
                footer={
                    <>
                        <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                        <button onClick={handleRoleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Role</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Select a new role for <strong>{selectedUser?.full_name}</strong>:</p>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="user">User</option>
                        <option value="member">Member</option>
                        <option value="researcher">Researcher</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </Modal>

            {/* Email Modal */}
            <Modal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                title={`Email ${selectedUser?.full_name}`}
                footer={
                    <>
                        <button onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                        <button onClick={handleEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPaperPlane} /> Send Email
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter subject..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                        <textarea
                            value={emailMessage}
                            onChange={(e) => setEmailMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter your message..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete User"
                footer={
                    <>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Permanently</button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesomeIcon icon={faTimes} className="text-2xl" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">Are you sure you want to delete <strong>{selectedUser?.full_name}</strong>?</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">This action cannot be undone.</p>
                </div>
            </Modal>
        </div>
    );
}
