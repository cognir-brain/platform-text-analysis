import { createClient } from "@supabase/supabase-js";

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