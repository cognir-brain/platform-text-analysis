'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, Search, Filter } from 'lucide-react';
import { getChatHistory } from '@/lib/chatService';
import { useAuth } from '@/context/authContext';
import { HistoryCard } from '@/components/history/history-card';
import { HistoryFilters, extractSentiment } from '@/components/history/history-filters';
import { EmptyHistoryState } from '@/components/history/empty-state';
import { HistoryLoadingSkeleton } from '@/components/history/loading-skeleton';

export default function HistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [sentimentFilter, setSentimentFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadHistory();
    }, [user]);

    useEffect(() => {
        filterHistory();
    }, [history, searchQuery, dateFilter, sentimentFilter, sortOrder]);

    const loadHistory = async () => {
        try {
            const result = await getChatHistory();
            if (result.success) {
                const historyData = result.data || [];

                // Debug sentiment data
                console.log('History items with sentiment data:');
                historyData.forEach(item => {
                    const sentiment = extractSentiment(item);
                    console.log(`ID: ${item.id}, Sentiment: ${sentiment}, From metadata: ${item.metadata?.sentiment || 'N/A'}`);
                });

                setHistory(historyData);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterHistory = () => {
        let filtered = [...history];

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                JSON.stringify(item.response).toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by date
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter(item =>
                new Date(item.created_at) >= filterDate
            );
        }

        // Filter by sentiment
        if (sentimentFilter !== 'all') {
            filtered = filtered.filter(item => {
                const itemSentiment = extractSentiment(item);
                return itemSentiment.toLowerCase() === sentimentFilter.toLowerCase();
            });
        }

        // Sort by date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredHistory(filtered);
    };

    if (loading) {
        return <HistoryLoadingSkeleton />;
    }

    if (history.length === 0) {
        return <EmptyHistoryState />;
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
                <p className="text-muted-foreground">
                    View and manage your previous text analysis conversations
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                    />
                </div>

                <HistoryFilters
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    sentimentFilter={sentimentFilter}
                    setSentimentFilter={setSentimentFilter}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                />
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    {filteredHistory.length} of {history.length} conversations
                    {searchQuery && ` matching "${searchQuery}"`}
                    {sentimentFilter !== 'all' && ` with ${sentimentFilter} sentiment`}
                </p>
            </div>

            {/* History Grid */}
            <motion.div
                className="grid gap-4 md:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {filteredHistory.map((item, index) => (
                    <HistoryCard
                        key={item.id}
                        item={item}
                        index={index}
                        onDelete={() => {
                            setHistory(prev => prev.filter(h => h.id !== item.id));
                        }}
                    />
                ))}
            </motion.div>

            {filteredHistory.length === 0 && searchQuery && (
                <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search terms or filters
                    </p>
                </div>
            )}
        </div>
    );
}