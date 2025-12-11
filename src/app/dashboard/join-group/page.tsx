'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function JoinGroupPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('No invitation token provided');
            return;
        }

        const join = async () => {
            try {
                const group = await api.researchGroups.join(token);
                setStatus('success');
                // Redirect after brief delay
                setTimeout(() => {
                    router.push(`/dashboard/research-groups/${group._id}`);
                }, 2000);
            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'Failed to join group');
            }
        };

        join();
    }, [token, router]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center">
                {status === 'loading' && (
                    <>
                        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Joining Group...</h2>
                        <p className="text-gray-500">Verifying your invitation</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Successfully Joined!</h2>
                        <p className="text-gray-500">Redirecting to group workspace...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Join</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/dashboard/research-groups')}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-medium hover:bg-gray-200"
                        >
                            Return to Research Groups
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
