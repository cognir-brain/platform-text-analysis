import { createClient } from "@supabase/supabase-js";

// Validate environment variables (server-side only)
if (typeof window === 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for Supabase admin client');
    }

    if (!process.env.SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_KEY is required for Supabase admin client');
    }
}

// Admin client dengan service key untuk server operations
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);