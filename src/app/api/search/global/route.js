import { VectorService } from '@/lib/vectorService';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return Response.json({
                success: false,
                error: "Query parameter is required"
            }, { status: 400 });
        }

        // Get user from session
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return Response.json({
                success: false,
                error: "Authentication required"
            }, { status: 401 });
        }

        // Search across all user's notes
        const results = await VectorService.searchSimilarChunks(query, null, limit);

        // Group results by note and get note metadata
        const noteIds = [...new Set(results.map(r => r.note_id))];

        let notesMetadata = {};
        if (noteIds.length > 0) {
            const { data: notes } = await supabaseAdmin
                .from('ai_notes')
                .select('id, title, ai_generated_data, source_type, created_at')
                .in('id', noteIds);

            if (notes) {
                notesMetadata = notes.reduce((acc, note) => {
                    acc[note.id] = note;
                    return acc;
                }, {});
            }
        }

        // Enhance results with note metadata
        const enhancedResults = results.map(result => ({
            ...result,
            note_metadata: notesMetadata[result.note_id] || null
        }));

        // Group by note for better organization
        const groupedResults = {};
        enhancedResults.forEach(result => {
            if (!groupedResults[result.note_id]) {
                groupedResults[result.note_id] = {
                    note: result.note_metadata,
                    chunks: []
                };
            }
            groupedResults[result.note_id].chunks.push({
                content: result.chunk_content,
                similarity: result.similarity,
                chunk_index: result.chunk_index
            });
        });

        return Response.json({
            success: true,
            query,
            results: enhancedResults,
            grouped_by_note: groupedResults,
            total_results: results.length,
            notes_found: Object.keys(groupedResults).length
        });

    } catch (error) {
        console.error('Global search error:', error);

        return Response.json({
            success: false,
            error: 'Search failed: ' + error.message
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { query, noteIds, limit = 10 } = await req.json();

        if (!query) {
            return Response.json({
                success: false,
                error: "Query is required"
            }, { status: 400 });
        }

        let results;

        if (noteIds && noteIds.length > 0) {
            // Search within specific notes
            const allResults = [];

            for (const noteId of noteIds) {
                const noteResults = await VectorService.searchSimilarChunks(query, noteId, Math.ceil(limit / noteIds.length));
                allResults.push(...noteResults);
            }

            // Sort by similarity and limit
            results = allResults
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } else {
            // Search across all notes
            results = await VectorService.searchSimilarChunks(query, null, limit);
        }

        return Response.json({
            success: true,
            query,
            results,
            total_results: results.length,
            search_scope: noteIds ? 'specific_notes' : 'all_notes'
        });

    } catch (error) {
        console.error('Advanced search error:', error);

        return Response.json({
            success: false,
            error: 'Advanced search failed: ' + error.message
        }, { status: 500 });
    }
}
