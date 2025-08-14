import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { supabaseAdmin } from '@/utils/supabase-admin';

const suggestedQuestionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe("Pertanyaan yang bisa ditanyakan tentang catatan ini"),
        category: z.string().describe("Kategori pertanyaan: konsep, aplikasi, detail, perbandingan, atau evaluasi"),
        complexity: z.enum(["beginner", "intermediate", "advanced"]).describe("Tingkat kesulitan pertanyaan")
    })).describe("5-8 pertanyaan yang relevan untuk diskusi tentang catatan ini")
});

export async function GET(req, { params }) {
    try {
        const noteId = params.id;

        if (!noteId) {
            return Response.json({
                success: false,
                error: "Note ID is required"
            }, { status: 400 });
        }

        // Get note data
        const { data: note, error: noteError } = await supabase
            .from('ai_notes')
            .select('id, title, content, ai_generated_data, source_type')
            .eq('id', noteId)
            .single();

        if (noteError || !note) {
            return Response.json({
                success: false,
                error: "Note not found"
            }, { status: 404 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        // Build content summary for question generation
        let contentSummary = '';

        if (note.ai_generated_data?.title) {
            contentSummary += `Judul: ${note.ai_generated_data.title}\n`;
        }

        if (note.ai_generated_data?.summary) {
            contentSummary += `Ringkasan: ${note.ai_generated_data.summary}\n`;
        }

        if (note.ai_generated_data?.mainTopics) {
            contentSummary += `Topik Utama: ${note.ai_generated_data.mainTopics.join(', ')}\n`;
        }

        if (note.ai_generated_data?.keyPoints) {
            contentSummary += 'Poin Kunci:\n';
            note.ai_generated_data.keyPoints.slice(0, 3).forEach((point, i) => {
                contentSummary += `${i + 1}. ${point.point}\n`;
            });
        }

        const prompt = `Berdasarkan catatan berikut, buatlah pertanyaan-pertanyaan yang menarik dan relevan untuk diskusi:

${contentSummary}

Buat pertanyaan yang:
1. Menggali pemahaman konsep yang lebih dalam
2. Menghubungkan dengan aplikasi praktis
3. Mengeksplorasi detail teknis
4. Membandingkan dengan konsep lain
5. Mengevaluasi pro/kontra atau efektivitas

Variasikan tingkat kesulitan dari beginner hingga advanced.
Pertanyaan harus dalam Bahasa Indonesia dan mudah dipahami.`;

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const result = await generateObject({
            model: geminiModel,
            prompt,
            schema: suggestedQuestionsSchema,
            temperature: 0.8,
        });

        return Response.json({
            success: true,
            questions: result.object.questions,
            note_id: noteId,
            note_title: note.ai_generated_data?.title || note.title,
            source_type: note.source_type
        });

    } catch (error) {
        console.error('Error generating suggested questions:', error);

        return Response.json({
            success: false,
            error: 'Failed to generate suggested questions: ' + error.message
        }, { status: 500 });
    }
}
