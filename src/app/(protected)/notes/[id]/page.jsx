'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import { Loader2, FileText, Calendar, Globe, PlayCircle, User, Clock, MessageCircle, Brain } from 'lucide-react';
import RAGChatInterface from '@/components/rag-chat-interface';

export default function NotePage() {
    const params = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRAGChat, setShowRAGChat] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchNote();
        }
    }, [params.id]);

    const fetchNote = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await notesService.getNote(params.id);

            console.log('Fetched note result:', result);
            console.log('Note data:', result.data);
            console.log('AI generated data:', result.data?.ai_generated_data);

            if (result.success) {
                setNote(result.data);
            } else {
                setError('Note not found');
            }
        } catch (error) {
            console.error('Failed to fetch note:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getSourceIcon = (sourceType) => {
        switch (sourceType) {
            case 'youtube':
                return <PlayCircle className="h-5 w-5 text-red-500" />;
            case 'file':
                return <FileText className="h-5 w-5 text-green-500" />;
            default:
                return <Globe className="h-5 w-5 text-blue-500" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading note...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Note not found</h3>
                    <p className="text-gray-500">The note you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        {getSourceIcon(note.source_type)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {note.ai_generated_data?.title || note.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(note.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                <span className="capitalize">{note.language}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                {getSourceIcon(note.source_type)}
                                <span className="capitalize">{note.source_type}</span>
                            </div>

                            {note.file_metadata?.word_count && (
                                <div className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />
                                    <span>{note.file_metadata.word_count} words</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setShowRAGChat(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Brain className="h-4 w-4" />
                                <span>Chat dengan AI</span>
                            </button>

                            <button
                                onClick={() => setShowRAGChat(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Diskusi</span>
                            </button>
                        </div>

                        {/* Source specific info */}
                        {note.source_type === 'youtube' && note.file_metadata?.title && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-red-600" />
                                    <div>
                                        <span className="font-medium text-red-800">{note.file_metadata.title}</span>
                                        {note.file_metadata.duration && (
                                            <span className="text-red-600 text-sm ml-2">{note.file_metadata.duration}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {note.source_type === 'file' && note.file_metadata?.filename && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-800">{note.file_metadata.filename}</span>
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {note.ai_generated_data?.summary && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                <h3 className="font-medium text-blue-800 mb-2">Summary</h3>
                                <p className="text-blue-700">{note.ai_generated_data.summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Generated Content */}
            {note.ai_generated_data && Object.keys(note.ai_generated_data).length > 0 && (
                <div className="space-y-6">
                    {/* Key Points */}
                    {note.ai_generated_data.keyPoints && note.ai_generated_data.keyPoints.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Points</h2>
                            <div className="space-y-4">
                                {note.ai_generated_data.keyPoints.map((point, index) => (
                                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900">{point.point}</h3>
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {point.importance}/5
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{point.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Topics */}
                    {note.ai_generated_data.mainTopics && note.ai_generated_data.mainTopics.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Topics</h2>
                            <div className="flex flex-wrap gap-2">
                                {note.ai_generated_data.mainTopics.map((topic, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Items */}
                    {note.ai_generated_data.actionItems && note.ai_generated_data.actionItems.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Items</h2>
                            <ul className="space-y-2">
                                {note.ai_generated_data.actionItems.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold">•</span>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Study Questions */}
                    {note.ai_generated_data.studyQuestions && note.ai_generated_data.studyQuestions.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Questions</h2>
                            <div className="space-y-3">
                                {note.ai_generated_data.studyQuestions.map((question, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700">{question}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Quotes */}
                    {note.ai_generated_data.keyQuotes && note.ai_generated_data.keyQuotes.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Quotes</h2>
                            <div className="space-y-4">
                                {note.ai_generated_data.keyQuotes.map((quote, index) => (
                                    <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
                                        <p className="mb-2">"{quote.text}"</p>
                                        <footer className="text-sm text-gray-500">— {quote.context}</footer>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Concepts */}
                    {note.ai_generated_data.relatedConcepts && note.ai_generated_data.relatedConcepts.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Concepts</h2>
                            <div className="flex flex-wrap gap-2">
                                {note.ai_generated_data.relatedConcepts.map((concept, index) => (
                                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        {concept}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {note.ai_generated_data.tags && note.ai_generated_data.tags.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {note.ai_generated_data.tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Original Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Content</h2>
                <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                        {note.content}
                    </pre>
                </div>
            </div>

            {/* RAG Chat Interface */}
            {showRAGChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
                        <RAGChatInterface
                            noteId={note.id}
                            noteTitle={note.ai_generated_data?.title || note.title}
                            onClose={() => setShowRAGChat(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
