import { useRef, useEffect, useState, useMemo } from 'react';
import { ChatMessage, api } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faImage, faCircle, faEllipsisV, faSpinner, faTimes, faMicrophone, faStop, faWifi, faRedo } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import VoiceMessageBubble from './VoiceMessageBubble';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (content: string, audioUrl?: string) => void;
    isConnected: boolean;
}

export default function ChatBox({ messages, onSendMessage, isConnected }: ChatBoxProps) {
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // or audio/wav
                await uploadAudio(audioBlob);

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    };

    const uploadAudio = async (audioBlob: Blob) => {
        setUploading(true);
        const formData = new FormData();
        // Create a unique filename for the audio
        const filename = `voice-message-${Date.now()}.webm`;
        const file = new File([audioBlob], filename, { type: 'audio/webm' });
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            const response = await axios.post(`${apiUrl}/upload/s3`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const audioUrl = response.data.url;
            onSendMessage('', audioUrl); // Send empty text content for voice messages

        } catch (error) {
            console.error('Failed to upload audio', error);
            alert('Failed to send voice message');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            const response = await axios.post(`${apiUrl}/upload/s3`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const imageUrl = response.data.url;
            onSendMessage(`![Image](${imageUrl})`);

        } catch (error) {
            console.error('Failed to upload image', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

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
                                        group.messages[0].user_avatar ? (
                                            <img
                                                src={group.messages[0].user_avatar}
                                                alt={group.user_name}
                                                className="w-8 h-8 rounded-full object-cover shadow-md ring-2 ring-white dark:ring-gray-900 border-2 border-white dark:border-gray-800"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white dark:ring-gray-900">
                                                {group.user_name.charAt(0).toUpperCase()}
                                            </div>
                                        )
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
                                                {msg.content.startsWith('![Image](') && msg.content.endsWith(')') ? (
                                                    <img
                                                        src={msg.content.slice(9, -1)}
                                                        alt="Shared image"
                                                        className="max-w-[12rem] md:max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setExpandedImage(msg.content.slice(9, -1))}
                                                    />
                                                ) : msg.audio_url ? (
                                                    <VoiceMessageBubble audioUrl={msg.audio_url} isMe={isMe} />
                                                ) : (
                                                    msg.content
                                                )}
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
                <AnimatePresence mode="wait">
                    {isRecording ? (
                        <motion.div
                            key="recording-ui"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-red-200 dark:border-red-900/30"
                        >
                            <div className="flex items-center gap-3 pl-4 flex-1">
                                <motion.div
                                    className="w-3 h-3 bg-red-500 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                />
                                <span className="text-red-500 font-mono font-medium min-w-[50px]">
                                    {formatTime(recordingTime)}
                                </span>
                                {/* Recording Wave Visualization */}
                                <div className="flex items-center gap-1 h-8 flex-1 opacity-50 overflow-hidden">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1 bg-red-400 rounded-full"
                                            animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (mediaRecorderRef.current) {
                                            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop()); // Stop stream
                                            setIsRecording(false);
                                            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                                        }
                                    }}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                    title="Cancel"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                                <button
                                    onClick={stopRecording} // stopRecording triggers onstop which uploads and sends
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all"
                                    title="Send Voice Message"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="text-ui"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all"
                        >
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

                            <div className="flex items-center">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="p-2 text-gray-400 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    title="Upload Image"
                                >
                                    {uploading ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faImage} />
                                    )}
                                </button>
                                <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <FontAwesomeIcon icon={faSmile} />
                                </button>
                            </div>

                            {newMessage.trim() ? (
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!isConnected || !newMessage.trim()}
                                    className="p-2 rounded-full transition-all duration-300 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transform hover:scale-105"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    className="p-2 rounded-full transition-all duration-300 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    title="Record Voice Message"
                                >
                                    <FontAwesomeIcon icon={faMicrophone} />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {expandedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setExpandedImage(null)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.button
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onClick={() => setExpandedImage(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </motion.button>

                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={expandedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Disconnected Overlay */}
            <AnimatePresence>
                {!isConnected && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-gray-900/60"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4 max-w-sm mx-4 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2">
                                <FontAwesomeIcon icon={faWifi} className="text-2xl text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Connection Lost</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Oops! It seems you are disconnected from the chat server.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faRedo} />
                                <span>Refresh Page</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
