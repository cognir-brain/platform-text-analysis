// Only import VectorService for server-side usage
// Client-side akan menggunakan API calls

export class RAGChatService {
    /**
     * Generate response menggunakan RAG
     */
    static async generateRAGResponse(query, noteId = null, chatHistory = []) {
        // Server-side only function
        if (typeof window !== 'undefined') {
            // Client-side: use API call instead
            const response = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, noteId, chatHistory })
            });

            if (!response.ok) {
                throw new Error('Failed to generate RAG response');
            }

            return await response.json();
        }

        // Server-side: use VectorService directly
        const { VectorService } = await import('./vectorService');

        try {
            // 1. Get relevant context from vector search
            console.log('Getting RAG context for query:', query);
            const ragContext = await VectorService.getRAGContext(query, noteId, 3);

            // 2. Build context from similar chunks
            const contextText = ragContext.context
                .map(chunk => chunk.content)
                .join('\n\n');

            // 3. Build chat history context
            const historyText = chatHistory
                .slice(-5) // Last 5 messages
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');

            // 4. Generate response using context
            const response = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    context: contextText,
                    history: historyText,
                    noteId,
                    sources: ragContext.sources
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate RAG response');
            }

            const result = await response.json();

            return {
                ...result,
                context: ragContext.context,
                sources_count: ragContext.sources
            };

        } catch (error) {
            console.error('Error generating RAG response:', error);
            throw error;
        }
    }

    /**
     * Process note untuk RAG jika belum di-process
     */
    static async ensureNoteProcessedForRAG(noteId) {
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

            return await response.json();
        } catch (error) {
            console.error('Error ensuring note processed for RAG:', error);
            throw error;
        }
    }

    /**
     * Chat dengan multiple notes (cross-notes RAG)
     */
    static async chatWithMultipleNotes(query, noteIds = [], chatHistory = []) {
        try {
            // Get context from multiple notes
            const allContext = [];

            for (const noteId of noteIds) {
                const context = await VectorService.getRAGContext(query, noteId, 2);
                allContext.push(...context.context);
            }

            // Sort by similarity and take top results
            const sortedContext = allContext
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 5);

            const contextText = sortedContext
                .map(chunk => chunk.content)
                .join('\n\n');

            const historyText = chatHistory
                .slice(-5)
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');

            const response = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    context: contextText,
                    history: historyText,
                    noteIds,
                    sources: sortedContext.length,
                    multiNote: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate multi-note RAG response');
            }

            const result = await response.json();

            return {
                ...result,
                context: sortedContext,
                sources_count: sortedContext.length,
                notes_searched: noteIds.length
            };

        } catch (error) {
            console.error('Error in multi-note RAG chat:', error);
            throw error;
        }
    }

    /**
     * Get suggested questions berdasarkan note content
     */
    static async getSuggestedQuestions(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}/suggested-questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get suggested questions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting suggested questions:', error);
            throw error;
        }
    }

    /**
     * Search across all user's notes
     */
    static async searchAcrossNotes(query, limit = 10) {
        try {
            const context = await VectorService.getRAGContext(query, null, limit);

            // Group by note_id
            const noteGroups = {};
            context.context.forEach(chunk => {
                const noteId = chunk.metadata.note_id || 'unknown';
                if (!noteGroups[noteId]) {
                    noteGroups[noteId] = [];
                }
                noteGroups[noteId].push(chunk);
            });

            return {
                results: context.context,
                grouped_by_note: noteGroups,
                total_sources: context.sources,
                query
            };
        } catch (error) {
            console.error('Error searching across notes:', error);
            throw error;
        }
    }
}
