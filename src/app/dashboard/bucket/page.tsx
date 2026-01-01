'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCloudUploadAlt, faTrash, faFile, faFileImage, faFilePdf, faSpinner, faHdd,
    faCopy, faEye, faDownload, faTimes, faList, faThLarge, faSearch, faFileAlt, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
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
    const [filteredFiles, setFilteredFiles] = useState<BucketFile[]>([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageLimit, setStorageLimit] = useState(200 * 1024 * 1024);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isDragging, setIsDragging] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBucketData();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredFiles(files);
        } else {
            setFilteredFiles(files.filter(f =>
                f.filename.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        }
    }, [searchQuery, files]);

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
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
            await fetchBucketData();
        } catch (error: any) {
            console.error('Upload failed', error);
            alert('Upload failed: ' + (error.response?.data?.detail || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            // Currently supporting single file upload sequentially for simplicity
            // Could strictly assume API handles one, or loop.
            // Based on previous code, it uploads one. Let's upload the first one.
            await uploadFile(files[0]);
            if (files.length > 1) {
                alert('Only single file upload is currently supported via UI.');
            }
        }
    }, [storageUsed, storageLimit]); // eslint-disable-line

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
            await axios.delete(`${apiUrl}/bucket/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchBucketData();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return faFileImage;
        if (['pdf'].includes(ext || '')) return faFilePdf;
        return faFileAlt;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast logic would go here
    };

    const progress = Math.min((storageUsed / storageLimit) * 100, 100);
    const progressColor = progress > 90 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-blue-600';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (user && user.role !== 'researcher' && user.role !== 'admin') {
        return <div className="p-8 text-center text-gray-500">Access Restricted.</div>;
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>

            {/* Overlay for Drag State */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="text-6xl text-blue-500 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Drop to Upload</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold mb-1">My Cloud Bucket</h1>
                        <p className="text-blue-100 text-sm mb-6">Secure storage for your research assets.</p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{formatSize(storageUsed)} used</span>
                                <span>{formatSize(storageLimit)} limit</span>
                            </div>
                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={`h-full bg-white/90 rounded-full`}
                                />
                            </div>
                        </div>
                    </div>
                    <FontAwesomeIcon icon={faHdd} className="absolute -bottom-6 -right-6 text-9xl text-white/10" />
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors group"
                >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {uploading ? <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" /> : <FontAwesomeIcon icon={faCloudUploadAlt} className="text-2xl" />}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Upload File</h3>
                    <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <FontAwesomeIcon icon={faThLarge} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                    >
                        <FontAwesomeIcon icon={faList} />
                    </button>
                </div>
            </div>

            {/* Files Display */}
            <AnimatePresence mode="wait">
                {filteredFiles.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-gray-400"
                    >
                        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-6xl mb-4 opacity-20" />
                        <p>No files found.</p>
                    </motion.div>
                ) : viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    >
                        {filteredFiles.map(file => {
                            const ext = file.filename.split('.').pop()?.toLowerCase() || '';
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                            const isPdf = ext === 'pdf';
                            const isPreviewable = isImage || isPdf;

                            return (
                                <div key={file.key} className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-blue-500 dark:hover:border-blue-500">
                                    <div className="aspect-square bg-gray-50 dark:bg-gray-950 relative flex items-center justify-center overflow-hidden">
                                        {isImage ? (
                                            <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                                        ) : (
                                            <FontAwesomeIcon icon={getFileIcon(file.filename)} className="text-4xl text-gray-300 dark:text-gray-700" />
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            {isPreviewable && (
                                                <button onClick={() => setPreviewImage(file.url)} className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm">
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            )}
                                            <a href={file.url} download className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm">
                                                <FontAwesomeIcon icon={faDownload} />
                                            </a>
                                            <button onClick={() => handleDelete(file.filename)} className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm">
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100" title={file.filename}>{file.filename}</p>
                                            <button onClick={() => copyToClipboard(file.url)} className="text-gray-400 hover:text-blue-500 text-xs">
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">{formatSize(file.size)} • {new Date(file.last_modified).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    >
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Size</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500">Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredFiles.map(file => (
                                    <tr key={file.key} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <FontAwesomeIcon icon={getFileIcon(file.filename)} className="text-gray-400" />
                                            <a href={file.url} target="_blank" rel="noreferrer" className="text-gray-900 dark:text-white hover:text-blue-600 hover:underline">
                                                {file.filename}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(file.last_modified).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => copyToClipboard(file.url)} className="p-2 text-gray-400 hover:text-blue-600">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                                <button onClick={() => handleDelete(file.filename)} className="p-2 text-gray-400 hover:text-red-600">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setPreviewImage(null)} className="absolute -top-12 right-0 text-white text-xl">
                                <FontAwesomeIcon icon={faTimes} /> Close
                            </button>
                            {previewImage.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={previewImage} className="w-full h-[80vh] bg-white rounded-lg" title="PDF Preview" />
                            ) : (
                                <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
