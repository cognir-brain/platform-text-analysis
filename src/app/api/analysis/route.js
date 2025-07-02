import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Schema untuk validasi response
const analysisSchema = z.object({
  'Sentiment Analysis': z.object({
    positive: z.number().min(0).max(1),
    negative: z.number().min(0).max(1),
    neutral: z.number().min(0).max(1)
  }),
  'Entity Extraction': z.array(z.object({
    entity: z.string(),
    name: z.string()
  })),
  'Topic Detection': z.array(z.object({
    name: z.string(),
    value: z.number()
  })),
  'Keyphrase Extraction': z.array(z.object({
    name: z.string(),
    value: z.number()
  })),
  'Emotion Analysis': z.object({
    anger: z.number(),
    disgust: z.number(),
    fear: z.number(),
    joy: z.number(),
    sadness: z.number(),
    surprise: z.number()
  }),
  'Bias Detection': z.string(),
  'Stance Detection': z.string(),
  'Relevance Score': z.number().min(0).max(1),
  'Summary Generation': z.string(),
  'Aspect-Based Sentiment Analysis': z.array(z.object({
    aspect: z.string(),
    sentiment: z.enum(['positive', 'negative', 'neutral'])
  })),
  'Language Style Analysis': z.string(),
  'Category Classification': z.string(),
  'Reading Complexity': z.string()
});

// Language mapping untuk prompt yang lebih natural
const getLanguagePrompt = (language) => {
  const languageMap = {
    'indonesian': {
      name: 'Bahasa Indonesia',
      instruction: 'Berikan analisis dalam Bahasa Indonesia yang lengkap dan mudah dipahami.'
    },
    'english': {
      name: 'English',
      instruction: 'Provide comprehensive analysis in English language.'
    },
    'arab': {
      name: 'Arabic',
      instruction: 'قدم التحليل الشامل باللغة العربية.'
    }
  };

  return languageMap[language] || languageMap['indonesian'];
};

export async function GET() {
  return Response.json({ message: "Hello from Next.js API!" });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { question, language = 'indonesian', sourceType, pdfFile } = body;

    // Check Gemini API key
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      console.error('Missing Gemini API key');
      return Response.json({
        error: "API configuration error: Missing Gemini credentials"
      }, { status: 500 });
    }

    // Validate inputs
    if (!question || question.trim().length < 10) {
      return Response.json({
        error: "Text content is too short for meaningful analysis"
      }, { status: 400 });
    }

    const languageConfig = getLanguagePrompt(language);

    // Enhanced prompt with language specification
    const prompt = `Analyze the following text comprehensively and provide results in ${languageConfig.name}:

TEXT TO ANALYZE: "${question}"

ANALYSIS REQUIREMENTS:
${languageConfig.instruction}

Provide detailed analysis in this exact JSON structure:
1. Sentiment Analysis: Calculate positive, negative, neutral values (0-1, must sum to 1)
2. Entity Extraction: Extract important entities with their types. Format as array of {entity, name} objects where 'entity' is the type and 'name' is the entity text
3. Topic Detection: Identify main topics with relevance scores (values between 0-1). Format as array of {name, value} objects
4. Keyphrase Extraction: Extract key phrases with importance scores (values between 0-1). Format as array of {name, value} objects.
5. Emotion Analysis: Analyze emotions (anger, disgust, fear, joy, sadness, surprise) as values 0-1
6. Bias Detection: Detect any biases in the text - explain in ${languageConfig.name}
7. Stance Detection: Determine the author's stance or position - explain in ${languageConfig.name}
8. Relevance Score: Overall content relevance (0-1)
9. Summary Generation: Create a concise summary in ${languageConfig.name}
10. Aspect-Based Sentiment Analysis: Analyze sentiment for different aspects
11. Language Style Analysis: Analyze writing style and tone in ${languageConfig.name}
12. Category Classification: Classify the content category in ${languageConfig.name}
13. Reading Complexity: Assess reading difficulty level in ${languageConfig.name}

IMPORTANT: All text-based analysis results (summaries, explanations, classifications) must be written in ${languageConfig.name}.`;

    console.log('Processing analysis request:', {
      textLength: question.length,
      targetLanguage: languageConfig.name
    });

    // Use correct environment variable name
    const geminiModel = google('gemini-2.0-flash', {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY // Fixed: correct variable name
    });

    let analysisResult;
    if (sourceType === 'pdf' && pdfFile) {
      // PDF analysis code
      const pdfBuffer = Buffer.from(pdfFile, 'base64');
      analysisResult = await generateObject({
        model: geminiModel,
        prompt,
        schema: analysisSchema,
        temperature: 0.3,
        files: [{
          name: 'document.pdf',
          data: pdfBuffer,
          mimeType: 'application/pdf'
        }]
      });
    } else {
      // Text analysis code
      analysisResult = await generateObject({
        model: geminiModel,
        prompt,
        schema: analysisSchema,
        temperature: 0.3,
      });
    }

    // Validate that we got meaningful results
    if (!analysisResult.object || !analysisResult.object['Summary Generation']) {
      throw new Error('Analysis failed to generate meaningful results');
    }

    return Response.json({
      message: {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(analysisResult.object)
            }]
          }
        }]
      },
      metadata: {
        language: languageConfig.name,
        textLength: question.length,
        processingTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);

    if (error.message?.includes('API key')) {
      return Response.json({
        error: "Invalid API key configuration"
      }, { status: 401 });
    }

    return Response.json({
      error: "Terjadi kesalahan saat memproses permintaan."
    }, { status: 500 });
  }
}
