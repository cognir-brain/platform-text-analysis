// src/components/history/history-filters.jsx
'use client';

import { Calendar, Filter, SortDesc } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function HistoryFilters({ dateFilter, setDateFilter, sentimentFilter, setSentimentFilter, sortOrder, setSortOrder }) {
    return (
        <div className="flex gap-2 items-center">
            <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            Positive
                        </div>
                    </SelectItem>
                    <SelectItem value="negative">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            Negative
                        </div>
                    </SelectItem>
                    <SelectItem value="neutral">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            Neutral
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

// Helper function untuk mengekstrak sentiment dari item analisis
export const extractSentiment = (item) => {
    // Prioritaskan metadata.sentiment jika ada
    if (item.metadata?.sentiment) {
        return item.metadata.sentiment;
    }

    // Fallback ke response
    try {
        const response = typeof item.response === 'string'
            ? JSON.parse(item.response)
            : item.response;

        // Cek langsung di response.sentiment
        if (response.sentiment) {
            return response.sentiment;
        }

        // Cek di Sentiment Analysis
        if (response['Sentiment Analysis']) {
            const sentimentData = response['Sentiment Analysis'];
            const entries = Object.entries(sentimentData)
                .filter(([key]) => ['positive', 'negative', 'neutral'].includes(key))
                .sort(([, a], [, b]) => b - a);

            if (entries.length > 0) {
                return entries[0][0]; // Return key dari nilai tertinggi
            }
        }

        return 'unknown';
    } catch {
        return 'unknown';
    }
};