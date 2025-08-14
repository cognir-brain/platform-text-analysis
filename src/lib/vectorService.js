// Conditional import - only load supabaseAdmin on server-side
let supabaseAdmin = null;

const getSupabaseAdmin = async () => {
    if (!supabaseAdmin && typeof window === 'undefined') {
        const { supabaseAdmin: admin } = await import('../utils/supabase-admin.js');
        supabaseAdmin = admin;
    }
    return supabaseAdmin;
};

export class VectorService {
    /**
     * Generate embeddings menggunakan Gemini API
     */
    static async generateEmbedding(text) {
        try {
            const response = await fetch('/api/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('Failed to generate embedding');
            }

            const result = await response.json();
            return result.embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }

    /**
     * Store chunks dengan embeddings ke database
     */
    static async storeNoteChunks(noteId, chunks) {
        // Server-side only function
        if (typeof window !== 'undefined') {
            throw new Error('storeNoteChunks can only be called on server-side');
        }

        // Ensure supabaseAdmin is loaded
        const admin = await getSupabaseAdmin();
        if (!admin) {
            throw new Error('Failed to load supabaseAdmin');
        }

        try {
            const chunkData = [];

            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);

                const embedding = await this.generateEmbedding(chunk.content);

                chunkData.push({
                    note_id: noteId,
                    chunk_content: chunk.content,
                    chunk_index: i,
                    embedding: embedding,
                    metadata: chunk.metadata || {}
                });
            }

            const { data, error } = await admin
                .from('note_chunks')
                .insert(chunkData);

            if (error) {
                throw new Error(`Failed to store chunks: ${error.message}`);
            }

            return { success: true, stored: chunkData.length };
        } catch (error) {
            console.error('Error storing note chunks:', error);
            throw error;
        }
    }

    /**
     * Similarity search untuk mencari chunks yang relevan
     */
    static async searchSimilarChunks(query, noteId = null, limit = 5, threshold = 0.5) {
        // Server-side only function
        if (typeof window !== 'undefined') {
            throw new Error('searchSimilarChunks can only be called on server-side');
        }

        // Ensure supabaseAdmin is loaded
        const admin = await getSupabaseAdmin();
        if (!admin) {
            throw new Error('Failed to load supabaseAdmin');
        }

        try {
            // Generate embedding untuk query
            const queryEmbedding = await this.generateEmbedding(query);

            // Buat query SQL untuk similarity search
            let rpcQuery = admin.rpc('search_similar_chunks', {
                query_embedding: queryEmbedding,
                similarity_threshold: threshold,
                match_count: limit
            });

            // Filter berdasarkan note_id jika diberikan
            if (noteId) {
                rpcQuery = rpcQuery.eq('note_id', noteId);
            }

            const { data, error } = await rpcQuery;

            if (error) {
                throw new Error(`Similarity search failed: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            console.error('Error in similarity search:', error);
            throw error;
        }
    }

    /**
     * Chunk text menjadi bagian-bagian kecil untuk embeddings
     */
    static chunkText(text, chunkSize = 500, overlap = 50) {
        const chunks = [];
        const words = text.split(/\s+/);

        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunk = words.slice(i, i + chunkSize).join(' ');

            if (chunk.trim().length > 0) {
                chunks.push({
                    content: chunk.trim(),
                    metadata: {
                        start_word: i,
                        end_word: Math.min(i + chunkSize, words.length),
                        word_count: chunk.split(/\s+/).length
                    }
                });
            }
        }

        return chunks;
    }

    /**
     * Process note untuk RAG (chunking + embedding + storage)
     */
    static async processNoteForRAG(noteId, content) {
        try {
            console.log(`Processing note ${noteId} for RAG...`);

            // 1. Chunk the content
            const chunks = this.chunkText(content);
            console.log(`Created ${chunks.length} chunks`);

            // 2. Store chunks with embeddings
            const result = await this.storeNoteChunks(noteId, chunks);

            console.log(`Successfully processed note ${noteId} for RAG`);
            return result;
        } catch (error) {
            console.error(`Error processing note ${noteId} for RAG:`, error);
            throw error;
        }
    }

    /**
     * Delete chunks untuk note tertentu
     */
    static async deleteNoteChunks(noteId) {
        try {
            const admin = await getSupabaseAdmin();
            if (!admin) {
                throw new Error('Failed to load supabaseAdmin');
            }

            const { error } = await admin
                .from('note_chunks')
                .delete()
                .eq('note_id', noteId);

            if (error) {
                throw new Error(`Failed to delete chunks: ${error.message}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting chunks:', error);
            throw error;
        }
    }

    /**
     * Get context untuk RAG berdasarkan query
     */
    static async getRAGContext(query, noteId = null, maxChunks = 3) {
        try {
            const similarChunks = await this.searchSimilarChunks(query, noteId, maxChunks);

            const context = similarChunks.map(chunk => ({
                content: chunk.chunk_content,
                similarity: chunk.similarity,
                metadata: chunk.metadata
            }));

            return {
                context,
                sources: similarChunks.length,
                query
            };
        } catch (error) {
            console.error('Error getting RAG context:', error);
            throw error;
        }
    }
}
