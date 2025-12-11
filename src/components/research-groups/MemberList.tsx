import { useState } from 'react';
import { api, ResearchGroup } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faUserPlus, faEllipsisV, faUserMinus, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';

interface MemberListProps {
    group: ResearchGroup;
    onlineUserIds: string[];
    onInvite: () => void;
    onUpdate: (group: ResearchGroup) => void;
}

export default function MemberList({ group, onlineUserIds, onInvite, onUpdate }: MemberListProps) {
    const { user } = useAuth();
    const isAdmin = group.created_by === user?.id || group.members.some(m => m.user_id === user?.id && m.role === 'admin');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const handlePromote = async (userId: string) => {
        try {
            const updated = await api.researchGroups.updateMemberRole(group._id, userId, 'admin');
            onUpdate(updated);
            setOpenMenuId(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const updated = await api.researchGroups.removeMember(group._id, userId);
            onUpdate(updated);
            setOpenMenuId(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white">Members ({group.members.length})</h3>
                {isAdmin && (
                    <button
                        onClick={onInvite}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Invite
                    </button>
                )}
            </div>

            <div className="space-y-4" onClick={() => setOpenMenuId(null)}>
                {group.members.map((member, idx) => {
                    const isOnline = onlineUserIds.includes(member.user_id);
                    const isMe = member.user_id === user?.id; // Can't act on self usually via this menu

                    return (
                        <div key={idx} className="flex items-center justify-between relative group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {(member.name || 'U').substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    {isOnline && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        {member.name}
                                        {member.role === 'admin' && (
                                            <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-xs" title="Admin" />
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {isOnline ? 'Online now' : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            {isAdmin && !isMe && (
                                <div className="relative" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === member.user_id ? null : member.user_id)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </button>

                                    {openMenuId === member.user_id && (
                                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden py-1">
                                            {member.role !== 'admin' && (
                                                <button
                                                    onClick={() => handlePromote(member.user_id)}
                                                    className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <FontAwesomeIcon icon={faUserShield} className="text-blue-500" />
                                                    Make Admin
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemove(member.user_id)}
                                                className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                                <FontAwesomeIcon icon={faUserMinus} />
                                                Remove User
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
