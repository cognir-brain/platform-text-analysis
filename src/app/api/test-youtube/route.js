// import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request) {
    try {
        console.log('Test YouTube API called');

        const body = await request.json();
        const { url } = body;
        console.log('Processing URL:', url);

        // Simple validation
        if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid YouTube URL provided"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // For now, return mock data to test the flow
        const mockVideoData = {
            videoId: 'test123',
            title: 'Test YouTube Video',
            duration: '3:45',
            transcript: 'This is a test transcript for testing purposes. The video content would normally be extracted from YouTube.',
            wordCount: 50,
            timestamps: [
                { time: 0, text: 'This is a test transcript', duration: 2000 },
                { time: 2000, text: 'for testing purposes', duration: 2000 }
            ],
            url: url
        };

        console.log('Returning mock data for:', url);

        return new Response(JSON.stringify({
            success: true,
            data: mockVideoData
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Test API error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function GET() {
    return new Response(JSON.stringify({
        success: true,
        message: 'Test YouTube API is working'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}
