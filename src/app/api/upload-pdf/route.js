import { supabaseAdmin } from '@/utils/supabase-admin';
import pdf from 'pdf-parse';

export async function POST(req) {
    try {
        console.log('Starting file upload...');

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
        const type = data.get('type') || 'analysis'; // 'analysis' or 'notes'

        // Expand file type support for notes
        const allowedTypes = type === 'notes'
            ? ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
            : ['application/pdf'];

        if (!file) {
            return Response.json({
                success: false,
                error: "No file provided"
            }, { status: 400 });
        }

        if (!allowedTypes.includes(file.type)) {
            const supportedFormats = type === 'notes' ? 'PDF, TXT, or DOC' : 'PDF';
            return Response.json({
                success: false,
                error: `Please upload a valid ${supportedFormats} file`
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

        let extractedText = '';
        let metadata = {};

        // Process based on file type
        if (file.type === 'application/pdf') {
            const pdfData = await pdf(buffer);
            extractedText = pdfData.text.trim();
            metadata = {
                pages: pdfData.numpages,
                info: pdfData.info || {}
            };
        } else if (file.type === 'text/plain') {
            extractedText = buffer.toString('utf-8').trim();
        } else {
            // For DOC/DOCX files, return error for now
            return Response.json({
                success: false,
                error: "DOC/DOCX files not yet supported"
            }, { status: 400 });
        }

        if (extractedText.length < 10) {
            return Response.json({
                success: false,
                error: 'No readable text found in the file'
            }, { status: 400 });
        }

        // Generate unique filename based on type
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, '_');
        const folderPrefix = type === 'notes' ? 'notes-uploads' : 'uploads';
        const fileName = `${folderPrefix}/${timestamp}_${randomId}_${cleanName}`;

        // Choose bucket based on type
        const bucketName = type === 'notes' ? 'documents' : 'pdf-files';

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return Response.json({
                success: false,
                error: 'Failed to upload file: ' + uploadError.message
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        // Calculate stats
        const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200);

        const result = {
            text: extractedText,
            filename: file.name,
            fileSize: file.size,
            wordCount: wordCount,
            readingTime: readingTime,
            fileType: file.type,
            fileUrl: publicUrl,
            storagePath: fileName,
            metadata: {
                ...metadata,
                uploadedAt: new Date().toISOString(),
                originalFilename: file.name,
                mimeType: file.type,
                type: type
            }
        };

        // Add pages info for PDF
        if (file.type === 'application/pdf') {
            result.pages = metadata.pages;
            result.pdfUrl = publicUrl; // Backward compatibility
        }

        return Response.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('File processing error:', error);
        return Response.json({
            success: false,
            error: 'Failed to process file: ' + error.message
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
                hasPdfBucket: buckets?.some(b => b.name === 'pdf-files') || false,
                hasDocumentsBucket: buckets?.some(b => b.name === 'documents') || false
            }
        });
    } catch (error) {
        return Response.json({
            status: 'error',
            error: error.message
        }, { status: 500 });
    }
}