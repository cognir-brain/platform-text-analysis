import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const notesSchema = z.object({
    title: z.string(),
    summary: z.string(),
    keyPoints: z.array(z.object({
        point: z.string(),
        explanation: z.string(),
        importance: z.number().min(1).max(5)
    })),
    mainTopics: z.array(z.string()),
    actionItems: z.array(z.string()),
    keyQuotes: z.array(z.object({
        text: z.string(),
        context: z.string()
    })),
    relatedConcepts: z.array(z.string()),
    studyQuestions: z.array(z.string()),
    tags: z.array(z.string())
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { text, language = 'indonesian', sourceType = 'text', videoMetadata, fileMetadata } = body;

        if (!text || text.trim().length < 50) {
            return Response.json({
                success: false,
                error: "Content is too short for meaningful notes"
            }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        const languageConfig = getLanguageConfig(language);
        const prompt = createNotesPrompt(text, languageConfig, sourceType, videoMetadata, fileMetadata);

        console.log('Generating AI notes:', {
            textLength: text.length,
            language: languageConfig.name,
            sourceType
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

        const noteId = generateNoteId();

        return Response.json({
            success: true,
            id: noteId,
            notes: notesResult.object,
            metadata: {
                language: languageConfig.name,
                sourceType,
                textLength: text.length,
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Notes generation error:', error);
        return Response.json({
            success: false,
            error: 'Failed to generate notes: ' + error.message
        }, { status: 500 });
    }
}

function getLanguageConfig(language) {
    const configs = {
        'indonesian': {
            name: 'Bahasa Indonesia',
            instruction: 'Buat catatan dalam Bahasa Indonesia yang komprehensif dan mudah dipahami.'
        },
        'english': {
            name: 'English',
            instruction: 'Create comprehensive notes in English language.'
        },
        'arab': {
            name: 'Arabic',
            instruction: 'أنشئ ملاحظات شاملة باللغة العربية.'
        }
    };
    return configs[language] || configs['indonesian'];
}

function createNotesPrompt(text, languageConfig, sourceType, videoMetadata, fileMetadata) {
    let sourceContext = '';

    if (sourceType === 'youtube' && videoMetadata) {
        sourceContext = `SOURCE: YouTube Video - ${videoMetadata.title} (${videoMetadata.duration})`;
    } else if (sourceType === 'file' && fileMetadata) {
        sourceContext = `SOURCE: Document - ${fileMetadata.filename} (${fileMetadata.wordCount} words)`;
    }

    return `Create comprehensive study notes from the following content in ${languageConfig.name}:

${sourceContext}

CONTENT: "${text}"

${languageConfig.instruction}

Generate structured notes with clear title, summary, key points, topics, actionable items, quotes, related concepts, study questions, and relevant tags.`;
}

function generateNoteId() {
    return `note_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}