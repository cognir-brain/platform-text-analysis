import { supabase } from '@/utils/supabase';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const USE_SUPABASE_BACKEND = process.env.NEXT_PUBLIC_USE_SUPABASE_BACKEND === 'true';

class NotesService {
    async getAuthHeaders() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('No authentication token found');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        };
    }

    async getCurrentUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user;
    }

    async isBackendHealthy() {
        if (USE_SUPABASE_BACKEND) return false;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${BACKEND_URL}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('Backend health check failed:', error.message);
            return false;
        }
    }

    // YouTube Processing - Dual backend support
    async processYouTube(url) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.processYouTubeSupabase(url);
        }
        return this.processYouTubeGoBackend(url);
    }

    async processYouTubeGoBackend(url) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/youtube/process`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`Failed to process YouTube: ${response.statusText}`);
        }

        return response.json();
    }

    async processYouTubeSupabase(url) {
        // Use actual YouTube API instead of test endpoint
        const response = await fetch('/api/youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`Failed to process YouTube: ${response.statusText}`);
        }

        const result = await response.json();

        // Ensure consistent response format
        if (result.success) {
            return result;
        } else {
            return {
                success: true,
                data: result
            };
        }
    }

    // File Upload - Dual backend support
    async uploadFile(file) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.uploadFileSupabase(file);
        }
        return this.uploadFileGoBackend(file);
    }

    async uploadFileGoBackend(file) {
        const formData = new FormData();
        formData.append('file', file);

        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${BACKEND_URL}/api/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session?.access_token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        return response.json();
    }

    async uploadFileSupabase(file) {
        // Fallback to local Next.js API with Supabase
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'notes');

        const response = await fetch('/api/upload-pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        const result = await response.json();
        return {
            success: true,
            data: result.data
        };
    }

    // Create Notes - Dual backend support
    async createNote(noteData) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.createNoteSupabase(noteData);
        }
        return this.createNoteGoBackend(noteData);
    }

    async createNoteGoBackend(noteData) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            throw new Error(`Failed to create note: ${response.statusText}`);
        }

        return response.json();
    }

    async createNoteSupabase(noteData) {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('ai_notes')
            .insert([{
                user_id: user.id,
                title: noteData.title || 'Untitled Note',
                content: noteData.content,
                language: noteData.language || 'indonesian',
                source_type: noteData.source_type || 'text',
                source_url: noteData.metadata?.url || null,
                video_id: noteData.metadata?.video_id || null,
                file_metadata: noteData.metadata || {},
                ai_generated_data: {}, // Will be populated after AI processing
                tags: noteData.tags || [],
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create note: ${error.message}`);
        }

        // Generate AI content using local API
        try {
            console.log('🔄 Sending to AI API:', {
                textLength: noteData.content?.length,
                language: noteData.language,
                sourceType: noteData.source_type,
                hasVideoMetadata: !!noteData.metadata?.type === 'youtube',
                hasFileMetadata: !!noteData.metadata?.type === 'file'
            });

            const aiResponse = await fetch('/api/notes/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: noteData.content,
                    language: noteData.language,
                    sourceType: noteData.source_type,
                    videoMetadata: noteData.metadata?.type === 'youtube' ? noteData.metadata : null,
                    fileMetadata: noteData.metadata?.type === 'file' ? noteData.metadata : null
                })
            });

            if (aiResponse.ok) {
                const aiResult = await aiResponse.json();

                console.log('✅ AI API Response received:', {
                    success: aiResult.success,
                    hasNotes: !!aiResult.notes,
                    title: aiResult.notes?.title,
                    summaryLength: aiResult.notes?.summary?.length,
                    keyPointsCount: aiResult.notes?.keyPoints?.length
                });

                // Update note with AI-generated content
                const updateResult = await supabase
                    .from('ai_notes')
                    .update({
                        ai_generated_data: aiResult.notes,
                        title: aiResult.notes.title || data.title
                    })
                    .eq('id', data.id);

                console.log('📝 Database update result:', updateResult.error ? updateResult.error : 'Success');
            } else {
                console.error('❌ AI API Error:', aiResponse.status, aiResponse.statusText);
            }
        } catch (aiError) {
            console.error('AI generation failed:', aiError);
            // Note is still created, just without AI enhancement
        }

        return {
            success: true,
            data: {
                id: data.id,
                title: data.title,
                created_at: data.created_at
            }
        };
    }

    // Get Notes - Dual backend support
    async getNotes(page = 1, limit = 10) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.getNotesSupabase(page, limit);
        }
        return this.getNotesGoBackend(page, limit);
    }

    async getNotesGoBackend(page, limit) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes?page=${page}&limit=${limit}`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Failed to get notes: ${response.statusText}`);
        }

        return response.json();
    }

    async getNotesSupabase(page, limit) {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from('ai_notes')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Failed to get notes: ${error.message}`);
        }

        return {
            success: true,
            data: {
                notes: data || [],
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    total_pages: Math.ceil((count || 0) / limit)
                }
            }
        };
    }

    // Get Single Note - Dual backend support
    async getNote(id) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.getNoteSupabase(id);
        }
        return this.getNoteGoBackend(id);
    }

    async getNoteGoBackend(id) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes/${id}`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Failed to get note: ${response.statusText}`);
        }

        return response.json();
    }

    async getNoteSupabase(id) {
        const user = await this.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('ai_notes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            throw new Error(`Failed to get note: ${error.message}`);
        }

        return {
            success: true,
            data: data
        };
    }

    // Chat with Note
    async chatWithNote(noteId, message) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.chatWithNoteSupabase(noteId, message);
        }
        return this.chatWithNoteGoBackend(noteId, message);
    }

    async chatWithNoteGoBackend(noteId, message) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes/${noteId}/chatbot`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Failed to chat: ${response.statusText}`);
        }

        return response.json();
    }

    async chatWithNoteSupabase(noteId, message) {
        // Get note content first
        const noteResult = await this.getNoteSupabase(noteId);
        if (!noteResult.success) {
            throw new Error('Note not found');
        }

        const note = noteResult.data;

        // Use local chat API
        const response = await fetch('/api/notes/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                noteContent: note.content,
                aiData: note.ai_generated_data,
                message: message,
                language: note.language
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to chat: ${response.statusText}`);
        }

        return response.json();
    }

    // Generate Flashcards
    async generateFlashcards(noteId) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.generateFlashcardsSupabase(noteId);
        }
        return this.generateFlashcardsGoBackend(noteId);
    }

    async generateFlashcardsGoBackend(noteId) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes/${noteId}/flashcards`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error(`Failed to generate flashcards: ${response.statusText}`);
        }

        return response.json();
    }

    async generateFlashcardsSupabase(noteId) {
        const noteResult = await this.getNoteSupabase(noteId);
        if (!noteResult.success) {
            throw new Error('Note not found');
        }

        const note = noteResult.data;

        const response = await fetch('/api/notes/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                noteContent: note.content,
                aiData: note.ai_generated_data,
                language: note.language
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate flashcards: ${response.statusText}`);
        }

        return response.json();
    }

    // Generate Quiz
    async generateQuiz(noteId) {
        if (USE_SUPABASE_BACKEND || !(await this.isBackendHealthy())) {
            return this.generateQuizSupabase(noteId);
        }
        return this.generateQuizGoBackend(noteId);
    }

    async generateQuizGoBackend(noteId) {
        const headers = await this.getAuthHeaders();
        const response = await fetch(`${BACKEND_URL}/api/notes/${noteId}/quiz`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error(`Failed to generate quiz: ${response.statusText}`);
        }

        return response.json();
    }

    async generateQuizSupabase(noteId) {
        const noteResult = await this.getNoteSupabase(noteId);
        if (!noteResult.success) {
            throw new Error('Note not found');
        }

        const note = noteResult.data;

        const response = await fetch('/api/notes/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                noteContent: note.content,
                aiData: note.ai_generated_data,
                language: note.language
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to generate quiz: ${response.statusText}`);
        }

        return response.json();
    }
}

export const notesService = new NotesService();