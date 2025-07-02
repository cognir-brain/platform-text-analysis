'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/authContext';

export function AuthRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return; // Wait for auth to load

        const publicPaths = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
        const isPublicPath = publicPaths.includes(pathname);

        if (user && isPublicPath) {
            // User is logged in but on public page, redirect to analysis
            router.push('/analysis');
        } else if (!user && !isPublicPath) {
            // User is not logged in but on protected page, redirect to sign-in
            router.push('/sign-in');
        }
    }, [user, loading, pathname, router]);

    return null; // This component doesn't render anything
}
