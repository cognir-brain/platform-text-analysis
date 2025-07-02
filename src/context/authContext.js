'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const initialSignInComplete = useRef(false);
    const router = useRouter();

    // Computed property untuk isLoggedIn
    const isLoggedIn = !!user && !!session;

    useEffect(() => {
        // Periksa session dan setup auth listener
        const setupAuth = async () => {
            try {
                // Cek session yang ada
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                setUser(session?.user || null);
                setSession(session);

                if (session?.user) {
                    initialSignInComplete.current = true;
                    // Redirect ke analysis jika user sudah login dan berada di landing page
                    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/sign-in' || window.location.pathname === '/sign-up')) {
                        router.push('/analysis');
                    }
                }

                // Event listener untuk perubahan auth state
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    (event, session) => {
                        console.log('Auth event:', event);
                        setUser(session?.user || null);
                        setSession(session);

                        if (event === 'SIGNED_OUT') {
                            // Arahkan ke halaman login saat logout
                            initialSignInComplete.current = false;
                            router.push('/');
                        } else if (event === 'SIGNED_IN') {
                            // Hanya redirect saat login pertama, bukan saat refresh token
                            if (!initialSignInComplete.current) {
                                initialSignInComplete.current = true;
                                router.push('/analysis');
                            }
                        }
                    }
                );

                setLoading(false);

                return () => {
                    subscription?.unsubscribe();
                };
            } catch (error) {
                console.error("Error setting up auth:", error.message);
                setLoading(false);
            }
        };

        setupAuth();
    }, [router]);

    // Sign in dengan email dan password
    const signIn = async ({ email, password }) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Login error:", error.message);
            throw error;
        }
    };

    // Sign up dengan email dan password
    const signUp = async ({ email, password }) => {
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${origin}/api/callback`,
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Signup error:", error.message);
            throw error;
        }
    };

    // Sign in dengan Google
    const signInWithGoogle = async () => {
        try {
            // Gunakan URL dinamis berdasarkan lingkungan
            const redirectUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/api/callback`
                : process.env.NEXT_PUBLIC_SITE_URL
                    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/callback`
                    : 'https://cognirize-web.vercel.app/api/callback';

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Google sign-in error:", error.message);
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Router push akan ditangani oleh onAuthStateChange
        } catch (error) {
            console.error("Sign out error:", error.message);
            throw error;
        }
    };

    // Reset password
    const resetPassword = async (email) => {
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${origin}/api/callback?redirect_to=/reset-password`,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Password reset error:", error.message);
            throw error;
        }
    };

    // Update password
    const updatePassword = async (newPassword) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Password update error:", error.message);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isLoggedIn, // Tambahkan isLoggedIn ke context
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        session
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);