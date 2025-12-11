'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserShield, faUserGraduate, faUserTag, faUser, faEdit, faCheck, faTimes, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

    useEffect(() => {
        // Simple client-side protection (backend also ignores non-admins)
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
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.role === 'admin') {
            fetchUsers();
        }
    }, [currentUser, router]);

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setRoleUpdating(userId);
        try {
            await api.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => (u.id === userId || u._id === userId) ? { ...u, role: newRole as any } : u));
        } catch (error) {
            console.error('Failed to update role', error);
            alert('Failed to update role');
        } finally {
            setRoleUpdating(null);
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

    const [actionDropdown, setActionDropdown] = useState<string | null>(null);

    const toggleDropdown = (userId: string) => {
        if (actionDropdown === userId) {
            setActionDropdown(null);
        } else {
            setActionDropdown(userId);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActionDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAction = (e: React.MouseEvent, action: string, user: User) => {
        e.stopPropagation();
        setActionDropdown(null);
        const userId = user.id || (user as any)._id;

        switch (action) {
            case 'edit':
                // For now, toggle role editing mode or similar
                const newRole = user.role === 'user' ? 'researcher' : 'user'; // Simple toggle for demo or use prompt
                const role = prompt("Enter new role (admin, researcher, member, user):", user.role);
                if (role && ['admin', 'researcher', 'member', 'user'].includes(role)) {
                    handleRoleUpdate(userId, role);
                }
                break;
            case 'deactivate':
                if (confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.full_name}?`)) {
                    // api.updateUserStatus(userId, !user.is_active); // Assuming API exists or mock it
                    alert(`${user.is_active ? 'Deactivated' : 'Activated'} user ${user.full_name}`);
                }
                break;
            case 'impersonate':
                alert(`Impersonating ${user.full_name}... (Redirecting to their view)`);
                break;
            case 'email':
                window.location.href = `mailto:${user.email}`;
                break;
            case 'delete':
                if (confirm(`Are you sure you want to PERMANENTLY DELETE ${user.full_name}? This action cannot be undone.`)) {
                    // api.deleteUser(userId);
                    alert(`Deleted user ${user.full_name}`);
                    setUsers(prev => prev.filter(u => (u.id || (u as any)._id) !== userId));
                }
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
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-visible" // overflow-visible for dropdowns
            >
                <div className="overflow-x-auto min-h-[400px]">
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
                            {filteredUsers.map((user) => (
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
                                    <td className="px-6 py-4 relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleDropdown(user.id || (user as any)._id); }}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>

                                        {actionDropdown === (user.id || (user as any)._id) && (
                                            <div className="absolute right-8 top-8 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
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
        </div>
    );
}
