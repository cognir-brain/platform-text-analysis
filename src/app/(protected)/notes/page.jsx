'use client'

import { useState, useRef } from "react";
import { RotateCcw, FileText, Upload, ArrowRight, Youtube, ChevronDown, PlayCircle, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { notesService } from '@/lib/notesService';
import { RecentNotes } from '@/components/recent-notes';

export function NotesPage() {
    // Core states
    const [inputText, setInputText] = useState('');
    const [language, setLanguage] = useState('indonesian');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Input method states
    const [activeTab, setActiveTab] = useState('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoData, setVideoData] = useState(null);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [isFileUploading, setIsFileUploading] = useState(false);

    // Refs & Router
    const fileInputRef = useRef(null);
    const router = useRouter();

    // Language options
    const languageOptions = [
        { value: 'indonesian', label: 'Bahasa Indonesia', flag: '🇮🇩' },
        { value: 'english', label: 'English', flag: '🇺🇸' },
        { value: 'arab', label: 'العربية', flag: '🇸🇦' }
    ];

    // YouTube Processing Handler
    const handleYouTubeProcess = async () => {
        if (!youtubeUrl.trim()) return;

        setIsVideoLoading(true);
        setError(null);

        try {
            const result = await notesService.processYouTube(youtubeUrl.trim());

            if (!result.success) {
                throw new Error(result.error || 'Failed to process YouTube video');
            }

            setVideoData(result.data);
            setInputText(result.data.transcript);

        } catch (error) {
            setError(error.message);
        } finally {
            setIsVideoLoading(false);
        }
    };

    // File Upload Handler
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please select a PDF, TXT, or DOC file only');
            return;
        }

        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            setError('File size must be less than 10MB');
            return;
        }

        setIsFileUploading(true);
        setError(null);

        try {
            const result = await notesService.uploadFile(file);

            if (!result.success) {
                throw new Error(result.error);
            }

            setFileData(result.data);
            setInputText(result.data.text);

        } catch (error) {
            setError(error.message);
        }
    };

    // Main Notes Generation Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const text = inputText.trim();

        if (text.length < 50) {
            setError('Content is too short for meaningful notes. Please provide more content.');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Starting notes generation with language:', language);

            // Prepare request body for Go backend
            let noteData = {
                title: `Notes from ${activeTab}`,
                content: text,
                language,
                source_type: activeTab,
                metadata: {}
            };

            // Add source metadata
            if (videoData) {
                noteData.metadata = {
                    type: 'youtube',
                    video_id: videoData.videoId,
                    title: videoData.title,
                    duration: videoData.duration,
                    url: youtubeUrl,
                    word_count: videoData.wordCount
                };
            } else if (fileData) {
                noteData.metadata = {
                    type: 'file',
                    filename: fileData.filename,
                    file_size: fileData.fileSize,
                    file_type: fileData.fileType,
                    word_count: fileData.wordCount
                };
            }

            // Send to Go backend directly
            const result = await notesService.createNote(noteData);

            if (!result.success) {
                throw new Error(result.error || 'Notes generation failed.');
            }

            // Redirect to notes result page
            router.push(`/notes/${result.data.id}`);

        } catch (error) {
            setError(error.message);
            console.error('Notes generation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const toggleLanguageDropdown = () => setShowLanguageDropdown(!showLanguageDropdown);

    const hasContent = videoData || fileData;

    return (
        <div className="max-w-4xl w-full mx-auto my-20">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Notes</h1>
                <p className="text-gray-600">Transform YouTube videos and documents into comprehensive AI-powered notes</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Header with Tabs */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        {/* Tab Navigation */}
                        <div className="flex bg-gray-50 rounded-lg p-1">
                            <button
                                onClick={() => {
                                    setActiveTab('youtube');
                                    setFileData(null);
                                    setInputText('');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'youtube'
                                    ? 'bg-white text-red-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Youtube className="h-4 w-4" />
                                YouTube Video
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('file');
                                    setVideoData(null);
                                    setInputText('');
                                    setYoutubeUrl('');
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'file'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                Upload Document
                            </button>
                        </div>

                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={toggleLanguageDropdown}
                                className="inline-flex items-center gap-2 bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {languageOptions.find(opt => opt.value === language)?.flag}
                                <span className="hidden sm:inline">
                                    {languageOptions.find(opt => opt.value === language)?.label}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {showLanguageDropdown && (
                                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[200px]">
                                    {languageOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${language === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                }`}
                                            onClick={() => {
                                                setLanguage(option.value);
                                                setShowLanguageDropdown(false);
                                            }}
                                        >
                                            <span className="inline-block w-6">{option.flag}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Input Areas */}
                    {activeTab === 'youtube' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    YouTube Video URL
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="url"
                                            value={youtubeUrl}
                                            onChange={(e) => setYoutubeUrl(e.target.value)}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleYouTubeProcess}
                                        disabled={!youtubeUrl.trim() || isVideoLoading}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isVideoLoading ? (
                                            <>
                                                <RotateCcw className="h-4 w-4 animate-spin inline mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Process Video"
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Video Preview */}
                            {videoData && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <PlayCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-red-900">{videoData.title}</h3>
                                            <div className="text-sm text-red-700 flex flex-wrap gap-x-4 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {videoData.duration}
                                                </span>
                                                {videoData.channelTitle && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {videoData.channelTitle}
                                                    </span>
                                                )}
                                                <span>{videoData.wordCount} words</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setVideoData(null);
                                                setInputText('');
                                                setYoutubeUrl('');
                                            }}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'file' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Document
                                </label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
                                    {!fileData ? (
                                        <>
                                            <FileText className="h-12 w-12 text-gray-400 mb-4" />
                                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                                Select a document
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-4 text-center">
                                                Upload PDF, TXT, or DOC files (max 10MB)
                                            </p>
                                            <label
                                                htmlFor="file-upload"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                            </label>
                                            <input
                                                id="file-upload"
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.txt,.doc,.docx"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            {isFileUploading && (
                                                <div className="mt-4 text-sm text-gray-600 flex items-center">
                                                    <RotateCcw className="h-4 w-4 animate-spin mr-2" />
                                                    Processing document...
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-green-900">{fileData.filename}</h3>
                                                        <div className="text-sm text-green-700 flex flex-wrap gap-x-4 mt-1">
                                                            <span>{fileData.fileType}</span>
                                                            <span>{fileData.wordCount} words</span>
                                                            <span>~{fileData.readingTime} min read</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setFileData(null);
                                                            setInputText('');
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = '';
                                                            }
                                                        }}
                                                        className="text-green-600 hover:text-green-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                                    {error}
                                </div>
                            )}
                            {!error && !hasContent && (
                                <div className="text-sm text-gray-500">
                                    {activeTab === 'youtube'
                                        ? 'Enter YouTube URL to get started'
                                        : 'Upload a document to get started'
                                    }
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!hasContent || isLoading}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${hasContent && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                    Generating Notes...
                                </>
                            ) : (
                                <>
                                    Generate AI Notes
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Notes Section */}
            <div className="mt-8">
                <RecentNotes />
            </div>
        </div>
    );
}

export default NotesPage;