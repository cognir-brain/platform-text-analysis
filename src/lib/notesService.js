import { supabase } from '@/utils/supabase';
import { RAGChatService } from './ragChatService';

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

    // Helper method untuk membuat user di Go backend jika belum ada
    async ensureUserExistsInGoBackend() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        try {
            const headers = await this.getAuthHeaders();

            // Check if user exists
            const checkResponse = await fetch(`${BACKEND_URL}/api/users/${user.id}`, {
                headers
            });

            if (checkResponse.ok) {
                return user; // User already exists
            }

            // Create user if not exists
            const createResponse = await fetch(`${BACKEND_URL}/api/users`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    google_id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url || null
                })
            });

            if (createResponse.ok) {
                return user;
            }
        } catch (error) {
            console.warn('Failed to ensure user in Go backend:', error);
        }

        return user;
    }

    // YouTube Processing - Dual backend support
    async processYouTube(url) {
        if (USE_SUPABASE_BACKEND) {
            return this.processYouTubeSupabase(url);
        }
        return this.processYouTubeGoBackend(url);
    }

    async processYouTubeGoBackend(url) {
        await this.ensureUserExistsInGoBackend();
        const headers = await this.getAuthHeaders();
        const user = await this.getCurrentUser();

        // First create a resource for the YouTube URL
        const resourceResponse = await fetch(`${BACKEND_URL}/api/resources`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: user.id,
                type: "youtube",
                source_url: url,
                original_title: "YouTube Video",
                status: "active"
            })
        });

        if (!resourceResponse.ok) {
            throw new Error(`Failed to create resource: ${resourceResponse.statusText}`);
        }

        const resourceResult = await resourceResponse.json();

        // Then create a note for the resource
        const noteResponse = await fetch(`${BACKEND_URL}/api/notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                resource_id: resourceResult.id,
                user_id: user.id,
                title: `YouTube Video Note - ${new Date().toLocaleDateString()}`,
                summary: "Generated from YouTube video",
                full_text: `YouTube video content from: ${url}`
            })
        });

        if (!noteResponse.ok) {
            throw new Error(`Failed to create note: ${noteResponse.statusText}`);
        }

        return noteResponse.json();
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
        if (USE_SUPABASE_BACKEND) {
            return this.uploadFileSupabase(file);
        }
        return this.uploadFileGoBackend(file);
    }

    async uploadFileGoBackend(file) {
        await this.ensureUserExistsInGoBackend();
        const headers = await this.getAuthHeaders();
        const user = await this.getCurrentUser();

        // First create a resource for the uploaded file
        const resourceResponse = await fetch(`${BACKEND_URL}/api/resources`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id: user.id,
                type: "file",
                source_url: `uploaded-${file.name}`,
                original_title: file.name,
                status: "active"
            })
        });

        if (!resourceResponse.ok) {
            throw new Error(`Failed to create resource: ${resourceResponse.statusText}`);
        }

        const resourceResult = await resourceResponse.json();

        // Create a note for the uploaded file
        const noteResponse = await fetch(`${BACKEND_URL}/api/notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                resource_id: resourceResult.id,
                user_id: user.id,
                title: `File Upload - ${file.name}`,
                summary: "Generated from uploaded file",
                full_text: `Content from uploaded file: ${file.name}`
            })
        });

        if (!noteResponse.ok) {
            throw new Error(`Failed to create note: ${noteResponse.statusText}`);
        }

        return noteResponse.json();
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
        if (USE_SUPABASE_BACKEND) {
            return this.createNoteSupabase(noteData);
        }
        return this.createNoteGoBackend(noteData);
    }

    async createNoteGoBackend(noteData) {
        await this.ensureUserExistsInGoBackend();
        const headers = await this.getAuthHeaders();
        const user = await this.getCurrentUser();

        // First create a resource if needed
        let resourceId = noteData.resource_id;

        if (!resourceId && (noteData.source_url || noteData.source_type)) {
            const resourceResponse = await fetch(`${BACKEND_URL}/api/resources`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    user_id: user.id,
                    type: noteData.source_type || "text",
                    source_url: noteData.source_url || "manual-input",
                    original_title: noteData.title || "Manual Note",
                    status: "active"
                })
            });

            if (resourceResponse.ok) {
                const resourceResult = await resourceResponse.json();
                resourceId = resourceResult.id;
            }
        }

        // Create the note
        const notePayload = {
            user_id: user.id,
            title: noteData.title || 'Untitled Note',
            summary: noteData.summary || 'Manual note entry',
            full_text: noteData.content || noteData.full_text || ''
        };

        if (resourceId) {
            notePayload.resource_id = resourceId;
        }

        const response = await fetch(`${BACKEND_URL}/api/notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(notePayload)
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
        if (USE_SUPABASE_BACKEND) {
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
        if (USE_SUPABASE_BACKEND) {
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
        if (USE_SUPABASE_BACKEND) {
            return this.chatWithNoteSupabase(noteId, message);
        }
        return this.chatWithNoteGoBackend(noteId, message);
    }

    async chatWithNoteGoBackend(noteId, message) {
        const headers = await this.getAuthHeaders();

        // Backend doesn't have chatbot endpoint, so we need to get note first
        const noteResponse = await fetch(`${BACKEND_URL}/api/notes/${noteId}`, {
            headers
        });

        if (!noteResponse.ok) {
            throw new Error(`Failed to get note: ${noteResponse.statusText}`);
        }

        const noteData = await noteResponse.json();

        // Use a simple response format since backend doesn't have chat functionality
        return {
            success: true,
            data: {
                response: `I found your note titled "${noteData.title}". Here's the summary: ${noteData.summary}. You asked: "${message}". This is a basic response from the Go backend.`,
                note_id: noteId,
                timestamp: new Date().toISOString()
            }
        };
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
        if (USE_SUPABASE_BACKEND) {
            return this.generateFlashcardsSupabase(noteId);
        }
        return this.generateFlashcardsGoBackend(noteId);
    }

    async generateFlashcardsGoBackend(noteId) {
        const headers = await this.getAuthHeaders();

        // Get the note first
        const noteResponse = await fetch(`${BACKEND_URL}/api/notes/${noteId}`, {
            headers
        });

        if (!noteResponse.ok) {
            throw new Error(`Failed to get note: ${noteResponse.statusText}`);
        }

        const noteData = await noteResponse.json();

        // Create sample flashcards based on note content
        const sampleFlashcards = [
            {
                note_id: noteId,
                front_text: `Key concept from: ${noteData.title}`,
                back_text: noteData.summary || "Summary not available"
            },
            {
                note_id: noteId,
                front_text: "What is this note about?",
                back_text: noteData.title
            }
        ];

        // Create flashcards using the backend API
        const createdFlashcards = [];
        for (const flashcard of sampleFlashcards) {
            const response = await fetch(`${BACKEND_URL}/api/flashcards`, {
                method: 'POST',
                headers,
                body: JSON.stringify(flashcard)
            });

            if (response.ok) {
                const result = await response.json();
                createdFlashcards.push(result);
            }
        }

        return {
            success: true,
            data: {
                flashcards: createdFlashcards,
                note_id: noteId
            }
        };
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
        if (USE_SUPABASE_BACKEND) {
            return this.generateQuizSupabase(noteId);
        }
        return this.generateQuizGoBackend(noteId);
    }

    async generateQuizGoBackend(noteId) {
        const headers = await this.getAuthHeaders();

        // Get the note first
        const noteResponse = await fetch(`${BACKEND_URL}/api/notes/${noteId}`, {
            headers
        });

        if (!noteResponse.ok) {
            throw new Error(`Failed to get note: ${noteResponse.statusText}`);
        }

        const noteData = await noteResponse.json();

        // Create sample quiz based on note content
        const sampleQuiz = {
            note_id: noteId,
            question: `What is the main topic of "${noteData.title}"?`,
            options: JSON.stringify([
                noteData.title,
                "Random option 1",
                "Random option 2",
                "Random option 3"
            ]),
            correct_answer_index: 0,
            explanation: `This question is based on the note: ${noteData.summary || noteData.title}`
        };

        // Create quiz using the backend API
        const response = await fetch(`${BACKEND_URL}/api/quizzes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(sampleQuiz)
        });

        if (!response.ok) {
            throw new Error(`Failed to create quiz: ${response.statusText}`);
        }

        const result = await response.json();

        return {
            success: true,
            data: {
                quiz: result,
                note_id: noteId
            }
        };
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

    // ============ RAG CHAT METHODS ============

    // RAG Chat dengan note tertentu
    async ragChatWithNote(noteId, message, chatHistory = []) {
        try {
            // Ensure note is processed for RAG
            await RAGChatService.ensureNoteProcessedForRAG(noteId);

            // Generate RAG response
            const response = await RAGChatService.generateRAGResponse(
                message,
                noteId,
                chatHistory
            );

            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('RAG chat error:', error);
            throw error;
        }
    }

    // RAG Chat dengan multiple notes
    async ragChatWithMultipleNotes(noteIds, message, chatHistory = []) {
        try {
            // Ensure all notes are processed for RAG
            for (const noteId of noteIds) {
                await RAGChatService.ensureNoteProcessedForRAG(noteId);
            }

            const response = await RAGChatService.chatWithMultipleNotes(
                message,
                noteIds,
                chatHistory
            );

            return {
                success: true,
                data: response
            };
        } catch (error) {
            console.error('Multi-note RAG chat error:', error);
            throw error;
        }
    }

    // Process note untuk RAG
    async processNoteForRAG(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}/process-rag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to process note for RAG');
            }

            return response.json();
        } catch (error) {
            console.error('Error processing note for RAG:', error);
            throw error;
        }
    }

    // Get suggested questions untuk note
    async getSuggestedQuestions(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}/suggested-questions`);

            if (!response.ok) {
                throw new Error('Failed to get suggested questions');
            }

            return response.json();
        } catch (error) {
            console.error('Error getting suggested questions:', error);
            throw error;
        }
    }

    // Search across all notes
    async searchAcrossAllNotes(query) {
        try {
            const results = await RAGChatService.searchAcrossNotes(query);

            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('Error searching across notes:', error);
            throw error;
        }
    }

    // Get RAG status untuk note
    async getRAGStatus(noteId) {
        try {
            const result = await this.getNote(noteId);
            if (!result.success) {
                throw new Error('Note not found');
            }

            return {
                success: true,
                rag_processed: result.data.rag_processed || false,
                rag_processed_at: result.data.rag_processed_at || null
            };
        } catch (error) {
            console.error('Error getting RAG status:', error);
            throw error;
        }
    }
}

export const notesService = new NotesService();