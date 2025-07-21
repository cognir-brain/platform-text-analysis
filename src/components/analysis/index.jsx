'use client'

import { useState, useRef } from "react";
import { RotateCcw, FileText, Upload, ArrowRight, ExternalLink, MessageSquare, Globe, ChevronDown } from "lucide-react";
import { saveChat } from "@/lib/chatService";
import { useRouter } from "next/navigation";

export function Dashboard() {
  // Core states
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('indonesian');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input method states
  const [activeTab, setActiveTab] = useState('text');
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  // Refs & Router
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Language options
  const languageOptions = [
    { value: 'indonesian', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'arab', label: 'العربية', flag: '🇸🇦' }
  ];

  // PDF Upload Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file only');
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsPdfUploading(true);
    setError(null);

    try {
      // Process PDF for text extraction
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to process PDF');
      }

      // Convert file to base64 for Gemini analysis
      const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      };

      const base64File = await fileToBase64(file);

      // Store both extracted text AND original file reference
      setPdfData({
        ...result.data,
        originalFile: base64File, // For Gemini analysis
        fileObject: file // For PDF viewer (will be saved after analysis)
      });

      setQuestion(result.data.text);
      setActiveTab('text');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      setError(error.message);
      console.error('PDF upload error:', error);
    } finally {
      setIsPdfUploading(false);
    }
  };

  // URL Scraping Handler
  const handleUrlScrape = async () => {
    if (!url.trim()) return;

    setIsScrapingLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to scrape URL');
      }

      setScrapedData(result.data);
      setQuestion(result.data.text);
      setActiveTab('text');

    } catch (error) {
      setError(error.message);
      console.error('Scraping error:', error);
    } finally {
      setIsScrapingLoading(false);
    }
  };

  // Main Analysis Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const inputText = question.trim();

    if (inputText.length < 10) {
      setError('Text is too short for meaningful analysis. Please provide at least 10 characters.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting analysis with language:', language);

      // Prepare request body based on source type
      let requestBody = {
        question: inputText,
        language
      };

      // For PDF: Include original file data
      if (pdfData && pdfData.originalFile) {
        requestBody.sourceType = 'pdf';
        requestBody.pdfFile = pdfData.originalFile; // Base64 encoded PDF
      } else if (scrapedData) {
        requestBody.sourceType = 'url';
      } else {
        requestBody.sourceType = 'text';
      }

      // Send analysis request
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Analysis request failed.');
      }

      const data = await res.json();
      console.log('Analysis completed:', {
        language: data.metadata?.language || language,
        method: data.metadata?.analysisMethod || 'text_based'
      });

      // Process response
      let parsedData;
      try {
        if (data.message?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = data.message.candidates[0].content.parts[0].text;
          const cleanedText = rawText.replace(/```json\n|\n```/g, "");
          parsedData = JSON.parse(cleanedText);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Failed to parse analysis results');
      }

      // Validate results
      if (!parsedData['Summary Generation'] || !parsedData['Sentiment Analysis']) {
        throw new Error('Incomplete analysis results received');
      }

      // Save to history with enhanced metadata including PDF URL
      const chatData = {
        question: inputText,
        response: parsedData,
        metadata: {
          language: language,
          analysisLanguage: data.metadata?.language,
          textLength: inputText.length,
          processingTime: data.metadata?.processingTime,
          createdAt: new Date().toISOString(),
          ...(scrapedData && {
            source: 'url',
            url: scrapedData.url,
            title: scrapedData.title,
            author: scrapedData.author,
            publishDate: scrapedData.publishDate,
            siteName: scrapedData.siteName,
            wordCount: scrapedData.wordCount,
            readingTime: scrapedData.readingTime
          }),
          ...(pdfData && {
            source: 'pdf',
            filename: pdfData.filename,
            fileSize: pdfData.fileSize,
            pages: pdfData.pages,
            wordCount: pdfData.wordCount,
            readingTime: pdfData.readingTime,
            pdfUrl: pdfData.pdfUrl, // Include PDF URL for viewer
            storagePath: pdfData.metadata // Include storage path
          })
        }
      };

      const saveResult = await saveChat(chatData);

      if (!saveResult.success) {
        throw new Error('Failed to save analysis to history');
      }

      console.log('Analysis saved, redirecting to history page...');

      // Redirect to history detail page
      router.push(`/history/${saveResult.data.id}`);

    } catch (error) {
      setError(error.message);
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // Helper untuk language dropdown
  const toggleLanguageDropdown = () => setShowLanguageDropdown(!showLanguageDropdown);

  const hasContent = question.trim().length > 0;

  return (
    <div className="max-w-3xl w-full mx-auto bg-white border-2 my-32 border-neutral-200 rounded-3xl overflow-hidden">
      {/* Integrated text box area */}
      <div className="relative">
        {/* Floating UI elements at the top - Tabs dan Language Selector */}
        <div className="p-4 border-b flex justify-between items-center">
          {/* Tab options - simplified pill style */}
          <div className="inline-flex p-1 bg-gray-100 rounded-full shadow-sm">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeTab === 'text'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3" />
                <span>Text</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('file');
                // Reset scrape data ketika beralih ke mode file
                setScrapedData(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeTab === 'file'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                <span>PDF</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('url');
                // Reset pdf data ketika beralih ke mode URL
                setPdfData(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeTab === 'url'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                <span>URL</span>
              </div>
            </button>
          </div>

          {/* Language selector - dropdown style */}
          <div className="relative">
            <button
              onClick={toggleLanguageDropdown}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-200"
            >
              {languageOptions.find(opt => opt.value === language)?.flag}
              <span className="hidden sm:inline">
                {languageOptions.find(opt => opt.value === language)?.label}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg p-1 z-10 border border-gray-200 w-48">
                {languageOptions.map(option => (
                  <button
                    key={option.value}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-gray-50 ${language === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    onClick={() => {
                      setLanguage(option.value);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <span className="inline-block w-5">{option.flag}</span> {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Content - Conditional Rendering berdasarkan activeTab */}
        <div className="relative h-96">
          {/* TEXT INPUT MODE */}
          {activeTab === 'text' && (
            <div className="h-full">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your text here for analysis..."
                className="w-full h-full p-6 pb-20 bg-white border-0 text-sm focus:outline-none resize-none"
              />

              {/* Source indicators */}
              {scrapedData && (
                <div className="absolute top-2 left-6 right-6 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-blue-800">{scrapedData.title}</span>
                      <span className="text-blue-600 text-xs ml-2">{scrapedData.siteName}</span>
                    </div>
                  </div>
                </div>
              )}

              {pdfData && (
                <div className="absolute top-2 left-6 right-6 bg-green-50 border border-green-100 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-green-800">{pdfData.filename}</span>
                      <span className="text-green-600 text-xs ml-2">{pdfData.pages} pages</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PDF UPLOAD MODE */}
          {activeTab === 'file' && (
            <div className="h-full flex flex-col items-center p-8">
              {!pdfData ? (
                <>
                  <FileText className="h-10 w-10 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Upload a PDF File</h3>
                  <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                    Select a PDF document from your computer for analysis.
                    Maximum size: 10MB
                  </p>

                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm rounded-lg cursor-pointer hover:bg-blue-700 transition-all"
                  >
                    <Upload className="h-4 w-4" />
                    Select PDF File
                  </label>
                  <input
                    id="pdf-upload"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {isPdfUploading && (
                    <div className="mt-6 text-sm text-gray-600 flex items-center">
                      <RotateCcw className="h-4 w-4 animate-spin mr-2" />
                      Processing PDF document...
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full">
                  <div className="bg-white rounded-lg border border-green-100 p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-medium text-green-800">{pdfData.filename}</h3>
                        <div className="text-xs text-green-700 flex flex-wrap gap-x-4 mt-1">
                          <span>{pdfData.pages} pages</span>
                          <span>{pdfData.wordCount} words</span>
                          <span>~{pdfData.readingTime} min read</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600">
                      <p>Content has been extracted and is ready for analysis.</p>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setPdfData(null);
                          setQuestion('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setActiveTab('text')}
                        className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        View Extracted Text
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL ANALYSIS MODE */}
          {activeTab === 'url' && (
            <div className="h-full flex flex-col items-center p-8">
              {!scrapedData ? (
                <div className="w-full max-w-lg">
                  <div className="text-center mb-6">
                    <Globe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Extract Content from URL
                    </h3>
                    <p className="text-sm text-gray-500">
                      Enter a website URL to extract and analyze its content
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">
                      Website URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="flex-1 p-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleUrlScrape}
                        disabled={!url.trim() || isScrapingLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap transition-colors"
                      >
                        {isScrapingLoading ? (
                          <>
                            <RotateCcw className="h-4 w-4 animate-spin inline mr-1" />
                            Extracting...
                          </>
                        ) : (
                          "Extract Content"
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-white rounded-lg border border-blue-100 p-4 mb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <ExternalLink className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800">{scrapedData.title}</h3>
                        <div className="text-xs text-blue-700 flex flex-wrap gap-x-4 mt-1">
                          <span>{scrapedData.siteName || 'Website'}</span>
                          {scrapedData.author && <span>By: {scrapedData.author}</span>}
                          <span>{scrapedData.wordCount} words</span>
                          <span>~{scrapedData.readingTime} min read</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 truncate">
                      {scrapedData.url}
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setScrapedData(null);
                          setQuestion('');
                          setUrl('');
                        }}
                        className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setActiveTab('text')}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        View Extracted Text
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fixed bottom bar with utilities */}
          <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-white bg-opacity-95 backdrop-blur-sm flex justify-between items-center">
            {/* Show Try example button only in text mode */}
            {error ? (
              <div className="text-xs text-red-600">
                {error}
              </div>
            ) : (
              activeTab === 'text' ? (
                <div className="text-xs text-gray-500">
                  Enter text or paste content to analyze
                </div>
              ) : activeTab === 'file' ? (
                <div className="text-xs text-gray-500">
                  Upload a PDF file for analysis
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  Enter URL to extract web content
                </div>
              )
            )}

            <div className="flex items-center gap-3">
              {/* Show character count only in text mode */}
              {activeTab === 'text' && (
                <span className="text-xs text-gray-500">{question.length}/1000</span>
              )}

              {/* Submit button always visible */}
              <button
                onClick={handleSubmit}
                disabled={
                  (!hasContent && activeTab === 'text') ||
                  (activeTab === 'file' && !pdfData) ||
                  (activeTab === 'url' && !scrapedData) ||
                  isLoading
                }
                className={`flex items-center justify-center gap-1 p-2 ${(hasContent || pdfData || scrapedData) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'
                  } text-white rounded-full w-8 h-8 disabled:opacity-50 transition-colors`}
              >
                {isLoading ?
                  <RotateCcw className="h-4 w-4 animate-spin" /> :
                  <ArrowRight className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;