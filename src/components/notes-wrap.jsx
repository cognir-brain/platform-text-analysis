'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { NotesPage } from '@/components/notes';
import { RecentNotes } from '@/components/notes/recent-notes';
import { Clock, FileText, Youtube, Upload, ArrowRight } from 'lucide-react';


export default function NotesPageWrapper() {
    return (
        <div className="container mx-auto px-4">
            <NotesPage />

            <div className="max-w-4xl mx-auto mt-12 mb-8">
                <RecentNotes />
            </div>
        </div>
    );
}


export function RecentNotes() {
    const [recentNotes, setRecentNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch recent notes
        fetchRecentNotes();
    }, []);

    const fetchRecentNotes = async () => {
        try {
            const response = await fetch('/api/notes/recent');
            const data = await response.json();
            setRecentNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to fetch recent notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSourceIcon = (sourceType) => {
        switch (sourceType) {
            case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
            case 'file': return <Upload className="h-4 w-4 text-green-500" />;
            default: return <FileText className="h-4 w-4 text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notes</h2>
                <div className="grid gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-lg h-16"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!recentNotes.length) {
        return (
            <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No notes yet</h3>
                <p className="text-gray-500">Create your first AI note to get started.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Notes</h2>
                <Link
                    href="/notes/history"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                    View all
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid gap-3">
                {recentNotes.map((note) => (
                    <Link
                        key={note.id}
                        href={`/notes/${note.id}`}
                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                {getSourceIcon(note.sourceType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {note.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {note.summary}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {note.createdAt}
                                    </span>
                                    <span>{note.sourceType}</span>
                                    {note.language && (
                                        <span>{note.language}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}