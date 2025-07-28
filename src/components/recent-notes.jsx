'use client';

import { useState, useEffect } from 'react';
import { notesService } from '@/lib/notesService';
import { PlayCircle, FileText, Globe, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function RecentNotes() {
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentNotes();
    }, []);

    const loadRecentNotes = async () => {
        try {
            setLoading(true);
            const result = await notesService.getNotes(1, 6); // Get latest 6 notes

            if (result.success) {
                setRecentNotes(result.data.notes || []);
            }
        } catch (error) {
            console.error('Failed to load recent notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSourceIcon = (sourceType) => {
        switch (sourceType) {
            case 'youtube':
                return <PlayCircle className="h-4 w-4 text-red-500" />;
            case 'file':
                return <FileText className="h-4 w-4 text-green-500" />;
            default:
                return <Globe className="h-4 w-4 text-blue-500" />;
        }
    };

    const getSourceIconLarge = (sourceType) => {
        switch (sourceType) {
            case 'youtube':
                return (
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PlayCircle className="h-4 w-4 text-red-600" />
                    </div>
                );
            case 'file':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-green-600" />
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) {
            return 'Today';
        } else if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                </div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (recentNotes.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                </div>
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No notes created yet</p>
                    <p className="text-xs text-gray-400 mt-1">Your recent notes will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
                <Link
                    href="/notes/history"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View all
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="space-y-3">
                {recentNotes.map((note) => (
                    <Link
                        key={note.id}
                        href={`/notes/${note.id}`}
                        className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                    >
                        <div className="flex items-start gap-3">
                            {getSourceIconLarge(note.source_type)}

                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                                    {note.ai_generated_data?.title ||
                                        note.file_metadata?.title ||
                                        note.title ||
                                        `Note ${note.id}`}
                                </h4>

                                <p className="text-xs text-gray-500 mt-1">
                                    Created on {formatDate(note.created_at)}
                                </p>

                                {/* Source specific info */}
                                {note.source_type === 'youtube' && note.file_metadata?.title && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                        🎥 {note.file_metadata.title}
                                    </p>
                                )}

                                {note.source_type === 'file' && note.file_metadata?.filename && (
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                        📄 {note.file_metadata.filename}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                {note.file_metadata?.word_count && (
                                    <span>{note.file_metadata.word_count} words</span>
                                )}
                                <Clock className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
