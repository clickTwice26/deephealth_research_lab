'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isImpersonating: boolean;
    login: (token: string, redirectUrl?: string) => Promise<void>;
    impersonate: (token: string) => Promise<void>;
    stopImpersonating: () => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const userData = await api.get<User>('/users/me');
            if (!userData.id && userData._id) {
                userData.id = userData._id;
            }
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user', error);
            // If fetching user fails while impersonating, revert
            const adminToken = localStorage.getItem('admin_token');
            if (adminToken) {
                stopImpersonating();
            } else {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('admin_token');
        setIsImpersonating(!!adminToken);

        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (token: string, redirectUrl?: string) => {
        localStorage.setItem('token', token);
        await fetchUser();
        router.push(redirectUrl || '/dashboard');
    };

    const impersonate = async (token: string) => {
        setIsLoading(true);
        // Prevent stale state access: Clear user immediately
        setUser(null);

        const currentToken = localStorage.getItem('token');
        const existingAdminToken = localStorage.getItem('admin_token');

        if (currentToken && !existingAdminToken) {
            localStorage.setItem('admin_token', currentToken);
        }
        localStorage.setItem('token', token);
        setIsImpersonating(true);
        await fetchUser();
        router.push('/dashboard');
    };

    const stopImpersonating = async () => {
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
            setIsLoading(true);
            // Prevent stale state: clear user immediately
            setUser(null);
            localStorage.setItem('token', adminToken);
            localStorage.removeItem('admin_token');
            setIsImpersonating(false);

            try {
                await fetchUser(); // Reload admin user
            } catch (error) {
                console.error("Failed to restore admin user", error);
            }

            router.refresh();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        setIsImpersonating(false);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, fetchUser, isImpersonating, impersonate, stopImpersonating }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
