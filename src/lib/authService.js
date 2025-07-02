'use client'

import { encodedRedirect } from "@/utils/encode";
import { supabase } from "@/utils/supabase";
import { redirect } from "next/navigation";

export const signUpAction = async (formData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (!email || !password) {
        return encodedRedirect(
            "error",
            "/sign-up",
            "Email and password are required",
        );
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/api/callback`,
        },
    });

    if (error) {
        console.error(error.code + " " + error.message);
        return encodedRedirect("error", "/sign-up", error.message);
    } else {
        return encodedRedirect(
            "success",
            "/sign-up",
            "Thanks for signing up! Please check your email for a verification link.",
        );
    }
};

export const signInAction = async (formData) => {
    const email = formData.get("email");
    const password = formData.get("password");

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return encodedRedirect("error", "/sign-in", error.message);
    }

    return redirect("/analysis");
};

export const forgotPasswordAction = async (formData) => {
    const email = formData.get("email")?.toString();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    if (!email) {
        return { success: false, error: 'Email is required' };
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/api/callback?redirect_to=/reset-password`, // Path sudah benar
        });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
};

export const resetPasswordAction = async (formData) => {
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!password || !confirmPassword) {
        encodedRedirect(
            "error",
            "/reset-password",
            "Password and confirm password are required",
        );
    }

    if (password !== confirmPassword) {
        encodedRedirect(
            "error",
            "/reset-password",
            "Passwords do not match",
        );
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        encodedRedirect(
            "error",
            "/reset-password",
            "Password update failed",
        );
    }

    encodedRedirect("success", "/reset-password", "Password updated");
};

export const signInWithGoogle = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/api/callback`,
        }
    });

    if (error) {
        console.error('Google OAuth error:', error);
        return encodedRedirect(
            "error",
            "/sign-in",
            "Failed to sign in with Google"
        );
    }

    return redirect(data.url);
};

export const signOutAction = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Error signing out:', error);
    }

    if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
        return new Promise(resolve => setTimeout(resolve, 100));
    }

    return redirect("/sign-in");
};