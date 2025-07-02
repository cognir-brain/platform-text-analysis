'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react';
import { deleteChat } from '@/lib/chatService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function HistoryCard({ item, index, onDelete }) {
    // Inisialisasi metadata jika tidak ada
    if (!item.metadata) {
        item.metadata = {};
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const result = await deleteChat(item.id);
            if (result.success) {
                onDelete();
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
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
        return date.toLocaleDateString();
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'positive':
                return 'text-green-600 bg-green-50';
            case 'negative':
                return 'text-red-600 bg-red-50';
            case 'neutral':
                return 'text-gray-600 bg-gray-200';
            default:
                return 'text-blue-600 bg-blue-50';
        }
    };

    const getResponsePreview = () => {
        try {
            // Parse response jika berbentuk string
            const response = typeof item.response === 'string'
                ? JSON.parse(item.response)
                : item.response;

            // Prioritaskan sentiment dari metadata
            if (item.metadata?.sentiment) {
                return {
                    sentiment: item.metadata.sentiment,
                    summary: response.summary ||
                        response['Summary Generation'] ||
                        'Analysis completed'
                };
            }

            // Fallback ke response untuk sentiment
            return {
                sentiment: response.sentiment ||
                    getSentimentFromData(response['Sentiment Analysis']) ||
                    'Unknown',
                summary: response.summary ||
                    response['Summary Generation'] ||
                    'Analysis completed'
            };
        } catch (error) {
            console.error('Error parsing response:', error);
            return {
                sentiment: 'Unknown',
                summary: 'Analysis completed'
            };
        }
    };

    const getSentimentFromData = (sentimentData) => {
        if (!sentimentData) return 'Unknown';

        try {
            const entries = Object.entries(sentimentData)
                .filter(([key]) => ['positive', 'negative', 'neutral'].includes(key))
                .sort(([, a], [, b]) => b - a);

            if (entries.length > 0) {
                return entries[0][0]; // Return key dari nilai tertinggi
            }

            return 'neutral';
        } catch {
            return 'Unknown';
        }
    };

    const responseData = getResponsePreview();

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200"
            >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">

                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSentimentColor(responseData.sentiment)}`}>
                            {responseData.sentiment.charAt(0).toUpperCase() + responseData.sentiment.slice(1)}
                        </span>
                    </div>

                    {/* Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded">
                            <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/history/${item.id}`} className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Question */}
                <Link href={`/history/${item.id}`} className="block">
                    <h3 className="font-medium text-lg mb-3 line-clamp-2 hover:text-primary transition-colors">
                        {/* Judul akan dibatasi maksimal 2 baris */}
                        {item.metadata?.title ||
                            item.metadata?.filename ||
                            (item.question?.length > 100
                                ? `${item.question.substring(0, 100)}...`
                                : item.question) || 'Untitled Analysis'}
                    </h3>

                    {/* Response Preview - Tanpa informasi source */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {/* Deskripsi akan dibatasi maksimal 3 baris */}
                        {responseData.summary.length > 150
                            ? `${responseData.summary.substring(0, 150)}...`
                            : responseData.summary}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(item.created_at)}</span>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}