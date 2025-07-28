import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const flashcardsSchema = z.object({
    flashcards: z.array(z.object({
        question: z.string(),
        answer: z.string(),
        difficulty: z.number().min(1).max(5),
        category: z.string().optional()
    }))
});

export async function POST(req) {
    try {
        const { noteContent, aiData, language = 'indonesian' } = await req.json();

        if (!noteContent?.trim()) {
            return Response.json({
                success: false,
                error: "Note content is required"
            }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        const languageConfig = getLanguageConfig(language);
        const prompt = createFlashcardsPrompt(noteContent, aiData, languageConfig);

        console.log('Generating flashcards for note');

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const result = await generateObject({
            model: geminiModel,
            prompt,
            schema: flashcardsSchema,
            temperature: 0.6,
        });

        if (!result.object?.flashcards || result.object.flashcards.length === 0) {
            throw new Error('Failed to generate flashcards');
        }

        return Response.json({
            success: true,
            flashcards: result.object.flashcards,
            count: result.object.flashcards.length,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Flashcards generation error:', error);
        return Response.json({
            success: false,
            error: 'Failed to generate flashcards: ' + error.message
        }, { status: 500 });
    }
}

function getLanguageConfig(language) {
    const configs = {
        'indonesian': {
            name: 'Bahasa Indonesia',
            instruction: 'Buat flashcard dalam Bahasa Indonesia yang efektif untuk belajar.'
        },
        'english': {
            name: 'English',
            instruction: 'Create effective flashcards in English for studying.'
        },
        'arab': {
            name: 'Arabic',
            instruction: 'أنشئ بطاقات تعليمية فعالة باللغة العربية للدراسة.'
        }
    };
    return configs[language] || configs['indonesian'];
}

function createFlashcardsPrompt(noteContent, aiData, languageConfig) {
    let content = noteContent;

    if (aiData && aiData.keyPoints) {
        content += '\n\nKey Points:\n' + aiData.keyPoints.map(point => `- ${point.point}: ${point.explanation}`).join('\n');
    }

    return `Create comprehensive flashcards from the following content in ${languageConfig.name}:

CONTENT:
${content}

${languageConfig.instruction}

Instructions:
1. Create 10-15 flashcards covering the most important concepts
2. Make questions clear and specific
3. Provide concise but complete answers
4. Rate difficulty from 1 (easy) to 5 (hard)
5. Focus on key facts, definitions, concepts, and relationships
6. Include both factual and conceptual questions
7. Ensure questions test understanding, not just memorization

Generate diverse question types:
- Definition questions
- Concept explanations
- Applications
- Comparisons
- Examples
- Process steps`;
}
