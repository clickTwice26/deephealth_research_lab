'use client';

import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function JobApplicantsPage() {
    const params = useParams();
    const jobId = params.jobId as string;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <header className="flex flex-col gap-4">
                <Link href="/dashboard/jobs" className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors w-fit">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Jobs
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faUsers} className="text-blue-600 dark:text-blue-400" />
                        Applicants
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Viewing applicants for Job ID: <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{jobId}</span>
                    </p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 border border-gray-200 dark:border-gray-800 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FontAwesomeIcon icon={faUsers} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Applicant Management</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    This feature is coming soon. You will be able to view, filter, and manage applications for this position directly here.
                </p>
            </div>
        </div>
    );
}
