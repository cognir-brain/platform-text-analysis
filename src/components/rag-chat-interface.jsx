'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Brain, Lightbulb, Search, AlertCircle } from 'lucide-react';
import { notesService } from '@/lib/notesService';

export default function RAGChatInterface({ noteId, noteTitle, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ragStatus, setRAGStatus] = useState(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        initializeRAGChat();
    }, [noteId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const initializeRAGChat = async () => {
        try {
            setIsLoading(true);

            // Check RAG status
            const status = await notesService.getRAGStatus(noteId);
            setRAGStatus(status);

            // Process note for RAG if not already processed
            if (!status.rag_processed) {
                console.log('Processing note for RAG...');
                await notesService.processNoteForRAG(noteId);

                // Update status
                const updatedStatus = await notesService.getRAGStatus(noteId);
                setRAGStatus(updatedStatus);
            }

            // Load suggested questions
            await loadSuggestedQuestions();

            // Add welcome message
            setMessages([{
                id: 1,
                role: 'assistant',
                content: `Halo! Saya siap membantu Anda berdiskusi tentang "${noteTitle}". Silakan ajukan pertanyaan apapun tentang catatan ini, atau pilih salah satu pertanyaan yang disarankan di bawah.`,
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error('Error initializing RAG chat:', error);
            setMessages([{
                id: 1,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat mempersiapkan chat. Silakan coba lagi.',
                timestamp: new Date(),
                error: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSuggestedQuestions = async () => {
        try {
            setLoadingSuggestions(true);
            const result = await notesService.getSuggestedQuestions(noteId);

            if (result.success) {
                setSuggestedQuestions(result.questions || []);
            }
        } catch (error) {
            console.error('Error loading suggested questions:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const sendMessage = async (message = inputMessage) => {
        if (!message.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Get chat history
            const chatHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Send to RAG chat
            const response = await notesService.ragChatWithNote(
                noteId,
                message,
                chatHistory
            );

            if (response.success) {
                const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.response,
                    timestamp: new Date(),
                    sources: response.data.sources_count,
                    context: response.data.context
                };

                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error('Failed to get RAG response');
            }

        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.',
                timestamp: new Date(),
                error: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const useSuggestedQuestion = (question) => {
        setInputMessage(question);
        sendMessage(question);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">RAG Chat</h3>
                        <p className="text-xs text-gray-500">{noteTitle}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* RAG Status */}
            {ragStatus && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        {ragStatus.rag_processed ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>RAG Ready</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span>Processing for RAG...</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : message.error
                                        ? 'bg-red-50 text-red-800 border border-red-200'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                            {message.sources > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Search className="h-3 w-3" />
                                        <span>{message.sources} sumber konteks digunakan</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-1 text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && messages.length <= 1 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">Pertanyaan yang Disarankan:</span>
                    </div>

                    {loadingSuggestions ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading suggestions...</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {suggestedQuestions.slice(0, 3).map((q, index) => (
                                <button
                                    key={index}
                                    onClick={() => useSuggestedQuestion(q.question)}
                                    className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                >
                                    • {q.question}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tanyakan sesuatu tentang catatan ini..."
                        className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
