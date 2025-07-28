'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import {
    FileText,
    PlayCircle,
    Globe,
    Search,
    Filter,
    Plus,
    Calendar,
    Clock,
    Loader2,
    FolderPlus,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function NotesHistoryPage() {
    const router = useRouter();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadNotes();
    }, [page, filterType]);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const result = await notesService.getNotes(page, 20);

            if (result.success) {
                if (page === 1) {
                    setNotes(result.data.notes || []);
                } else {
                    setNotes(prev => [...prev, ...(result.data.notes || [])]);
                }
                setHasMore(result.data.has_more || false);
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
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

    const getSourceIconLarge = (sourceType) => {
        switch (sourceType) {
            case 'youtube':
                return (
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <PlayCircle className="h-6 w-6 text-red-600" />
                    </div>
                );
            case 'file':
                return (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-600" />
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="h-6 w-6 text-blue-600" />
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
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const formatDateDetailed = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = !searchTerm ||
            note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.ai_generated_data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.file_metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' || note.source_type === filterType;

        return matchesSearch && matchesFilter;
    });

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading notes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
                    <p className="text-gray-600 mt-1">
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <FolderPlus className="h-4 w-4" />
                        Create Folder
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="youtube">YouTube</option>
                            <option value="file">Files</option>
                            <option value="web">Web</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No notes found' : 'No notes yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Create your first AI note from YouTube videos, PDFs, or web content.'
                        }
                    </p>
                    <button
                        onClick={() => router.push('/notes')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create First Note
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Source Icon */}
                                    {getSourceIconLarge(note.source_type)}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/notes/${note.id}`}
                                                    className="group block"
                                                >
                                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {note.ai_generated_data?.title ||
                                                            note.file_metadata?.title ||
                                                            note.title ||
                                                            `Note ${note.id}`}
                                                    </h3>
                                                </Link>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    Created on {formatDateDetailed(note.created_at)}
                                                </p>

                                                {/* Summary or Description */}
                                                {note.ai_generated_data?.summary && (
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                        {note.ai_generated_data.summary}
                                                    </p>
                                                )}

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

                                                {/* Tags */}
                                                {note.ai_generated_data?.tags && note.ai_generated_data.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {note.ai_generated_data.tags.slice(0, 4).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {note.ai_generated_data.tags.length > 4 && (
                                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                                                +{note.ai_generated_data.tags.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Options Menu */}
                                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer metadata */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(note.created_at)}</span>
                                        </div>

                                        {note.file_metadata?.word_count && (
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                <span>{note.file_metadata.word_count} words</span>
                                            </div>
                                        )}

                                        {note.file_metadata?.duration && (
                                            <div className="flex items-center gap-1">
                                                <PlayCircle className="h-3 w-3" />
                                                <span>{note.file_metadata.duration}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Globe className="h-3 w-3" />
                                        <span className="capitalize">{note.language}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More */}
            {hasMore && filteredNotes.length > 0 && (
                <div className="text-center mt-8">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                            </span>
                        ) : (
                            'Load More Notes'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
