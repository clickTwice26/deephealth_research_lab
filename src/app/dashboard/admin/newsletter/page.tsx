'use client';

import { useState, useEffect } from 'react';
import { api, Subscriber } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTrash, faPaperPlane, faSpinner, faCheckCircle, faExclamationCircle, faSearch, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '@/components/ConfirmModal';
import { motion } from 'framer-motion';
import RichTextEditor from '@/components/RichTextEditor';

export default function AdminNewsletterPage() {
    // ... existing state
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant?: 'confirm' | 'alert';
        onConfirm: () => void;
        isDestructive?: boolean;
        icon?: React.ReactNode;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchSubscribers();
    }, [page]);

    // ... existing fetchSubscribers, handleDelete, handleExport

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const data = await api.getNewsletterSubscribers(page, 20);
            if (data && data.items) {
                setSubscribers(data.items);
                setTotalPages(Math.ceil(data.total / 20));
                setTotalCount(data.total);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubscriber = async (id: string, email: string) => {
        setModalConfig({
            isOpen: true,
            title: 'Remove Subscriber',
            message: `Are you sure you want to remove ${email} from the newsletter ? `,
            variant: 'confirm',
            isDestructive: true,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await api.deleteNewsletterSubscriber(id);
                    await fetchSubscribers();
                } catch (err) {
                    setModalConfig({
                        isOpen: true,
                        title: 'Error',
                        message: 'Failed to delete subscriber',
                        variant: 'alert',
                        icon: <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-3xl" />,
                        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Date\n"
            + subscribers.map(s => `${s.email},${new Date(s.subscribed_at).toISOString()} `).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendMail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.sendNewsletter(subject, message);
            setModalConfig({
                isOpen: true,
                title: 'Success',
                message: 'Newsletter queued successfully!',
                variant: 'alert',
                icon: <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-3xl" />,
                onConfirm: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    setIsComposeOpen(false); // Close compose modal on success
                }
            });
            setSubject('');
            setMessage('');
        } catch (err) {
            console.error(err);
            setModalConfig({
                isOpen: true,
                title: 'Error',
                message: 'Failed to send newsletter. Please try again.',
                variant: 'alert',
                icon: <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-3xl" />,
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
        } finally {
            setSending(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h1>
                    <p className="text-gray-500 text-sm">Manage newsletter subscriptions. Total: {totalCount}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Send Newsletter
                    </button>
                </div>
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compose Newsletter</h3>
                                <p className="text-sm text-gray-500">Draft your email to {totalCount} subscribers</p>
                            </div>
                            <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <FontAwesomeIcon icon={faTimes} className="text-xl" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* LEFT: Editor */}
                            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
                                <form id="newsletter-form" onSubmit={handleSendMail} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            placeholder="e.g. Monthly Research Updates"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message Body</label>
                                        <div className="prose-editor-wrapper">
                                            <RichTextEditor
                                                content={message}
                                                onChange={(html) => setMessage(html)}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT: Live Preview */}
                            <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-950 p-6 overflow-y-auto flex flex-col items-center">
                                <div className="w-full max-w-md bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden transform scale-100 origin-top">
                                    {/* Mock Email Header */}
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                RL
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 dark:text-white">Research Lab</div>
                                                <div className="text-[10px] text-gray-500">to subscribers</div>
                                            </div>
                                            <div className="ml-auto text-[10px] text-gray-400">
                                                Just now
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {subject || '(No Subject)'}
                                        </div>
                                    </div>

                                    {/* Mock Email Body */}
                                    <div className="p-6 min-h-[300px] bg-white dark:bg-black">
                                        {message ? (
                                            <div
                                                className="prose dark:prose-invert prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: message }}
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-sm italic text-center mt-10">
                                                Start typing to preview content...
                                            </div>
                                        )}
                                    </div>

                                    {/* Mock Email Footer */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center">
                                        <p className="text-[10px] text-gray-400">
                                            You received this email because you subscribed to Research Lab updates.
                                        </p>
                                        <p className="text-[10px] text-blue-500 mt-1 cursor-pointer hover:underline">
                                            Unsubscribe
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faEnvelope} /> Live Email Preview
                                </p>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsComposeOpen(false)}
                                className="px-5 py-2.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                form="newsletter-form"
                                type="submit"
                                disabled={sending}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                            >
                                {sending ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
                                {sending ? 'Sending Broadcast...' : 'Send Broadcast'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative max-w-md">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:outline-none focus:border-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center text-gray-400">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No subscribers found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Subscribed At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredSubscribers.map((subscriber, index) => (
                                    <tr key={subscriber._id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-400">{(page - 1) * 20 + index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{subscriber.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(subscriber.subscribed_at).toLocaleDateString()} {new Date(subscriber.subscribed_at).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleRemoveSubscriber(subscriber._id, subscriber.email)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Unsubscribe"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 text-sm rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400"
                    >
                        Next
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                isDestructive={modalConfig.isDestructive}
            />
        </div>
    );
}
