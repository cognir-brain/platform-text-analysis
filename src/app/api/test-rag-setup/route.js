// Test environment variables
console.log('Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ SET' : '❌ MISSING');
console.log('NEXT_PUBLIC_GEMINI_API_KEY:', process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✅ SET' : '❌ MISSING');

// Test Supabase connection
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function GET() {
    try {
        // Test basic connection
        const { data, error } = await supabaseAdmin
            .from('ai_notes')
            .select('id, title')
            .limit(1);

        if (error) {
            throw error;
        }

        // Test vector extension
        const { data: vectorTest, error: vectorError } = await supabaseAdmin
            .rpc('search_similar_chunks', {
                query_embedding: new Array(768).fill(0),
                similarity_threshold: 0.5,
                match_count: 1
            });

        return Response.json({
            success: true,
            message: 'All systems operational',
            tests: {
                supabase_connection: !error,
                vector_function: !vectorError,
                environment_vars: {
                    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
                    gemini_key: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
                }
            }
        });
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            tests: {
                supabase_connection: false,
                vector_function: false,
                environment_vars: {
                    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
                    gemini_key: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
                }
            }
        }, { status: 500 });
    }
}
