import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, RefreshCw, ExternalLink, Download, Loader2, Info } from 'lucide-react';

interface LocalPDFViewerProps {
  pdfUrl: string;
  fileName?: string;
  onDownload?: () => void;
}

type LoadingMethod = 'direct' | 'proxy' | 'failed';

const LocalPDFViewer: React.FC<LocalPDFViewerProps> = ({
  pdfUrl,
  fileName = 'document.pdf',
  onDownload
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingMethod, setLoadingMethod] = useState<LoadingMethod>('direct');
  const [corsDetected, setCorsDetected] = useState(false);

  // Reset state when URL changes
  useEffect(() => {
    if (pdfUrl) {
      setError(null);
      setIsLoading(true);
      setLoadingMethod('direct');
      setCorsDetected(false);
      setRetryCount(0);
    }
  }, [pdfUrl]);

  // Get the appropriate PDF URL based on loading method
  const getEffectivePdfUrl = useMemo(() => {
    if (!pdfUrl) return '';

    // Validate that the URL is a PDF
    if (!pdfUrl.toLowerCase().includes('.pdf')) {
      return '';
    }

    if (loadingMethod === 'proxy') {
      return `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
    }

    // For direct loading, convert various URL formats
    let processedUrl = pdfUrl;
    
    // Convert GitHub blob URLs to raw URLs
    if (pdfUrl.includes('github.com') && pdfUrl.includes('/blob/')) {
      processedUrl = pdfUrl.replace('/blob/', '/raw/');
    }
    
    // Convert github.com raw URLs to raw.githubusercontent.com
    if (pdfUrl.includes('github.com') && pdfUrl.includes('/raw/')) {
      processedUrl = pdfUrl.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
    }

    return processedUrl;
  }, [pdfUrl, loadingMethod]);

  const handleDirectLoadError = () => {
    console.log('Direct PDF loading failed, trying proxy...');
    setCorsDetected(true);
    setLoadingMethod('proxy');
    setError(null);
    setIsLoading(true);
  };

  const handleProxyLoadError = () => {
    console.log('Proxy PDF loading also failed');
    setLoadingMethod('failed');
    setIsLoading(false);
    setError('Failed to load PDF through both direct access and proxy. The file may not be accessible or the URL may be invalid.');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoadingMethod('direct');
    setCorsDetected(false);
    if (pdfUrl && pdfUrl.toLowerCase().includes('.pdf')) {
      setIsLoading(true);
    }
  };

  const handleRetryWithProxy = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoadingMethod('proxy');
    setCorsDetected(true);
    setIsLoading(true);
  };

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback: try to download directly
      const link = document.createElement('a');
      link.href = getEffectivePdfUrl;
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
        if (loadingMethod === 'direct') {
          handleDirectLoadError();
        } else if (loadingMethod === 'proxy') {
          handleProxyLoadError();
        }
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [isLoading, loadingMethod, retryCount]);

  if (!getEffectivePdfUrl && loadingMethod !== 'failed') {
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
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-700">PDF Preview</h3>
          {fileName && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded truncate max-w-xs">
              {fileName}
            </span>
          )}
          {corsDetected && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded flex items-center gap-1">
              <Info className="h-3 w-3" />
              Using Proxy
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && loadingMethod === 'direct' && (
            <button
              onClick={handleRetryWithProxy}
              className="flex items-center gap-1 bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
              title="Try with Proxy"
            >
              <RefreshCw className="h-3 w-3" />
              Proxy
            </button>
          )}
          {error && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              title="Retry Loading"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-800 font-medium">PDF Loading Error</p>
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600 text-xs mt-1">
                {loadingMethod === 'direct' ? 
                  'Try clicking "Proxy" to use alternative loading method, or "Open" to view in a new tab.' :
                  'Try clicking "Retry" or "Open" to view in a new tab.'
                }
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
                {loadingMethod === 'direct' ? 'Attempting direct load...' : 'Using proxy server...'}
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
                {loadingMethod === 'direct' && (
                  <button
                    onClick={handleRetryWithProxy}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Proxy
                  </button>
                )}
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

        {/* PDF.js Viewer */}
        {!error && getEffectivePdfUrl && (
          <iframe
            key={`viewer-${loadingMethod}-${retryCount}`} // Force reload on retry or method change
            src={`/pdf.js/web/viewer.html?file=${encodeURIComponent(getEffectivePdfUrl)}`}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${fileName}`}
            onLoad={() => {
              setIsLoading(false);
              setError(null);
            }}
            onError={() => {
              if (loadingMethod === 'direct') {
                handleDirectLoadError();
              } else {
                handleProxyLoadError();
              }
            }}
            style={{ minHeight: '400px' }}
          />
        )}
      </div>

      {/* URL Info */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <details className="text-xs text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800">Technical Details</summary>
          <div className="mt-2 space-y-1 text-xs">
            <p><strong>Original URL:</strong> <span className="break-all">{pdfUrl}</span></p>
            <p><strong>Effective URL:</strong> <span className="break-all">{getEffectivePdfUrl}</span></p>
            <p><strong>Loading Method:</strong> {loadingMethod === 'direct' ? 'Direct' : loadingMethod === 'proxy' ? 'Proxy Server' : 'Failed'}</p>
            <p><strong>CORS Detected:</strong> {corsDetected ? 'Yes' : 'No'}</p>
            <p><strong>Viewer:</strong> PDF.js</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default LocalPDFViewer;
