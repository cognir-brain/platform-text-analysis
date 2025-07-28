'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import { ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function FlashcardsPage() {
    const params = useParams();
    const [note, setNote] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchNote();
            loadFlashcards();
        }
    }, [params.id]);

    const fetchNote = async () => {
        try {
            const result = await notesService.getNote(params.id);
            if (result.success) {
                setNote(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch note:', error);
        }
    };

    const loadFlashcards = async () => {
        try {
            setLoading(true);
            // TODO: Load existing flashcards from database
            // For now, generate sample flashcards based on note content
            generateFlashcards();
        } catch (error) {
            console.error('Failed to load flashcards:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateFlashcards = async () => {
        setGenerating(true);
        try {
            // TODO: Implement API call to generate flashcards
            // For now, create sample flashcards
            const sampleFlashcards = [
                {
                    id: 1,
                    question: "What is the main topic of this content?",
                    answer: "This content covers various aspects of the subject matter discussed in your notes.",
                    difficulty: "easy"
                },
                {
                    id: 2,
                    question: "What are the key points mentioned?",
                    answer: "The key points include the main concepts and important details that were highlighted.",
                    difficulty: "medium"
                },
                {
                    id: 3,
                    question: "How can this information be applied?",
                    answer: "This information can be applied in practical scenarios as discussed in the content.",
                    difficulty: "hard"
                }
            ];

            setFlashcards(sampleFlashcards);
        } catch (error) {
            console.error('Failed to generate flashcards:', error);
        } finally {
            setGenerating(false);
        }
    };

    const nextCard = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowAnswer(false);
        }
    };

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    const resetCards = () => {
        setCurrentIndex(0);
        setShowAnswer(false);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <RefreshCw className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Flashcards Available</h3>
                    <p className="text-gray-600 mb-4">
                        Generate flashcards from your notes to start studying.
                    </p>
                    <button
                        onClick={generateFlashcards}
                        disabled={generating}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </span>
                        ) : (
                            'Generate Flashcards'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Flashcards</h2>
                        <p className="text-sm text-gray-500">
                            Study with {flashcards.length} flashcards from your notes
                        </p>
                    </div>
                    <button
                        onClick={generateFlashcards}
                        disabled={generating}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                        {currentIndex + 1} of {flashcards.length}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Flashcard */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                        {currentCard.difficulty}
                    </span>
                    <button
                        onClick={toggleAnswer}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {!showAnswer ? (
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                {currentCard.question}
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Answer</h3>
                            <p className="text-xl text-gray-700 leading-relaxed">
                                {currentCard.answer}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center pt-6">
                    <button
                        onClick={toggleAnswer}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        {showAnswer ? 'Hide Answer' : 'Reveal Answer'}
                    </button>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={resetCards}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={currentIndex === flashcards.length - 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
