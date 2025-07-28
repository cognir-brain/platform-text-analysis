import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const quizSchema = z.object({
    title: z.string(),
    questions: z.array(z.object({
        question: z.string(),
        type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
        options: z.array(z.string()).optional(),
        correct_answer: z.string(),
        explanation: z.string(),
        difficulty: z.number().min(1).max(5),
        points: z.number().min(1).max(10)
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
        const prompt = createQuizPrompt(noteContent, aiData, languageConfig);

        console.log('Generating quiz for note');

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const result = await generateObject({
            model: geminiModel,
            prompt,
            schema: quizSchema,
            temperature: 0.6,
        });

        if (!result.object?.questions || result.object.questions.length === 0) {
            throw new Error('Failed to generate quiz questions');
        }

        // Calculate total points
        const totalPoints = result.object.questions.reduce((sum, q) => sum + q.points, 0);

        return Response.json({
            success: true,
            quiz: {
                title: result.object.title,
                questions: result.object.questions,
                totalPoints,
                totalQuestions: result.object.questions.length
            },
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Quiz generation error:', error);
        return Response.json({
            success: false,
            error: 'Failed to generate quiz: ' + error.message
        }, { status: 500 });
    }
}

function getLanguageConfig(language) {
    const configs = {
        'indonesian': {
            name: 'Bahasa Indonesia',
            instruction: 'Buat kuis dalam Bahasa Indonesia yang menguji pemahaman materi.'
        },
        'english': {
            name: 'English',
            instruction: 'Create a quiz in English that tests understanding of the material.'
        },
        'arab': {
            name: 'Arabic',
            instruction: 'أنشئ اختبارًا باللغة العربية يختبر فهم المادة.'
        }
    };
    return configs[language] || configs['indonesian'];
}

function createQuizPrompt(noteContent, aiData, languageConfig) {
    let content = noteContent;

    if (aiData) {
        if (aiData.keyPoints) {
            content += '\n\nKey Points:\n' + aiData.keyPoints.map(point => `- ${point.point}: ${point.explanation}`).join('\n');
        }
        if (aiData.mainTopics) {
            content += '\n\nMain Topics: ' + aiData.mainTopics.join(', ');
        }
    }

    return `Create a comprehensive quiz from the following content in ${languageConfig.name}:

CONTENT:
${content}

${languageConfig.instruction}

Instructions:
1. Create 8-12 questions covering the most important concepts
2. Use a mix of question types: multiple choice, true/false, and short answer
3. For multiple choice: provide 4 options (A, B, C, D)
4. For true/false: the statement should be clear and unambiguous
5. For short answer: expect 1-2 sentence responses
6. Rate difficulty from 1 (easy) to 5 (hard)
7. Assign points based on difficulty and question type (1-10 points)
8. Provide clear explanations for correct answers
9. Focus on understanding, application, and analysis rather than memorization
10. Ensure questions are clear, specific, and directly related to the content

Question distribution:
- 60% multiple choice questions
- 20% true/false questions  
- 20% short answer questions

Create a meaningful quiz title based on the content.`;
}
