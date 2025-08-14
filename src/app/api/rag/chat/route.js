import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req) {
    try {
        const { query, context, history, noteId, noteIds, sources, multiNote } = await req.json();

        if (!query) {
            return Response.json({
                success: false,
                error: "Query is required"
            }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        // Build comprehensive prompt untuk RAG
        const ragPrompt = buildRAGPrompt(query, context, history, multiNote, sources);

        console.log('RAG Chat:', {
            query,
            contextLength: context?.length || 0,
            historyLength: history?.length || 0,
            sources,
            multiNote: !!multiNote
        });

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const result = await generateText({
            model: geminiModel,
            prompt: ragPrompt,
            temperature: 0.7,
            maxTokens: 1000,
        });

        return Response.json({
            success: true,
            response: result.text,
            sources_used: sources || 0,
            context_provided: !!context,
            note_id: noteId,
            note_ids: noteIds,
            multi_note: !!multiNote,
            query: query
        });

    } catch (error) {
        console.error('RAG chat error:', error);

        return Response.json({
            success: false,
            error: 'Failed to generate RAG response: ' + error.message
        }, { status: 500 });
    }
}

function buildRAGPrompt(query, context, history, multiNote, sources) {
    let prompt = `Anda adalah AI assistant yang membantu pengguna memahami dan berdiskusi tentang konten catatan mereka.

KONTEKS RELEVAN${multiNote ? ' (dari multiple notes)' : ''}:
${context || 'Tidak ada konteks khusus yang ditemukan.'}

${history ? `RIWAYAT PERCAKAPAN:
${history}

` : ''}INSTRUKSI:
1. Jawab pertanyaan user berdasarkan konteks yang diberikan
2. ${multiNote ? 'Jika informasi berasal dari catatan berbeda, sebutkan hal tersebut' : 'Fokus pada catatan yang sedang didiskusikan'}
3. Jika konteks tidak cukup untuk menjawab, katakan secara jujur
4. Berikan jawaban yang informatif dan membantu
5. Gunakan Bahasa Indonesia yang natural dan mudah dipahami
6. ${sources > 0 ? `Anda memiliki ${sources} sumber konteks untuk menjawab` : 'Jawab berdasarkan pengetahuan umum jika konteks tidak tersedia'}

PERTANYAAN USER: ${query}

JAWABAN:`;

    return prompt;
}
