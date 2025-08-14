import { VectorService } from '@/lib/vectorService';
import { supabaseAdmin } from '@/utils/supabase-admin';

export async function POST(req, { params }) {
    try {
        const noteId = params.id;

        if (!noteId) {
            return Response.json({
                success: false,
                error: "Note ID is required"
            }, { status: 400 });
        }

        // Get note data
        const { data: note, error: noteError } = await supabaseAdmin
            .from('ai_notes')
            .select('id, content, ai_generated_data, rag_processed')
            .eq('id', noteId)
            .single();

        if (noteError || !note) {
            return Response.json({
                success: false,
                error: "Note not found"
            }, { status: 404 });
        }

        // Check if already processed
        if (note.rag_processed) {
            return Response.json({
                success: true,
                message: "Note already processed for RAG",
                note_id: noteId,
                already_processed: true
            });
        }

        // Prepare content for RAG processing
        let fullContent = note.content || '';

        // Add AI generated content if available
        if (note.ai_generated_data) {
            const aiData = note.ai_generated_data;

            if (aiData.summary) {
                fullContent += `\n\nRINGKASAN: ${aiData.summary}`;
            }

            if (aiData.keyPoints && Array.isArray(aiData.keyPoints)) {
                fullContent += '\n\nPOIN KUNCI:\n';
                aiData.keyPoints.forEach((point, index) => {
                    fullContent += `${index + 1}. ${point.point}: ${point.explanation}\n`;
                });
            }

            if (aiData.mainTopics && Array.isArray(aiData.mainTopics)) {
                fullContent += `\n\nTOPIK UTAMA: ${aiData.mainTopics.join(', ')}`;
            }

            if (aiData.actionItems && Array.isArray(aiData.actionItems)) {
                fullContent += '\n\nACTION ITEMS:\n';
                aiData.actionItems.forEach((item, index) => {
                    fullContent += `${index + 1}. ${item}\n`;
                });
            }

            if (aiData.studyQuestions && Array.isArray(aiData.studyQuestions)) {
                fullContent += '\n\nPERTANYAAN STUDI:\n';
                aiData.studyQuestions.forEach((question, index) => {
                    fullContent += `${index + 1}. ${question}\n`;
                });
            }

            if (aiData.keyQuotes && Array.isArray(aiData.keyQuotes)) {
                fullContent += '\n\nKUTIPAN PENTING:\n';
                aiData.keyQuotes.forEach((quote, index) => {
                    fullContent += `${index + 1}. "${quote.text}" (${quote.context})\n`;
                });
            }
        }

        console.log(`Processing note ${noteId} for RAG...`);
        console.log(`Full content length: ${fullContent.length} characters`);

        // Process for RAG
        const result = await VectorService.processNoteForRAG(noteId, fullContent);

        // Mark as processed
        await supabase
            .from('ai_notes')
            .update({
                rag_processed: true,
                rag_processed_at: new Date().toISOString()
            })
            .eq('id', noteId);

        return Response.json({
            success: true,
            message: "Note successfully processed for RAG",
            note_id: noteId,
            chunks_created: result.stored,
            content_length: fullContent.length
        });

    } catch (error) {
        console.error('Error processing note for RAG:', error);

        return Response.json({
            success: false,
            error: 'Failed to process note for RAG: ' + error.message
        }, { status: 500 });
    }
}
