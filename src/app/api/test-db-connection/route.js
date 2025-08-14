import { supabaseAdmin } from '@/utils/supabase-admin';

export async function GET() {
    try {
        console.log('🔍 Testing database connection...');

        // Simple test - just get one record
        const { data, error } = await supabaseAdmin
            .from('ai_notes')
            .select('id, title')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error);
            return Response.json({
                success: false,
                error: error.message,
                details: 'Failed to connect to ai_notes table'
            }, { status: 500 });
        }

        console.log('✅ Database connection successful');

        return Response.json({
            success: true,
            message: 'Database connection successful',
            data: data
        });

    } catch (error) {
        console.error('❌ Test failed:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
