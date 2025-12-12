'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronLeft, faChevronRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface PaginationData<T> {
    items: T[];
    total: number;
    pages: number;
    page: number;
    size: number;
}

interface Props<T> {
    title: string;
    icon: IconDefinition;
    fetchData: (page: number, size: number, search: string) => Promise<PaginationData<T>>;
    renderItem: (item: T) => React.ReactNode;
    initialSize?: number;
    color?: string;
}

export default function PaginatedResourceSection<T>({
    title,
    icon,
    fetchData,
    renderItem,
    initialSize = 5,
    color = "text-blue-600"
}: Props<T>) {
    const [data, setData] = useState<PaginationData<T> | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchData(page, initialSize, debouncedSearch);
            setData(result);
        } catch (error) {
            console.error(`Failed to fetch ${title}`, error);
        } finally {
            setLoading(false);
        }
    }, [fetchData, page, initialSize, debouncedSearch, title]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${color}`}>
                        <FontAwesomeIcon icon={icon} className="text-xl" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                </div>

                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder={`Search ${title.toLowerCase()}...`}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                </div>
            </div>

            {loading && !data ? (
                <div className="flex-grow flex items-center justify-center min-h-[200px]">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-blue-500" />
                </div>
            ) : (
                <>
                    <div className="space-y-4 flex-grow">
                        {data?.items.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
                                No {title.toLowerCase()} found.
                            </p>
                        ) : (
                            data?.items.map((item, i) => (
                                <div key={i}>{renderItem(item)}</div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {data && data.pages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" /> Previous
                            </button>

                            <span className="text-xs text-gray-500 font-medium">
                                Page {page} of {data.pages}
                            </span>

                            <button
                                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                                disabled={page === data.pages}
                                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                            >
                                Next <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
