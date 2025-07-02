import { supabaseAdmin } from '@/utils/supabase-admin';
import pdf from 'pdf-parse';

export async function POST(req) {
    try {
        console.log('Starting PDF upload...');

        // Check environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
            return Response.json({
                success: false,
                error: 'Server configuration error'
            }, { status: 500 });
        }

        // Parse form data
        const data = await req.formData();
        const file = data.get('file');

        if (!file || file.type !== 'application/pdf') {
            return Response.json({
                success: false,
                error: "Please upload a valid PDF file"
            }, { status: 400 });
        }

        if (file.size > 10 * 1024 * 1024) {
            return Response.json({
                success: false,
                error: "File size must be less than 10MB"
            }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text from PDF
        const pdfData = await pdf(buffer);
        const extractedText = pdfData.text.trim();

        if (extractedText.length < 10) {
            return Response.json({
                success: false,
                error: 'No readable text found in PDF'
            }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, '_');
        const fileName = `uploads/${timestamp}_${randomId}_${cleanName}.pdf`;

        // Upload to Supabase Storage using admin client
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('pdf-files')
            .upload(fileName, buffer, {
                contentType: 'application/pdf',
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return Response.json({
                success: false,
                error: 'Failed to upload PDF: ' + uploadError.message
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('pdf-files')
            .getPublicUrl(fileName);

        // Calculate stats
        const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200);

        const result = {
            text: extractedText,
            filename: file.name,
            fileSize: file.size,
            pages: pdfData.numpages,
            wordCount: wordCount,
            readingTime: readingTime,
            pdfUrl: publicUrl,
            storagePath: fileName,
            metadata: {
                info: pdfData.info || {},
                uploadedAt: new Date().toISOString(),
                originalFilename: file.name,
                mimeType: file.type
            }
        };

        return Response.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('PDF processing error:', error);
        return Response.json({
            success: false,
            error: 'Failed to process PDF: ' + error.message
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Test admin connection
        const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();

        return Response.json({
            status: 'ok',
            config: {
                supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                serviceKeyConfigured: !!process.env.SUPABASE_SERVICE_KEY
            },
            storage: {
                connected: !error,
                hasPdfBucket: buckets?.some(b => b.name === 'pdf-files') || false
            }
        });
    } catch (error) {
        return Response.json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
}