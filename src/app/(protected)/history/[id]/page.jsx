'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { getChatById, toggleBookmark } from '@/lib/chatService';
import AnalysisResult from '@/components/analysis/chart-group';
import SourceViewer from '@/components/analysis/source-viewer';

export default function HistoryDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('source'); // 'source', 'analysis'
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const result = await getChatById(id);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch analysis');
                }

                setAnalysis(result.data);
                setIsBookmarked(result.data.metadata?.bookmarked || false);
            } catch (error) {
                console.error('Error fetching analysis:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    const handleBookmark = async () => {
        try {
            const result = await toggleBookmark(id);
            if (result.success) {
                setIsBookmarked(result.bookmarked);
                setAnalysis(prev => ({
                    ...prev,
                    metadata: {
                        ...prev.metadata,
                        bookmarked: result.bookmarked
                    }
                }));
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-red-900 mb-2">Analysis Not Found</h2>
                        <p className="text-red-700 mb-4">
                            {error || 'The requested analysis could not be found.'}
                        </p>
                        <button
                            onClick={() => router.push('/history')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to History
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-50 border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/history')}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span className="hidden sm:inline">Back to History</span>
                            </button>

                            <div className="h-6 w-px bg-gray-300"></div>

                            <div>
                                <h1 className="font-semibold text-gray-900 truncate max-w-md">
                                    {analysis.metadata?.title ||
                                        analysis.metadata?.filename ||
                                        (analysis.question?.length > 50
                                            ? `${analysis.question.substring(0, 50)}...`
                                            : analysis.question) ||
                                        'Analysis Chart'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {formatDate(analysis.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Section Toggle */}
                            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveSection('source')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeSection === 'source'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Source View
                                </button>
                                <button
                                    onClick={() => setActiveSection('analysis')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeSection === 'analysis'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Analysis Chart
                                </button>
                            </div>

                            {/* Action Buttons */}
                            {/* <div className="flex items-center gap-2"> */}
                            <button
                                onClick={handleBookmark}
                                className={`p-2 ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-600 hover:text-gray-900'} hover:bg-gray-100 rounded-lg transition-colors`}
                                title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                            >
                                <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                            </button>
                            {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Share size={18} />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Download size={18} />
                                </button> */}
                            {/* </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Section Toggle */}
            <div className="md:hidden bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-1 py-3">
                        <button
                            onClick={() => setActiveSection('source')}
                            className={`flex-1 py-2 text-sm font-medium text-center rounded-lg transition-colors ${activeSection === 'source'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Source View
                        </button>
                        <button
                            onClick={() => setActiveSection('analysis')}
                            className={`flex-1 py-2 text-sm font-medium text-center rounded-lg transition-colors ${activeSection === 'analysis'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Analysis Chart
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {activeSection === 'source' && (
                    <div className="mb-8">
                        <SourceViewer analysis={analysis} />
                    </div>
                )}

                {activeSection === 'analysis' && analysis.response && (
                    <div className="mb-8">
                        <AnalysisResult data={analysis.response} />
                    </div>
                )}

                {/* Both sections on desktop */}
                <div className="hidden lg:block space-y-8">
                    {activeSection === 'source' && analysis.response && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Chart</h2>
                            <AnalysisResult data={analysis.response} />
                        </div>
                    )}

                    {activeSection === 'analysis' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Source Content</h2>
                            <SourceViewer analysis={analysis} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}