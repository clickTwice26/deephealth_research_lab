const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    role?: string;
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
    sendAdminNotification: (data: AdminNotificationSend) => request<{ success: boolean; message: string; count: number }>('/notifications/admin/send', { method: 'POST', body: JSON.stringify(data) }),

    search: (query: string) => request<SearchResult[]>(`/search/?q=${encodeURIComponent(query)}`),

    // User Management
    // User Management
    getUsers: () => request<User[]>('/users/'),
    updateUserRole: (userId: string, role: string) => request<User>(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    updateUserStatus: (userId: string, status: boolean) => request<User>(`/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    deleteUser: (userId: string) => request<any>(`/users/${userId}`, { method: 'DELETE' }),
    impersonateUser: (userId: string) => request<{ access_token: string }>(`/users/${userId}/impersonate`, { method: 'POST' }),
    sendUserEmail: (userId: string, subject: string, message: string) => request<any>(`/users/${userId}/email`, { method: 'POST', body: JSON.stringify({ subject, message }) }),

    // Live Users
    sendHeartbeat: () => request<any>('/users/heartbeat', { method: 'POST' }),
    getLiveUsers: () => request<{ id: string; name: string; email: string; role: string; last_active: string; status: 'online' | 'offline' }[]>('/users/live'),

    // News
    getNews: (page = 1, size = 10, search = '') => request<NewsPagination>(`/news/?page=${page}&size=${size}&search=${search}`),
    createNews: (news: any) => request<News>('/news/', { method: 'POST', body: JSON.stringify(news) }),
    updateNews: (id: string, news: any) => request<News>(`/news/${id}`, { method: 'PUT', body: JSON.stringify(news) }),
    deleteNews: (id: string) => request<boolean>(`/news/${id}`, { method: 'DELETE' }),

    // Auth
    login: (credentials: LoginCredentials) => request<AuthResponse>('/auth/login/access-token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(credentials as any).toString() }),
    sendOTP: (email: string) => request<{ message: string }>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    signup: (data: RegisterData & { otp: string }) => request<User>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    loginGoogle: (token: string) => request<AuthResponse>(`/auth/login/google?token=${token}`, { method: 'POST' }),

    // Publications
    getPublications: (page = 1, size = 10, search = '') => request<PublicationPagination>(`/publications/?page=${page}&size=${size}&search=${search}`),
    createPublication: (pub: any) => request<Publication>('/publications/', { method: 'POST', body: JSON.stringify(pub) }),
    updatePublication: (id: string, pub: any) => request<Publication>(`/publications/${id}`, { method: 'PUT', body: JSON.stringify(pub) }),
    deletePublication: (id: string) => request<boolean>(`/publications/${id}`, { method: 'DELETE' }),

    // Jobs
    getJobs: (page = 1, size = 10, search = '', activeOnly = false) => request<JobPagination>(`/jobs/?page=${page}&size=${size}&search=${search}&active_only=${activeOnly}`),
    createJob: (job: any) => request<Job>('/jobs/', { method: 'POST', body: JSON.stringify(job) }),
    updateJob: (id: string, job: any) => request<Job>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(job) }),
    deleteJob: (id: string) => request<boolean>(`/jobs/${id}`, { method: 'DELETE' }),

    // Community
    getCommunityPosts: (page = 1, size = 10, sort = 'latest', filter = 'all') => request<CommunityPostPagination>(`/community/?page=${page}&size=${size}&sort=${sort}&filter=${filter}`),
    getCommunityPost: (id: string) => request<CommunityPost>(`/community/${id}`),
    createCommunityPost: (content: string) => request<CommunityPost>('/community/', { method: 'POST', body: JSON.stringify({ content }) }),
    likePost: (id: string) => request<CommunityPost>(`/community/${id}/like`, { method: 'POST' }),
    dislikePost: (id: string) => request<CommunityPost>(`/community/${id}/dislike`, { method: 'POST' }),
    commentPost: (id: string, content: string, parent_id?: string) => request<CommunityPost>(`/community/${id}/comment`, { method: 'POST', body: JSON.stringify({ content, parent_id }) }),
    // Research Groups
    researchGroups: {
        list: () => request<ResearchGroup[]>('/research-groups/'),
        get: (id: string) => request<ResearchGroup>(`/research-groups/${id}`),
        create: (data: Partial<ResearchGroup>) => request<ResearchGroup>('/research-groups/', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: Partial<ResearchGroup>) => request<ResearchGroup>(`/research-groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        invite: (groupId: string, email: string) => request<Invitation>(`/research-groups/${groupId}/invite?email=${encodeURIComponent(email)}`, { method: 'POST' }),
        join: (token: string) => request<ResearchGroup>(`/research-groups/join/${token}`, { method: 'POST' }),
        getMessages: (groupId: string) => request<ChatMessage[]>(`/research-groups/${groupId}/messages`),
        updateMemberRole: (groupId: string, userId: string, role: string) => request<ResearchGroup>(`/research-groups/${groupId}/members/${userId}/role?role=${role}`, { method: 'PUT' }),
        removeMember: (groupId: string, userId: string) => request<ResearchGroup>(`/research-groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
        markRead: (groupId: string) => request<{ success: boolean }>(`/research-groups/${groupId}/read`, { method: 'POST' }),
        getUnreadCount: () => request<{ count: number }>('/research-groups/my/unread-count'),
    },

    // Blog
    getBlogPosts: (page = 1, size = 10, category?: string, tag?: string, search?: string) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        if (category) params.append('category', category);
        if (tag) params.append('tag', tag);
        if (search) params.append('search', search);
        return request<BlogPost[]>(`/blog/?${params.toString()}`);
    },
    getMyBlogPosts: (page = 1, size = 10) => {
        const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
        return request<BlogPost[]>(`/blog/my/posts?${params.toString()}`);
    },
    getBlogPost: (slug: string) => request<BlogPost>(`/blog/${slug}`),
    createBlogPost: (data: Partial<BlogPost>) => request<BlogPost>('/blog/', { method: 'POST', body: JSON.stringify(data) }),
    updateBlogPost: (slug: string, data: Partial<BlogPost>) => request<BlogPost>(`/blog/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBlogPost: (slug: string) => request<{ status: string; message: string }>(`/blog/${slug}`, { method: 'DELETE' }),
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return request<{ url: string }>('/upload/', {
            method: 'POST',
            body: formData,
        });
    },
};

export interface GroupMember {
    user_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    name: string;
    avatar_url?: string;
}

export interface ResearchGroup {
    _id: string;
    name: string;
    topic: string;
    description?: string;
    image_url?: string;
    created_by: string;
    created_at: string;
    members: GroupMember[];
}

export interface Invitation {
    _id: string;
    group_id: string;
    sender_id: string;
    email: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    token: string;
}

export interface ChatMessage {
    _id: string;
    group_id: string;
    user_id: string;
    user_name: string;
    content: string;
    timestamp: string;
}

export interface Comment {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    created_at: string;
    parent_id?: string;
}

export interface CommunityPost {
    _id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_email: string;
    created_at: string;
    likes: string[];
    dislikes: string[];
    comments?: Comment[];
    comments_count: number;
}

export interface CommunityPostPagination {
    items: CommunityPost[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface JobPagination {
    items: Job[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface PublicationPagination {
    items: Publication[];
    total: number;
    page: number;
    size: number;
    pages: number;
}
export interface NewsPagination {
    items: News[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export interface News {
    _id: string;
    title: string;
    description: string;
    date: string;
    is_published: boolean;
    cta_text?: string;
    cta_link?: string;
}

export interface Publication {
    _id: string;
    title: string;
    authors: string;
    journal: string;
    date: string;
    doi: string;
    url?: string;
    tags: string[];
    is_featured: boolean;
}

export interface Job {
    _id: string;
    title: string;
    type: string;
    level: string;
    location: string;
    department: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    skills: string[];
    application_link?: string;
    is_active: boolean;
    created_at: string;
    posted_date: string;
    deadline?: string;
}

export interface User {
    id: string;
    _id?: string; // Backend often returns _id for Mongo
    email: string;
    full_name?: string;
    role: 'admin' | 'researcher' | 'member' | 'user';
    is_active: boolean;
    access_weight?: number;
    id_?: string; // alias if needed
}

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
    action_label?: string;
    action_url?: string;
}

export interface AdminNotificationSend {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    target_type: 'all' | 'role' | 'group' | 'user';
    target_id?: string;
    action_label?: string;
    action_url?: string;
    channels: ('in-app' | 'email')[];
}

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    cover_image?: string;
    author_id: string;
    tags: string[];
    category: string;
    is_published: boolean;
    published_at?: string;
    views: number;
    created_at: string;
    updated_at: string;
    author_name?: string;
    author_avatar?: string;
}
