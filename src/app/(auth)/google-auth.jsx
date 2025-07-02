'use client'

import { useAuth } from "@/context/authContext";

export function GoogleAuth({ text }) {
    const { signInWithGoogle } = useAuth();

    const handleAuth = async () => {
        try {
            await signInWithGoogle();
            // Redirect ditangani oleh Supabase dan AuthContext
        } catch (error) {
            console.error("Google auth error:", error);
        }
    }

    return (
        <button
            onClick={handleAuth}
            className="flex gap-2 py-2 justify-center items-center rounded-full border border-neutral-300 bg-neutral-100 text-neutral-600 text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
        >
            <GoogleIcon /> {text} with Google
        </button>
    );
}

const GoogleIcon = () => {
    return (
        <svg viewBox="0 0 128 128" width={20} height={20}>
            <path fill="currentColor" d="M44.59 4.21a63.28 63.28 0 004.33 120.9 67.6 67.6 0 0032.36.35 57.13 57.13 0 0025.9-13.46 57.44 57.44 0 0016-26.26 74.33 74.33 0 001.61-33.58H65.27v24.69h34.47a29.72 29.72 0 01-12.66 19.52 36.16 36.16 0 01-13.93 5.5 41.29 41.29 0 01-15.1 0A37.16 37.16 0 0144 95.74a39.3 39.3 0 01-14.5-19.42 38.31 38.31 0 010-24.63 39.25 39.25 0 019.18-14.91A37.17 37.17 0 0176.13 27a34.28 34.28 0 0113.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.22 61.22 0 0087.2 4.59a64 64 0 00-42.61-.38z"></path>
        </svg>
    );
}