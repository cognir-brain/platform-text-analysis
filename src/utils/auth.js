'use client'

import { useAuth } from "@/context/authContext";

export function useAuthCheck() {
    const { user, loading, isLoggedIn } = useAuth();
    return { user, loading, isLoggedIn };
}

// Untuk penggunaan di luar komponen React
export function checkAuth() {
    // This should only be used in server-side or middleware
    // For client-side, use useAuthCheck hook
    return false;
}
