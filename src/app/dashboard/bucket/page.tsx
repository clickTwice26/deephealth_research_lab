'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faTrash, faFile, faFileImage, faFilePdf, faSpinner, faHdd, faCopy, faEye, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface BucketFile {
    key: string;
    filename: string;
    size: number;
    last_modified: string;
    url: string;
}

export default function BucketPage() {
    const { user } = useAuth();
    const [files, setFiles] = useState<BucketFile[]>([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageLimit, setStorageLimit] = useState(200 * 1024 * 1024); // Default 200MB
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchBucketData();
    }, []);

    const fetchBucketData = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            const response = await axios.get(`${apiUrl}/bucket/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setFiles(response.data.files);
            setStorageUsed(response.data.storage_used);
            setStorageLimit(response.data.storage_limit);
        } catch (error) {
            console.error('Failed to fetch bucket data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic pre-check
        if (storageUsed + file.size > storageLimit) {
            alert('Not enough storage space!');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            await axios.post(`${apiUrl}/bucket/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            await fetchBucketData(); // Refresh list
        } catch (error) {
            console.error('Failed to upload file', error);
            alert('Upload failed: ' + (error as any).response?.data?.detail || 'Unknown error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

            await axios.delete(`${apiUrl}/bucket/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            await fetchBucketData(); // Refresh list
        } catch (error) {
            console.error('Failed to delete file', error);
            alert('Delete failed');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return faFileImage;
        if (['pdf'].includes(ext || '')) return faFilePdf;
        return faFile;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    // Calculate progress percentage
    const progress = Math.min((storageUsed / storageLimit) * 100, 100);
    const progressColor = progress > 90 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-blue-600';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Role check (simple client-side, real check is server-side)
    if (user && user.role !== 'researcher' && user.role !== 'admin') {
        return <div className="p-8 text-center text-gray-500">Access Restricted: Researchers only.</div>;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Cloud Bucket</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your research files and assets.</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCloudUploadAlt} />}
                    Upload File
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleUpload}
                />
            </div>

            {/* Storage Usage */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FontAwesomeIcon icon={faHdd} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Storage Usage</h3>
                            <p className="text-xs text-gray-500">{formatSize(storageUsed)} of {formatSize(storageLimit)} used</p>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${progressColor} transition-all duration-500`}
                    />
                </div>
            </div>

            {/* File List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Modified</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-3xl opacity-20" />
                                            <p>No files uploaded yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                files.map((file) => (
                                    <tr key={file.key} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                    <FontAwesomeIcon icon={getFileIcon(file.filename)} />
                                                </div>
                                                <div>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                    >
                                                        {file.filename}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                            {formatSize(file.size)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(file.last_modified).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(file.filename.split('.').pop()?.toLowerCase() || '') && (
                                                    <button
                                                        onClick={() => setPreviewImage(file.url)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Preview"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                )}
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Download"
                                                    download
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(file.url)}
                                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                    title="Copy URL"
                                                >
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.filename)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete File"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* File Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl overflow-visible p-2"
                                title="Close"
                            >
                                <FontAwesomeIcon icon={faTimes} /> Close
                            </button>

                            {previewImage.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewImage}
                                    className="w-full h-[85vh] bg-white rounded-lg shadow-2xl"
                                    title="PDF Preview"
                                />
                            ) : (
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    src={previewImage}
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
