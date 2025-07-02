// src/app/api/scrape/route.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import urlMetadata from 'url-metadata';

export async function POST(req) {
    try {
        const { url } = await req.json();

        // Validate URL
        if (!url || !isValidUrl(url)) {
            return Response.json({
                success: false,
                error: "Invalid URL provided"
            }, { status: 400 });
        }

        // Get page content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            timeout: 10000, // 10 seconds timeout
            maxRedirects: 5,
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract metadata
        const metadata = await extractMetadata(url);

        // Extract main content
        const extractedContent = extractArticleContent($);

        if (!extractedContent.text || extractedContent.text.length < 100) {
            return Response.json({
                success: false,
                error: "Could not extract meaningful content from the URL"
            }, { status: 422 });
        }

        return Response.json({
            success: true,
            data: {
                url,
                title: metadata.title || extractedContent.title,
                description: metadata.description,
                author: metadata.author,
                publishDate: metadata.date,
                siteName: metadata.source,
                image: metadata.image,
                text: extractedContent.text,
                wordCount: extractedContent.wordCount,
                readingTime: Math.ceil(extractedContent.wordCount / 200), // Average reading speed
            }
        });

    } catch (error) {
        console.error('Scraping error:', error);

        if (error.code === 'ENOTFOUND') {
            return Response.json({
                success: false,
                error: "Website not found or unreachable"
            }, { status: 404 });
        }

        if (error.code === 'ECONNABORTED') {
            return Response.json({
                success: false,
                error: "Request timeout - website took too long to respond"
            }, { status: 408 });
        }

        return Response.json({
            success: false,
            error: "Failed to scrape content from the URL"
        }, { status: 500 });
    }
}

// Helper functions
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

async function extractMetadata(url) {
    try {
        const metadata = await urlMetadata(url);
        return {
            title: metadata.title,
            description: metadata.description,
            author: metadata.author,
            date: metadata.date,
            source: metadata.source,
            image: metadata.image,
        };
    } catch (error) {
        console.warn('Failed to extract metadata:', error.message);
        return {};
    }
}

function extractArticleContent($) {
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .sidebar, .menu, .advertisement, .ads, .social-media').remove();

    // Try different article selectors (common patterns)
    const articleSelectors = [
        'article',
        '[role="main"]',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content',
        '.post',
        '.article-body',
        'main',
        '#content',
        '.story-body',
        '.article-text'
    ];

    let content = '';
    let title = '';

    // Extract title
    title = $('h1').first().text().trim() ||
        $('title').text().trim() ||
        $('[property="og:title"]').attr('content') || '';

    // Try to find main content
    for (const selector of articleSelectors) {
        const element = $(selector);
        if (element.length > 0) {
            content = element.text().trim();
            if (content.length > 200) { // If we found substantial content
                break;
            }
        }
    }

    // Fallback: get all paragraph text
    if (!content || content.length < 200) {
        content = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Clean up content
    content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();

    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    return {
        title,
        text: content,
        wordCount
    };
}