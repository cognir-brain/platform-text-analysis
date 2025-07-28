'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import { FileText, Download, Search, Clock, Globe, Loader2 } from 'lucide-react';

export default function TranscriptPage() {
    const params = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedContent, setHighlightedContent] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchNote();
        }
    }, [params.id]);

    useEffect(() => {
        if (note && note.content) {
            highlightSearchTerm();
        }
    }, [note, searchTerm]);

    const fetchNote = async () => {
        try {
            setLoading(true);
            const result = await notesService.getNote(params.id);
            if (result.success) {
                setNote(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch note:', error);
        } finally {
            setLoading(false);
        }
    };

    const highlightSearchTerm = () => {
        if (!note?.content || !searchTerm.trim()) {
            setHighlightedContent(note?.content || '');
            return;
        }

        const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
        const highlighted = note.content.replace(
            regex,
            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
        );
        setHighlightedContent(highlighted);
    };

    const downloadTranscript = () => {
        if (!note?.content) return;

        const element = document.createElement('a');
        const file = new Blob([note.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `transcript-${note.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const getSourceInfo = () => {
        if (!note) return null;

        switch (note.source_type) {
            case 'youtube':
                return {
                    icon: '🎥',
                    title: note.file_metadata?.title || 'YouTube Video',
                    subtitle: note.file_metadata?.duration || 'Unknown duration',
                    url: note.source_url
                };
            case 'file':
                return {
                    icon: '📄',
                    title: note.file_metadata?.filename || 'Uploaded File',
                    subtitle: `${note.file_metadata?.word_count || 0} words`,
                    url: null
                };
            default:
                return {
                    icon: '🌐',
                    title: 'Web Content',
                    subtitle: 'Online source',
                    url: note.source_url
                };
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return null;

        const seconds = Math.floor(timestamp / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const wordCount = note?.content ? note.content.split(/\s+/).filter(word => word.length > 0).length : 0;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading transcript...</p>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Transcript not found</h3>
                    <p className="text-gray-500">The transcript you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const sourceInfo = getSourceInfo();

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">{sourceInfo.icon}</div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                Original Transcript
                            </h2>
                            <h3 className="text-lg text-gray-700 mb-2">
                                {sourceInfo.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {sourceInfo.subtitle}
                            </p>
                            {sourceInfo.url && (
                                <a
                                    href={sourceInfo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                                >
                                    <Globe className="h-3 w-3" />
                                    View source
                                </a>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={downloadTranscript}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>~{estimatedReadingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span className="capitalize">{note.language}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        Created: {new Date(note.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search in transcript..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        {highlightedContent.match(new RegExp(searchTerm.trim(), 'gi'))?.length || 0} matches found
                    </div>
                )}
            </div>

            {/* Transcript Content */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transcript</h3>

                    {note.content ? (
                        <div className="prose max-w-none">
                            <div
                                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: highlightedContent }}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-700 mb-2">No transcript available</h4>
                            <p className="text-gray-500">
                                The original content for this note is not available.
                            </p>
                        </div>
                    )}
                </div>

                {/* YouTube Timestamps (if available) */}
                {note.source_type === 'youtube' && note.file_metadata?.timestamps && (
                    <div className="border-t border-gray-200 p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {note.file_metadata.timestamps.slice(0, 20).map((timestamp, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                                    <span className="text-xs font-mono text-blue-600 flex-shrink-0 mt-1">
                                        {formatTimestamp(timestamp.time)}
                                    </span>
                                    <span className="text-sm text-gray-700 leading-relaxed">
                                        {timestamp.text}
                                    </span>
                                </div>
                            ))}
                            {note.file_metadata.timestamps.length > 20 && (
                                <div className="text-center py-2">
                                    <span className="text-sm text-gray-500">
                                        ... and {note.file_metadata.timestamps.length - 20} more timestamps
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
