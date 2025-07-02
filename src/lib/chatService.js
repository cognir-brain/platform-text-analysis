import { supabase } from '@/utils/supabase'; // Use existing client
import { useRouter } from "next/navigation";

export const saveChat = async (chatData) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Authentication required' };
        }

        // Preprocessing response untuk extract dominant sentiment
        let response = chatData.response;
        let metadata = chatData.metadata || {};

        // Process response jika berbentuk object untuk extract metadata penting
        if (typeof response === 'object' && response !== null) {
            // Extract dominant sentiment dari data analisis
            const sentimentData = response['Sentiment Analysis'];
            if (sentimentData) {
                const dominantSentiment = Object.entries(sentimentData)
                    .filter(([key]) => ['positive', 'negative', 'neutral'].includes(key))
                    .sort(([, a], [, b]) => b - a)[0] || ['neutral', 0];

                const [sentimentType, sentimentValue] = dominantSentiment;

                // Tambahkan sentiment ke metadata untuk memudahkan filtering
                metadata = {
                    ...metadata,
                    sentiment: sentimentType,
                    sentimentValue: sentimentValue
                };
            }

            // Tambahkan field sederhana untuk summary jika belum ada
            if (response['Summary Generation'] && !response.summary) {
                response = {
                    ...response,
                    summary: response['Summary Generation']
                };
            }
        }

        // Memastikan metadata memiliki field 'bookmarked' dengan default false
        if (!metadata.hasOwnProperty('bookmarked')) {
            metadata.bookmarked = false;
        }

        const { data, error } = await supabase
            .from('chat_history')
            .insert([
                {
                    user_id: user.id,
                    question: chatData.question,
                    response: response,
                    metadata: metadata,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving chat:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error in saveChat:', error);
        return { success: false, error: error.message };
    }
};

export const getChatHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "User not authenticated"
        };
    }

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('id, created_at, question, response')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data || [],
            message: "Chat history retrieved"
        };
    } catch (error) {
        console.error('Error fetching chat history:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getChatById = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "User not authenticated"
        };
    }

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) throw error;

        return {
            success: true,
            data,
            message: "Chat retrieved"
        };
    } catch (error) {
        console.error('Error fetching chat:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

export const deleteChat = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "User not authenticated"
        };
    }

    try {
        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return {
            success: true,
            message: "Chat deleted successfully"
        };
    } catch (error) {
        console.error('Error deleting chat:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Fungsi untuk menggunakan chat_history sebagai analysis history
// Ini menyatukan data untuk konsistensi
export const getAnalysisHistory = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        // Menggunakan chat_history sebagai source utama
        // Pastikan metadata juga diambil
        const { data, error } = await supabase
            .from('chat_history')
            .select('id, created_at, question, response, user_id, metadata')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const deleteAnalysis = async (analysisId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        // Menggunakan chat_history untuk konsistensi
        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('id', analysisId)
            .eq('user_id', user.id);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting analysis:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Utility untuk mendapatkan analysis by ID (sama seperti getChatById)
export const getAnalysisById = async (id) => {
    return await getChatById(id);
};

export const useChatNavigation = () => {
    const router = useRouter();

    return {
        navigateToHistory: () => router.push('/history'),
        navigateToChat: (id) => router.push(`/history/${id}`),
        navigateToNewChat: () => router.push('/analysis')
    }
}

export const updateChat = async ({ id, question, response }) => {
    console.log('updateChat called with:', { id, question: question?.substring(0, 50), response: typeof response });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "User not authenticated"
        };
    }

    // Validate ID
    if (!id) {
        console.error('updateChat: ID is missing or undefined');
        return {
            success: false,
            error: "Chat ID is required"
        };
    }

    // Check if ID is valid format (UUID or integer)
    const isValidId = typeof id === 'string' || typeof id === 'number';
    if (!isValidId) {
        console.error('updateChat: Invalid ID format:', typeof id, id);
        return {
            success: false,
            error: "Invalid chat ID format"
        };
    }

    try {
        const { data, error } = await supabase
            .from('chat_history')
            .update({
                question,
                response: typeof response === 'string' ? JSON.parse(response) : response,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Chat updated successfully:', data?.id);
        return {
            success: true,
            data,
            message: "Chat updated successfully"
        };
    } catch (error) {
        console.error('Error updating chat:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

export const toggleBookmark = async (analysisId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        // Dapatkan data chat terlebih dahulu
        const { data: chatData, error: fetchError } = await supabase
            .from('chat_history')
            .select('metadata')
            .eq('id', analysisId)
            .eq('user_id', user.id)
            .single();

        if (fetchError) throw fetchError;

        // Update metadata dengan status bookmark
        const updatedMetadata = {
            ...chatData.metadata,
            bookmarked: chatData.metadata?.bookmarked ? false : true
        };

        // Simpan perubahan
        const { data, error } = await supabase
            .from('chat_history')
            .update({ metadata: updatedMetadata })
            .eq('id', analysisId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            data,
            bookmarked: updatedMetadata.bookmarked
        };
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const getBookmarkedAnalyses = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        // Filter chat history berdasarkan metadata.bookmarked = true
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .filter('metadata->bookmarked', 'eq', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Error fetching bookmarked analyses:', error);
        return {
            success: false,
            error: error.message
        };
    }
};