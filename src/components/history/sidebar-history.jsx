'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
} from '@/components/ui/sidebar-chat';
import { AnalysisItem } from './sidebar-history-item';
import { getAnalysisHistory, deleteAnalysis } from '@/lib/chatService';

const groupAnalysisByDate = (analyses) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    return analyses.reduce(
        (groups, analysis) => {
            const analysisDate = new Date(analysis.created_at);
            const analysisDateOnly = new Date(analysisDate.getFullYear(), analysisDate.getMonth(), analysisDate.getDate());

            if (analysisDateOnly.getTime() === today.getTime()) {
                groups.today.push(analysis);
            } else if (analysisDateOnly.getTime() === yesterday.getTime()) {
                groups.yesterday.push(analysis);
            } else if (analysisDate > lastWeek) {
                groups.lastWeek.push(analysis);
            } else if (analysisDate > lastMonth) {
                groups.lastMonth.push(analysis);
            } else {
                groups.older.push(analysis);
            }

            return groups;
        },
        {
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        }
    );
};

export function SidebarHistory({ user, type = 'all', limit = 10 }) {
    const { id } = useParams();
    const router = useRouter();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            // Gunakan getAnalysisHistory yang sudah diperbaiki
            const result = await getAnalysisHistory();
            if (result.success) {
                setAnalyses(result.data || []);
            } else {
                console.error('Failed to load history:', result.error);
                // Fallback ke getChatHistory jika diperlukan
                const chatResult = await getChatHistory();
                if (chatResult.success) {
                    setAnalyses(chatResult.data || []);
                }
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteAnalysis(deleteId);
            if (result.success) {
                setAnalyses(prev => prev.filter(analysis => analysis.id !== deleteId));

                // Redirect to home if current analysis is deleted
                if (deleteId === id) {
                    router.push('/analysis');
                }
            }
        } catch (error) {
            console.error('Error deleting analysis:', error);
        } finally {
            setShowDeleteDialog(false);
            setDeleteId(null);
        }
    };

    // Filter berdasarkan type
    const filteredHistory = useMemo(() => {
        if (type === 'all') return analyses;
        if (type === 'analysis') return analyses.filter(item => item.type === 'analysis');
        if (type === 'notes') return analyses.filter(item => item.type === 'notes');
        return analyses;
    }, [analyses, type]);

    // Limit hasil
    const limitedHistory = useMemo(() => {
        return filteredHistory.slice(0, limit);
    }, [filteredHistory, limit]);

    if (!user) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Login to save and revisit previous analyses!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (loading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                    History
                </div>
                <SidebarGroupContent>
                    <div className="flex flex-col gap-2">
                        {[44, 32, 28, 64, 52].map((item, index) => (
                            <div
                                key={index}
                                className="rounded-md h-8 flex gap-2 px-2 items-center"
                            >
                                <div
                                    className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                                    style={{
                                        '--skeleton-width': `${item}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (analyses.length === 0) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                    History
                </div>
                <SidebarGroupContent>
                    <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
                        Your analysis history will appear here once you start analyzing text!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    const groupedAnalyses = groupAnalysisByDate(analyses);

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <div className="flex flex-col gap-4">
                            {groupedAnalyses.today.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Today
                                    </div>
                                    {groupedAnalyses.today.map((analysis) => (
                                        <AnalysisItem
                                            key={analysis.id}
                                            analysis={analysis}
                                            isActive={analysis.id === parseInt(id)}
                                            onDelete={(analysisId) => {
                                                setDeleteId(analysisId);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedAnalyses.yesterday.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Yesterday
                                    </div>
                                    {groupedAnalyses.yesterday.map((analysis) => (
                                        <AnalysisItem
                                            key={analysis.id}
                                            analysis={analysis}
                                            isActive={analysis.id === parseInt(id)}
                                            onDelete={(analysisId) => {
                                                setDeleteId(analysisId);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedAnalyses.lastWeek.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Last 7 days
                                    </div>
                                    {groupedAnalyses.lastWeek.map((analysis) => (
                                        <AnalysisItem
                                            key={analysis.id}
                                            analysis={analysis}
                                            isActive={analysis.id === parseInt(id)}
                                            onDelete={(analysisId) => {
                                                setDeleteId(analysisId);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedAnalyses.lastMonth.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Last 30 days
                                    </div>
                                    {groupedAnalyses.lastMonth.map((analysis) => (
                                        <AnalysisItem
                                            key={analysis.id}
                                            analysis={analysis}
                                            isActive={analysis.id === parseInt(id)}
                                            onDelete={(analysisId) => {
                                                setDeleteId(analysisId);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedAnalyses.older.length > 0 && (
                                <div>
                                    <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                                        Older than last month
                                    </div>
                                    {groupedAnalyses.older.map((analysis) => (
                                        <AnalysisItem
                                            key={analysis.id}
                                            analysis={analysis}
                                            isActive={analysis.id === parseInt(id)}
                                            onDelete={(analysisId) => {
                                                setDeleteId(analysisId);
                                                setShowDeleteDialog(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            analysis and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}