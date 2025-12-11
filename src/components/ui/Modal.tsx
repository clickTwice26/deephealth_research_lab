'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    type?: 'default' | 'success' | 'error' | 'warning';
}

export default function Modal({ isOpen, onClose, title, children, type = 'default' }: ModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
        return () => {
            window.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />;
            case 'error': return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-xl" />;
            case 'warning': return <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-500 text-xl" />;
            default: return <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 text-xl" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    {type !== 'default' && getIcon()}
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                        {title || 'Notification'}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full p-2 w-8 h-8 flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 text-gray-600 dark:text-gray-300">
                                {children}
                            </div>

                            {/* Footer (Optional simple close button if implied) */}
                            {/* <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
                                <button onClick={onClose} className="...">Close</button>
                            </div> */}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
