'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Link, ExternalLink, Eye } from 'lucide-react';
import { ExpandableCard } from '@/components/ui/expandable-card';

const SourceViewer = ({ analysis }) => {
  const [activeView, setActiveView] = useState('content');
  const [activeContentTab, setActiveContentTab] = useState('source'); // 'source' or 'extracted'
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  if (!analysis) return null;

  const metadata = analysis.metadata || {};
  const hasSource = metadata.source;

  // Load PDF file from Supabase Storage
  useEffect(() => {
    const loadPDFFile = async () => {
      if (metadata.source === 'pdf' && metadata.pdfUrl) {
        console.log('Loading PDF from:', metadata.pdfUrl);
        setPdfLoading(true);
        setPdfError(null);
        try {
          setPdfFile(metadata.pdfUrl);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfError('Failed to load PDF file');
        } finally {
          setPdfLoading(false);
        }
      }
    };

    loadPDFFile();
  }, [metadata.source, metadata.pdfUrl]);

  // Fungsi untuk memformat teks
  const formatText = useMemo(() => {
    return (text) => {
      if (!text) return '';
      // Format text dengan simple formatting saja
      let formattedText = text
        .replace(/\n\s*\n/g, '\n\n') // Normalize paragraphs
        .replace(/\t+/g, '  ') // Replace tabs with spaces
        .trim();

      return formattedText;
    };
  }, []);

  const renderSourceHeader = () => {
    if (metadata.source === 'pdf') {
      return (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-t-lg">
          <FileText className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">{metadata.filename}</h3>
            <div className="flex items-center gap-4 text-sm text-green-700">
              <span>{metadata.pages} pages</span>
              <span>{(metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
              <span>{metadata.wordCount} words</span>
              <span>{metadata.readingTime} min read</span>
            </div>
          </div>
        </div>
      );
    }

    if (metadata.source === 'url') {
      return (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-t-lg">
          <Link className="h-6 w-6 text-blue-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">{metadata.title}</h3>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <span>{metadata.siteName}</span>
              <span>{metadata.wordCount} words</span>
              <span>{metadata.readingTime} min read</span>
              {metadata.publishDate && (
                <span>{new Date(metadata.publishDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Original
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-t-lg">
        <FileText className="h-6 w-6 text-gray-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Text Input</h3>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>{analysis.question?.length || 0} characters</span>
            <span>~{Math.ceil((analysis.question?.length || 0) / 1000)} min read</span>
          </div>
        </div>
      </div>
    );
  };

  // Memoize PDF loading components
  const pdfLoadingComponent = useMemo(() => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    </div>
  ), []);

  const pdfErrorComponent = useMemo(() => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <FileText className="h-16 w-16 mx-auto text-red-400 mb-4" />
        <p className="text-red-600 mb-2">PDF Loading Failed</p>
        <p className="text-sm text-gray-500 mb-4">Switching to fallback viewer...</p>
        <iframe
          src={`${metadata.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-80 border border-gray-300 rounded"
          title="PDF Fallback Viewer"
        />
      </div>
    </div>
  ), [metadata.pdfUrl]);

  // Enhanced PDF Viewer with full height and hidden sidebar
  const renderPDFViewer = () => {
    return (
      <div className="relative">
        {pdfLoading ? (
          pdfLoadingComponent
        ) : pdfError ? (
          pdfErrorComponent
        ) : (
          <div className="border rounded-lg bg-white overflow-hidden">
            <div className="w-full max-h-[400px] overflow-auto">
              <iframe
                src={`${metadata.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onError={() => {
                  console.log('Iframe PDF viewer failed');
                }}
                style={{ height: '400px' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render embedded website with controlled height
  const renderWebsiteViewer = () => {
    return (
      <div className="relative">
        <div className="overflow-hidden max-h-[400px] border rounded-lg">
          <iframe
            src={metadata.url}
            className="w-full h-[400px] border-0"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  };

  // Render extracted text content
  const renderExtractedText = (isExpanded = false) => {
    const formattedText = formatText(analysis.question || '');

    return (
      <div className="relative">
        <div className={`p-6 text-gray-700 leading-relaxed whitespace-pre-wrap ${isExpanded ? 'line-clamp-none' : 'line-clamp-10'}`}>
          {/* Format paragraphs dan styling manual */}
          {formattedText.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-3">
              {paragraph.split('\n').map((line, j) => (
                <React.Fragment key={j}>
                  {line}
                  {j < paragraph.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const renderContentView = () => {
    // Untuk source yang bukan URL atau PDF, hanya tampilkan extracted text
    if (!hasSource || (metadata.source !== 'url' && metadata.source !== 'pdf')) {
      return (
        <div className="p-6">
          <ExpandableCard
            title="Extracted Content"
            content={renderExtractedText(false)}
            expandedContent={<div className="h-[70vh] overflow-auto">{renderExtractedText(true)}</div>}
          />
        </div>
      );
    }

    return (
      <div className="p-6 relative">
        {/* Header dengan tab buttons */}
        <div className="items-center flex justify-end mr-14">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveContentTab('source')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeContentTab === 'source'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Source
            </button>
            <button
              onClick={() => setActiveContentTab('extracted')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeContentTab === 'extracted'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Extracted
            </button>
          </div>
        </div>

        <div className="-mt-12">
          {/* Tampilkan konten sesuai dengan tab yang aktif */}
          {activeContentTab === 'source' && (
            <ExpandableCard
              title={metadata.source === 'pdf' ? 'PDF Document' : 'Original Website'}
              content={metadata.source === 'pdf' ? renderPDFViewer() : renderWebsiteViewer()}
              expandedContent={
                <div className="h-[70vh]">
                  {metadata.source === 'pdf' ? (
                    <div className="h-full border rounded-lg bg-white overflow-hidden">
                      {pdfLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <iframe
                          src={`${metadata.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                          className="w-full h-full border-0"
                          title="PDF Viewer Expanded"
                          onError={() => {
                            console.log('Iframe PDF viewer expanded failed');
                          }}
                          style={{ height: '100%', minHeight: '600px' }}
                        />
                      )}
                    </div>
                  ) : (
                    <iframe
                      src={metadata.url}
                      className="w-full h-full border-0 rounded-lg"
                      title="Website Preview Expanded"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  )}
                </div>
              }
            />
          )}

          {activeContentTab === 'extracted' && (
            <ExpandableCard
              title="Extracted Content"
              content={renderExtractedText(false)}
              expandedContent={<div className="h-[70vh] overflow-auto">{renderExtractedText(true)}</div>}
            />
          )}
        </div>
      </div>
    );
  };

  const renderMetadataView = () => {
    return (
      <div className="p-6 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-4">Analysis Metadata</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Analysis Language</label>
              <p className="text-sm text-gray-900">{metadata.analysisLanguage || metadata.language || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Processing Time</label>
              <p className="text-sm text-gray-900">{metadata.processingTime ? new Date(metadata.processingTime).toLocaleString() : 'Not recorded'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Text Length</label>
              <p className="text-sm text-gray-900">{metadata.textLength || analysis.question?.length || 0} characters</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Source Type</label>
              <p className="text-sm text-gray-900 capitalize">{metadata.source || 'text'}</p>
            </div>
          </div>

          {hasSource && (
            <div className="space-y-3">
              {metadata.source === 'url' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Website</label>
                    <p className="text-sm text-gray-900">{metadata.siteName || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">URL</label>
                    <a
                      href={metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {metadata.url}
                    </a>
                  </div>
                </>
              )}

              {metadata.source === 'pdf' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">File Size</label>
                    <p className="text-sm text-gray-900">{(metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pages</label>
                    <p className="text-sm text-gray-900">{metadata.pages}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Word Count</label>
                    <p className="text-sm text-gray-900">{metadata.wordCount}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'metadata':
        return renderMetadataView();
      case 'content':
      default:
        return renderContentView();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Source Header */}
      {renderSourceHeader()}

      {/* View Toggle */}
      <div className="flex items-center gap-1 p-4 bg-white border-b">
        <button
          onClick={() => setActiveView('content')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeView === 'content'
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Eye className="h-4 w-4" />
          Content View
        </button>

        <button
          onClick={() => setActiveView('metadata')}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeView === 'metadata'
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <FileText className="h-4 w-4" />
          Metadata
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default SourceViewer;