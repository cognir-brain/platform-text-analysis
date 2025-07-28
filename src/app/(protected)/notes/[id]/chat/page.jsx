'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { notesService } from '@/lib/notesService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatPage() {
    const params = useParams();
    const [note, setNote] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (params.id) {
            fetchNote();
            loadChatHistory();
        }
    }, [params.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

    const loadChatHistory = async () => {
        try {
            setLoading(true);
            // TODO: Implement chat history loading from database
            // For now, add a welcome message
            setMessages([
                {
                    id: 'welcome',
                    type: 'bot',
                    content: 'Hi! I\'m here to help you understand your notes better. Feel free to ask me anything about the content!',
                    timestamp: new Date().toISOString()
                }
            ]);
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: newMessage.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setSending(true);

        try {
            const response = await notesService.chatWithNote(params.id, userMessage.content);

            if (response.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: response.data.response,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(response.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error while processing your message. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            {/* Chat Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                        <p className="text-sm text-gray-500">
                            Ask questions about: {note?.ai_generated_data?.title || note?.title || 'your notes'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.type === 'bot' && (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                            )}

                            <div className={`max-w-[70%] ${message.type === 'user' ? 'order-1' : ''}`}>
                                <div
                                    className={`rounded-lg p-3 ${message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                </div>
                                <p className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'
                                    }`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>

                            {message.type === 'user' && (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                                    <User className="w-4 h-4 text-green-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {sending && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                    <span className="text-sm text-gray-600">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Ask a question about your notes..."
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!newMessage.trim() || sending
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
