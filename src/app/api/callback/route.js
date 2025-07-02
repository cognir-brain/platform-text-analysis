import { supabase } from '@/utils/supabase';
import { redirect } from 'next/navigation';

export async function GET(request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const redirectTo = requestUrl.searchParams.get('redirect_to');

    if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Jika ada parameter redirect_to, arahkan ke sana
    if (redirectTo) {
        return redirect(redirectTo);
    }

    // Default redirect ke analysis
    return redirect('/analysis');
}