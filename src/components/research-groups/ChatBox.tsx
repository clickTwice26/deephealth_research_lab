import { useRef, useEffect, useState, useMemo } from 'react';
import { ChatMessage } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faImage, faCircle, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isConnected: boolean;
}

export default function ChatBox({ messages, onSendMessage, isConnected }: ChatBoxProps) {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [newMessage]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !isConnected) return;

        onSendMessage(newMessage);
        setNewMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Group messages
    const groupedMessages = useMemo(() => {
        const groups: { user_id: string; user_name: string; messages: ChatMessage[] }[] = [];
        let currentGroup: { user_id: string; user_name: string; messages: ChatMessage[] } | null = null;

        messages.forEach((msg) => {
            if (currentGroup && currentGroup.user_id === msg.user_id) {
                currentGroup.messages.push(msg);
            } else {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = {
                    user_id: msg.user_id,
                    user_name: msg.user_name,
                    messages: [msg]
                };
            }
        });
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Chat</h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isConnected
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        {isConnected ? 'Live' : 'Disconnected'}
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <FontAwesomeIcon icon={faEllipsisV} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {groupedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 opacity-60">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FontAwesomeIcon icon={faPaperPlane} className="text-2xl" />
                        </div>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    groupedMessages.map((group, groupIdx) => {
                        const isMe = group.user_id === user?.id || group.user_id === user?.id_;

                        return (
                            <div key={groupIdx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex flex-col justify-end pb-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-gray-900">
                                            {group.user_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-0.5">
                                            {group.user_name}
                                        </span>
                                    )}

                                    {group.messages.map((msg, msgIdx) => {
                                        const isLast = msgIdx === group.messages.length - 1;
                                        const isFirst = msgIdx === 0;

                                        // Dynamic rounding
                                        let borderRadius = 'rounded-2xl';
                                        if (isMe) {
                                            if (!isFirst) borderRadius += ' rounded-tr-md';
                                            if (!isLast) borderRadius += ' rounded-br-md';
                                        } else {
                                            if (!isFirst) borderRadius += ' rounded-tl-md';
                                            if (!isLast) borderRadius += ' rounded-bl-md';
                                        }

                                        return (
                                            <div
                                                key={msg._id || msgIdx}
                                                className={`px-4 py-2 text-[15px] leading-relaxed break-words shadow-sm transition-all hover:brightness-95 ${isMe
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                                                    } ${borderRadius}`}
                                            >
                                                {msg.content}
                                            </div>
                                        );
                                    })}

                                    <div className={`text-[10px] text-gray-400 ${isMe ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {new Date(group.messages[group.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                    {/* Addons (Visual only) */}
                    <button className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FontAwesomeIcon icon={faImage} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Aa"
                        rows={1}
                        className="flex-1 max-h-32 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-none focus:ring-0 p-2 resize-none leading-normal scrollbar-hide"
                        style={{ minHeight: '40px' }}
                    />

                    <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FontAwesomeIcon icon={faSmile} />
                    </button>

                    <button
                        onClick={() => handleSend()}
                        disabled={!isConnected || !newMessage.trim()}
                        className={`p-2 rounded-full transition-all duration-300 ${newMessage.trim()
                                ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 transform hover:scale-105'
                                : 'bg-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>
        </div>
    );
}
