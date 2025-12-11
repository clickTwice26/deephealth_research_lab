const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

class ApiError extends Error {
    constructor(public status: number, public message: string, public data?: any) {
        super(message);
    }
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        headers,
    };

    // Handle form data content type (don't set application/json)
    if (options.body instanceof FormData) {
        // @ts-ignore
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Something went wrong' }));
        throw new ApiError(response.status, data.detail || response.statusText, data);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T>(endpoint: string, body: any, options?: FetchOptions) => {
        // If body is URLSearchParams (for OAuth2 form), don't stringify
        const finalBody = body instanceof URLSearchParams ? body : JSON.stringify(body);
        // If body is URLSearchParams, set correct content type
        const headers = options?.headers || {};
        if (body instanceof URLSearchParams) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        return request<T>(endpoint, { ...options, method: 'POST', body: finalBody, headers });
    },
    put: <T>(endpoint: string, body: any, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string, options?: FetchOptions) => request<T>(endpoint, { ...options, method: 'DELETE' }),

    // Notifications
    getNotifications: () => request<Notification[]>('/notifications/'),
    markNotificationRead: (id: string) => request<Notification>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllNotificationsRead: () => request<boolean>('/notifications/read-all', { method: 'PUT' }),

    // Search
    search: (query: string) => request<SearchResult[]>(`/search/?q=${encodeURIComponent(query)}`),
};

export interface SearchResult {
    id: string;
    label: string;
    type: string;
    category: string;
    href?: string;
    // Add missing properties expected by GlobalSearch
    icon?: any;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}
