'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ResearchGroup, ChatMessage } from '@/lib/api';
import ChatBox from '@/components/research-groups/ChatBox';
import MemberList from '@/components/research-groups/MemberList';
import InviteMemberModal from '@/components/research-groups/InviteMemberModal';
import GroupSettingsModal from '@/components/research-groups/GroupSettingsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faCog, faCamera } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.id as string;
    const { user } = useAuth();

    // State
    const [group, setGroup] = useState<ResearchGroup | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // WS
    const wsRef = useRef<WebSocket | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !group) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            await axios.post(`${apiUrl}/research-groups/${groupId}/image`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Refresh group data
            const updated = await api.researchGroups.get(groupId);
            setGroup(updated);

        } catch (error) {
            console.error('Failed to upload image', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImageClick = () => {
        console.log('Image clicked. isAdmin:', isAdmin, 'uploading:', uploadingImage);
        if (isAdmin && !uploadingImage) {
            fileInputRef.current?.click();
        }
    };

    // Initial Fetch
    useEffect(() => {
        if (!groupId) return;

        const fetchData = async () => {
            try {
                const g = await api.researchGroups.get(groupId);
                setGroup(g);
                const msgs = await api.researchGroups.getMessages(groupId);
                setMessages(msgs);
            } catch (e) {
                console.error(e);
                router.push('/dashboard/research-groups');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId, router]);

    // WebSocket
    useEffect(() => {
        if (!groupId || loading || !group) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
        const hostPath = apiUrl.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}://${hostPath}/research-groups/${groupId}/ws?token=${token}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'message') {
                    setMessages(prev => [...prev, payload.data]);
                    // Mark read when receiving message in active window
                    api.researchGroups.markRead(groupId).catch(console.error);
                } else if (payload.type === 'status') {
                    setOnlineUserIds(payload.online_users);
                }
            } catch (e) { }
        };

        ws.onclose = () => setIsConnected(false);

        return () => ws.close();
    }, [groupId, loading, group]);

    // Mark read on initial load
    useEffect(() => {
        if (groupId) {
            api.researchGroups.markRead(groupId).catch(console.error);
        }
    }, [groupId]);

    const sendMessage = (content: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(content);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (!group) return null;

    const isAdmin = group.created_by === user?.id || group.members.some(m => m.user_id === user?.id && m.role === 'admin');

    // Debug Logs
    console.log('Group Details Debug:', {
        userId: user?.id,
        groupCreatedBy: group.created_by,
        isAdmin,
        members: group.members
    });

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/research-groups"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                {group.image_url ? (
                                    <img src={group.image_url} alt={group.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-bold text-gray-400">{group.name.charAt(0)}</span>
                                )}
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all z-20"
                                    title="Change Image"
                                >
                                    {uploadingImage ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                                    ) : (
                                        <FontAwesomeIcon icon={faCamera} className="text-[10px]" />
                                    )}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                {group.name}
                                <span className="text-xs font-normal px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    {group.topic}
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl line-clamp-1">
                                {group.description}
                            </p>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Group Settings"
                    >
                        <FontAwesomeIcon icon={faCog} />
                    </button>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                <div className="lg:col-span-3 h-full flex flex-col min-h-0">
                    <ChatBox messages={messages} onSendMessage={sendMessage} isConnected={isConnected} />
                </div>
                <div className="lg:col-span-1 h-full overflow-y-auto">
                    <MemberList
                        group={group}
                        onlineUserIds={onlineUserIds}
                        onInvite={() => setIsInviteOpen(true)}
                        onUpdate={(updated) => setGroup(updated)}
                    />
                </div>
            </div>

            <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} groupId={groupId} />
            <GroupSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                group={group}
                onUpdate={(updated) => setGroup(updated)}
            />

        </div>
    );
}
