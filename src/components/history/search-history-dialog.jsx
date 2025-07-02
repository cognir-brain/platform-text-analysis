'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Clock, Trash2, MessageSquare, FileText, Bookmark, LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAnalysisHistory, deleteAnalysis, getBookmarkedAnalyses } from '@/lib/chatService';
import { useAuth } from '@/context/authContext';

export function SearchHistoryDialog() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [analyses, setAnalyses] = useState([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'bookmarked'
    const [bookmarkedAnalyses, setBookmarkedAnalyses] = useState([]);
    const searchInputRef = useRef(null);

    // Load history ketika dialog dibuka
    useEffect(() => {
        if (open && user) {
            loadHistory();
            if (activeTab === 'bookmarked') {
                loadBookmarkedHistory();
            }
        }
    }, [open, user, activeTab]);

    // Filter analyses berdasarkan search query
    useEffect(() => {
        const analysesToFilter = activeTab === 'all' ? analyses : bookmarkedAnalyses;

        if (!searchQuery.trim()) {
            setFilteredAnalyses(analysesToFilter);
        } else {
            const filtered = analysesToFilter.filter(analysis =>
                analysis.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (typeof analysis.response === 'string'
                    ? analysis.response.toLowerCase().includes(searchQuery.toLowerCase())
                    : JSON.stringify(analysis.response).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
            setFilteredAnalyses(filtered);
        }
    }, [searchQuery, analyses, bookmarkedAnalyses, activeTab]);

    // Focus search input ketika dialog dibuka
    useEffect(() => {
        if (open && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const result = await getAnalysisHistory();
            console.log('dialog=>', result)
            if (result.success) {
                setAnalyses(result.data || []);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBookmarkedHistory = async () => {
        setLoading(true);
        try {
            const result = await getBookmarkedAnalyses();
            if (result.success) {
                setBookmarkedAnalyses(result.data || []);
            }
        } catch (error) {
            console.error('Error loading bookmarked history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteAnalysis(id);
            if (result.success) {
                setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
                setBookmarkedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
            }
        } catch (error) {
            console.error('Error deleting analysis:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const highlightText = (text, query) => {
        if (!query.trim()) return text;

        // Pastikan text adalah string
        const safeText = typeof text === 'string' ? text : String(text);

        const parts = safeText.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 rounded px-1">
                    {part}
                </mark>
            ) : part
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search history</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-white dark:bg-gray-900">
                <DialogHeader className="px-6 py-4 border-b bg-white dark:bg-gray-900">
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search History
                    </DialogTitle>
                </DialogHeader>

                {/* Tambahkan tabs untuk All dan Bookmarked */}
                <div className="px-6 pt-2 bg-white dark:bg-gray-900 border-b">
                    <div className="flex space-x-4 -mb-px">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            All History
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('bookmarked');
                                loadBookmarkedHistory();
                            }}
                            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'bookmarked'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Bookmark className="h-4 w-4" />
                            Bookmarked
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b bg-white dark:bg-gray-900">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search your conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-96 bg-white dark:bg-gray-900">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredAnalyses.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            {searchQuery ? (
                                <div>
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No conversations found for "{searchQuery}"</p>
                                </div>
                            ) : analyses.length === 0 ? (
                                <div>
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm">Start a new analysis to see your history here</p>
                                </div>
                            ) : (
                                <div>
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Your conversations will appear here</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-2">
                            <AnimatePresence>
                                {filteredAnalyses.map((analysis, index) => (
                                    <motion.div
                                        key={analysis.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative p-4 hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <Link
                                            href={`/history/${analysis.id}`}
                                            onClick={() => setOpen(false)}
                                            className="block"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {/* Source Icon */}
                                                        {analysis.metadata?.source === 'pdf' && (
                                                            <FileText className="h-4 w-4 text-red-600" />
                                                        )}
                                                        {analysis.metadata?.source === 'url' && (
                                                            <LinkIcon className="h-4 w-4 text-blue-600" />
                                                        )}
                                                        {!analysis.metadata?.source && (
                                                            <MessageSquare className="h-4 w-4 text-gray-600" />
                                                        )}

                                                        {/* Bookmark indikator */}
                                                        {analysis.metadata?.bookmarked && (
                                                            <Bookmark className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                        )}

                                                        <h4 className="font-medium text-sm line-clamp-2 leading-relaxed text-gray-900 dark:text-gray-100">
                                                            {highlightText(
                                                                analysis.metadata?.filename ||
                                                                analysis.metadata?.title ||
                                                                (analysis.question?.length > 80
                                                                    ? `${analysis.question.substring(0, 80)}...`
                                                                    : analysis.question) || 'Untitled Analysis',
                                                                searchQuery
                                                            )}
                                                        </h4>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {analysis.metadata?.source === 'pdf' && (
                                                            <span className="text-red-600">PDF • {analysis.metadata.pages} pages • </span>
                                                        )}
                                                        {analysis.metadata?.source === 'url' && (
                                                            <span className="text-blue-600">{analysis.metadata.siteName} • </span>
                                                        )}
                                                        {/* Tambahkan highlightText untuk respons */}
                                                        {highlightText(
                                                            typeof analysis.response === 'string'
                                                                ? analysis.response
                                                                : JSON.stringify(analysis.response),
                                                            searchQuery
                                                        )}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(analysis.created_at)}
                                                        </span>
                                                        {analysis.metadata?.wordCount && (
                                                            <>
                                                                <span className="text-xs text-muted-foreground">•</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {analysis.metadata.wordCount} words
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDelete(analysis.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {filteredAnalyses.length > 0 && (
                    <div className="px-6 py-3 border-t bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                            {filteredAnalyses.length} of {activeTab === 'all' ? analyses.length : bookmarkedAnalyses.length} conversations
                            {searchQuery && ` matching "${searchQuery}"`}
                            {activeTab === 'bookmarked' && ' (bookmarked)'}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}