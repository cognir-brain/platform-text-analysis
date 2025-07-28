import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req) {
    try {
        const { noteContent, aiData, message, language = 'indonesian' } = await req.json();

        if (!message?.trim()) {
            return Response.json({
                success: false,
                error: "Message is required"
            }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        const languageConfig = getLanguageConfig(language);
        const context = buildChatContext(noteContent, aiData, languageConfig);

        const prompt = `${context}

User Question: ${message}

Please provide a helpful response based on the note content above. Answer in ${languageConfig.name}.`;

        const geminiModel = google('gemini-2.0-flash', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const result = await generateText({
            model: geminiModel,
            prompt,
            temperature: 0.7,
            maxTokens: 1000,
        });

        return Response.json({
            success: true,
            response: result.text,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat error:', error);
        return Response.json({
            success: false,
            error: 'Failed to process chat: ' + error.message
        }, { status: 500 });
    }
}

function getLanguageConfig(language) {
    const configs = {
        'indonesian': {
            name: 'Bahasa Indonesia',
            instruction: 'Jawab dalam Bahasa Indonesia yang jelas dan informatif.'
        },
        'english': {
            name: 'English',
            instruction: 'Answer in clear and informative English.'
        },
        'arab': {
            name: 'Arabic',
            instruction: 'أجب باللغة العربية بطريقة واضحة ومفيدة.'
        }
    };
    return configs[language] || configs['indonesian'];
}

function buildChatContext(noteContent, aiData, languageConfig) {
    let context = `You are an AI assistant helping with study notes. Here is the note content:

ORIGINAL CONTENT:
${noteContent}

`;

    if (aiData && Object.keys(aiData).length > 0) {
        context += `AI-GENERATED SUMMARY:
Title: ${aiData.title || 'N/A'}
Summary: ${aiData.summary || 'N/A'}

`;

        if (aiData.keyPoints && aiData.keyPoints.length > 0) {
            context += `KEY POINTS:
${aiData.keyPoints.map((point, index) => `${index + 1}. ${point.point} (Importance: ${point.importance}/5)`).join('\n')}

`;
        }

        if (aiData.mainTopics && aiData.mainTopics.length > 0) {
            context += `MAIN TOPICS: ${aiData.mainTopics.join(', ')}

`;
        }
    }

    context += `${languageConfig.instruction}`;

    return context;
}
