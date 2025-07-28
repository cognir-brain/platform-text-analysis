'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import { CheckCircle, XCircle, RefreshCw, Clock, Award, Loader2 } from 'lucide-react';

export default function QuizPage() {
    const params = useParams();
    const [note, setNote] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchNote();
            loadQuiz();
        }
    }, [params.id]);

    useEffect(() => {
        let interval;
        if (quizStarted && !showResults) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [quizStarted, showResults]);

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

    const loadQuiz = async () => {
        try {
            setLoading(true);
            // TODO: Load existing quiz from database
            // For now, generate sample quiz
            generateQuiz();
        } catch (error) {
            console.error('Failed to load quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateQuiz = async () => {
        setGenerating(true);
        try {
            // TODO: Implement API call to generate quiz
            // For now, create sample questions
            const sampleQuestions = [
                {
                    id: 1,
                    question: "What is the main topic discussed in this content?",
                    options: [
                        "The fundamental concepts and principles",
                        "Advanced theoretical frameworks",
                        "Practical implementation strategies",
                        "Historical background information"
                    ],
                    correctAnswer: 0,
                    explanation: "The content primarily focuses on fundamental concepts and principles as established in the introduction."
                },
                {
                    id: 2,
                    question: "Which of the following is a key takeaway from the material?",
                    options: [
                        "Complex systems require simple solutions",
                        "Understanding basics is crucial for mastery",
                        "Theory is more important than practice",
                        "All approaches are equally effective"
                    ],
                    correctAnswer: 1,
                    explanation: "The material emphasizes that understanding basic principles is essential before moving to advanced topics."
                },
                {
                    id: 3,
                    question: "How should this information be applied in practice?",
                    options: [
                        "By memorizing all details",
                        "By following a structured approach",
                        "By skipping foundational steps",
                        "By focusing only on outcomes"
                    ],
                    correctAnswer: 1,
                    explanation: "The content suggests following a structured, step-by-step approach for best results."
                }
            ];

            setQuestions(sampleQuestions);
        } catch (error) {
            console.error('Failed to generate quiz:', error);
        } finally {
            setGenerating(false);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
        setTimeElapsed(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
    };

    const selectAnswer = (questionId, answerIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }));
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const finishQuiz = () => {
        setShowResults(true);
        setQuizStarted(false);
    };

    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowResults(false);
        setTimeElapsed(0);
        setQuizStarted(false);
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach(question => {
            if (selectedAnswers[question.id] === question.correctAnswer) {
                correct++;
            }
        });
        return {
            correct,
            total: questions.length,
            percentage: Math.round((correct / questions.length) * 100)
        };
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                    <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Available</h3>
                    <p className="text-gray-600 mb-4">
                        Generate a quiz from your notes to test your knowledge.
                    </p>
                    <button
                        onClick={generateQuiz}
                        disabled={generating}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </span>
                        ) : (
                            'Generate Quiz'
                        )}
                    </button>
                </div>
            </div>
        );
    }

    if (showResults) {
        const score = calculateScore();
        return (
            <div className="max-w-4xl mx-auto">
                {/* Results Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
                    <div className="mb-4">
                        <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            {score.percentage}%
                        </div>
                        <p className="text-gray-600">
                            You got {score.correct} out of {score.total} questions correct
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Time: {formatTime(timeElapsed)}</span>
                        </div>
                    </div>

                    <button
                        onClick={restartQuiz}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Take Quiz Again
                    </button>
                </div>

                {/* Question Review */}
                <div className="space-y-4">
                    {questions.map((question, index) => {
                        const userAnswer = selectedAnswers[question.id];
                        const isCorrect = userAnswer === question.correctAnswer;

                        return (
                            <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 mb-3">
                                            {index + 1}. {question.question}
                                        </h3>

                                        <div className="space-y-2 mb-4">
                                            {question.options.map((option, optionIndex) => (
                                                <div
                                                    key={optionIndex}
                                                    className={`p-3 rounded-lg border ${optionIndex === question.correctAnswer
                                                            ? 'border-green-200 bg-green-50'
                                                            : optionIndex === userAnswer && !isCorrect
                                                                ? 'border-red-200 bg-red-50'
                                                                : 'border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            {String.fromCharCode(65 + optionIndex)}.
                                                        </span>
                                                        <span className="text-sm">{option}</span>
                                                        {optionIndex === question.correctAnswer && (
                                                            <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                                        )}
                                                        {optionIndex === userAnswer && !isCorrect && (
                                                            <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
                                            <p className="text-sm text-blue-800">{question.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="mb-6">
                        <Award className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Test Your Knowledge?</h2>
                        <p className="text-gray-600">
                            This quiz contains {questions.length} questions based on your notes.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Quiz Details:</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• {questions.length} multiple choice questions</p>
                            <p>• No time limit</p>
                            <p>• You can review and change answers</p>
                            <p>• Detailed explanations provided</p>
                        </div>
                    </div>

                    <button
                        onClick={startQuiz}
                        className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-medium text-lg"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Quiz</h2>
                        <p className="text-sm text-gray-500">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(timeElapsed)}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => selectAnswer(currentQuestion.id, index)}
                            className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedAnswers[currentQuestion.id] === index
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswers[currentQuestion.id] === index
                                        ? 'border-purple-500 bg-purple-500'
                                        : 'border-gray-300'
                                    }`}>
                                    {selectedAnswers[currentQuestion.id] === index && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </div>
                                <span className="font-medium text-gray-700">
                                    {String.fromCharCode(65 + index)}.
                                </span>
                                <span className="text-gray-700">{option}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="text-sm text-gray-500">
                        {Object.keys(selectedAnswers).length} of {questions.length} answered
                    </div>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={finishQuiz}
                            className="px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                        >
                            Finish Quiz
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
