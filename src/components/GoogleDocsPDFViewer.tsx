import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, RefreshCw, ExternalLink, Download, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface GoogleDocsPDFViewerProps {
  pdfUrl?: string;
  fileUrl?: string; // Alternative prop name for compatibility
  fileName?: string;
  title?: string;
  className?: string;
  showControls?: boolean;
  onDownload?: () => void;
}

const GoogleDocsPDFViewer: React.FC<GoogleDocsPDFViewerProps> = ({
  pdfUrl,
  fileUrl,
  fileName = 'document.pdf',
  title,
  className = '',
  showControls = true,
  onDownload
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [viewerMethod, setViewerMethod] = useState<'gview' | 'direct' | 'mozilla'>('gview');
  
  // Use pdfUrl or fileUrl (for compatibility)
  const actualUrl = pdfUrl || fileUrl;
  const displayTitle = title || fileName;

  // Validate PDF URL on mount and when URL changes
  useEffect(() => {
    if (actualUrl && !actualUrl.toLowerCase().includes('.pdf')) {
      setError('The provided URL does not appear to be a PDF file.');
      setIsLoading(false);
    } else if (actualUrl) {
      setError(null);
      setIsLoading(true);
    }
  }, [actualUrl]);

  // Convert various URL formats to viewer compatible URLs
  const getViewerUrl = (url: string, method: 'gview' | 'direct' | 'mozilla' = 'gview'): string => {
    if (!url) return '';

    // Validate that the URL is a PDF
    if (!url.toLowerCase().includes('.pdf')) {
      return '';
    }

    // For GitHub URLs, ensure we're using the raw URL
    let processedUrl = url;
    
    // Convert GitHub blob URLs to raw URLs
    if (url.includes('github.com') && url.includes('/blob/')) {
      processedUrl = url.replace('/blob/', '/raw/');
    }
    
    // Convert github.com raw URLs to raw.githubusercontent.com
    if (url.includes('github.com') && url.includes('/raw/')) {
      processedUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
    }
    
    // Handle raw.githubusercontent.com URLs - they're already in correct format
    if (url.includes('raw.githubusercontent.com')) {
      processedUrl = url;
    }

    // For Google Drive URLs, extract file ID and use preview URL
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) ||
        url.match(/id=([a-zA-Z0-9-_]+)/) ||
        url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    // Choose viewer method
    switch (method) {
      case 'gview':
        // Google Docs Viewer with cache busting
        const timestamp = new Date().getTime();
        return `https://docs.google.com/gview?url=${encodeURIComponent(processedUrl)}&embedded=true&v=${timestamp}`;
      
      case 'mozilla':
        // Mozilla PDF.js viewer
        return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(processedUrl)}`;
      
      case 'direct':
        // Direct URL embedding (modern browsers support)
        return processedUrl;
      
      default:
        return processedUrl;
    }
  };

  const viewerUrl = useMemo(() => getViewerUrl(actualUrl || '', viewerMethod), [actualUrl, viewerMethod]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    // Try different viewer methods on error
    if (viewerMethod === 'gview') {
      console.log('Google Docs Viewer failed, trying Mozilla PDF.js...');
      setViewerMethod('mozilla');
      setIsLoading(true);
      return;
    } else if (viewerMethod === 'mozilla') {
      console.log('Mozilla PDF.js failed, trying direct embedding...');
      setViewerMethod('direct');
      setIsLoading(true);
      return;
    }
    setError('Failed to load PDF. The document may not be accessible or the URL may be invalid.');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setViewerMethod('gview'); // Reset to first method
    if (actualUrl && actualUrl.toLowerCase().includes('.pdf')) {
      setIsLoading(true);
    }
  };

  const openInNewTab = () => {
    window.open(actualUrl, '_blank');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback: try to download directly
      const link = document.createElement('a');
      link.href = actualUrl || '';
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Set loading timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setError('PDF loading is taking longer than expected. Please try again.');
        setIsLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading, retryCount]);

  if (!viewerUrl) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Invalid PDF URL</h3>
          <p className="text-red-700 mb-4">Please provide a valid PDF URL.</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">PDF Preview</h3>
          {fileName && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded truncate max-w-xs">
              {fileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
              title="Retry Loading"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
            title="Download PDF"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
          <button
            onClick={openInNewTab}
            className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </button>
        </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-800 font-medium">PDF Loading Error</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">
                Try clicking &quot;Retry&quot; or &quot;Open&quot; to view in a new tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="relative" style={{ height: 'clamp(400px, 80vh, 800px)' }}>
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <Loader2 className="inline-block animate-spin h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600">Loading PDF preview...</p>
              <p className="text-gray-500 text-sm mt-2">
                Using {viewerMethod === 'gview' ? 'Google Docs Viewer' : 
                       viewerMethod === 'mozilla' ? 'Mozilla PDF.js' : 
                       'Direct PDF Embedding'}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load PDF</h3>
              <p className="text-gray-600 mb-4">The PDF could not be displayed in the viewer.</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Docs Viewer iframe */}
        {!error && (
          <iframe
            key={`viewer-${retryCount}`} // Force reload on retry
            src={viewerUrl}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${fileName}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
            style={{ minHeight: '400px' }}
            loading="lazy"
            allow="fullscreen"
          />
        )}
      </div>

      {/* URL Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800">Technical Details</summary>
          <div className="mt-2 space-y-1 text-xs">
            <p><strong>Original URL:</strong> <span className="break-all">{actualUrl}</span></p>
            <p><strong>Viewer URL:</strong> <span className="break-all">{viewerUrl}</span></p>
            <p><strong>Method:</strong> {viewerMethod === 'gview' ? 'Google Docs Viewer' : 
                                          viewerMethod === 'mozilla' ? 'Mozilla PDF.js' : 
                                          'Direct PDF Embedding'}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default GoogleDocsPDFViewer;
