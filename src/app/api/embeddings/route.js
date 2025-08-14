import { google } from '@ai-sdk/google';
import { embed } from 'ai';

export async function POST(req) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return Response.json({
                success: false,
                error: "Text is required"
            }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return Response.json({
                success: false,
                error: "API configuration error"
            }, { status: 500 });
        }

        // Use Gemini embedding model
        const embeddingModel = google('text-embedding-004', {
            apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
        });

        const { embedding } = await embed({
            model: embeddingModel,
            value: text,
        });

        return Response.json({
            success: true,
            embedding: embedding,
            dimensions: embedding.length,
            text_length: text.length
        });

    } catch (error) {
        console.error('Embedding generation error:', error);

        return Response.json({
            success: false,
            error: 'Failed to generate embedding: ' + error.message
        }, { status: 500 });
    }
}
