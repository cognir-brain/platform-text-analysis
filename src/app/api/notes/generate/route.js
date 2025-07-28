import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NotesPromptGenerator } from '@/lib/notesPromptGenerator';

const notesSchema = z.object({
    title: z.string().describe("Judul catatan yang menarik dan deskriptif, dimulai dengan emotikon yang relevan"),
    summary: z.string().describe("Ringkasan komprehensif dalam satu paragraf yang menangkap esensi utama konten"),
    keyPoints: z.array(z.object({
        point: z.string().describe("Poin kunci yang penting"),
        explanation: z.string().describe("Penjelasan detail dan context dari poin tersebut"),
        importance: z.number().min(1).max(5).describe("Rating kepentingan dari 1-5 (5 = sangat penting)")
    })).describe("5-8 poin kunci dengan penjelasan dan rating kepentingan"),
    mainTopics: z.array(z.string()).describe("3-6 tema atau topik utama yang dibahas dalam konten"),
    actionItems: z.array(z.string()).describe("Hal-hal konkret yang dapat dilakukan berdasarkan konten"),
    keyQuotes: z.array(z.object({
        text: z.string().describe("Kutipan yang memorable atau penting"),
        context: z.string().describe("Konteks dimana kutipan tersebut diucapkan")
    })).describe("Kutipan penting dengan konteks yang jelas"),
    relatedConcepts: z.array(z.string()).describe("Konsep atau topik terkait untuk eksplorasi lebih lanjut"),
    studyQuestions: z.array(z.string()).describe("5-7 pertanyaan untuk menguji pemahaman terhadap materi"),
    tags: z.array(z.string()).describe("5-10 kata kunci untuk kategorisasi dan pencarian")
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { text, language = 'indonesian', sourceType = 'text', videoMetadata, fileMetadata } = body;

        // Validate input text
        NotesPromptGenerator.validateText(text);

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        // Prepare metadata based on source type
        let metadata = {};
        if (sourceType === 'youtube' && videoMetadata) {
            metadata = NotesPromptGenerator.extractVideoMetadata(videoMetadata);
        } else if ((sourceType === 'file' || sourceType === 'pdf') && fileMetadata) {
            metadata = NotesPromptGenerator.extractFileMetadata(fileMetadata);
        }

        // Generate improved prompt
        const prompt = NotesPromptGenerator.createPrompt(text, language, sourceType, metadata);

        console.log('Generating AI notes:', {
            textLength: text.length,
            language,
            sourceType,
            hasMetadata: Object.keys(metadata).length > 0
        });

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const notesResult = await generateObject({
            model: geminiModel,
            prompt,
            schema: notesSchema,
            temperature: 0.4,
        });

        if (!notesResult.object || !notesResult.object.title) {
            throw new Error('Failed to generate meaningful notes');
        }

        return Response.json({
            success: true,
            notes: notesResult.object,
            metadata: {
                language,
                sourceType,
                textLength: text.length,
                generatedAt: new Date().toISOString(),
                promptVersion: '2.0'
            }
        });

    } catch (error) {
        console.error('Notes generation error:', error);

        // Handle validation errors
        if (error.message.includes('Text content')) {
            return Response.json({
                success: false,
                error: error.message
            }, { status: 400 });
        }

        return Response.json({
            success: false,
            error: 'Failed to generate notes: ' + error.message
        }, { status: 500 });
    }
}

// File updated to use NotesPromptGenerator utility
