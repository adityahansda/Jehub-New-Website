import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Minimize2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Note: react-pdf styles are imported in _app.tsx

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PDFViewerProps {
  url: string;
  fileName: string;
  onDownload?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check if it's mobile view
  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert GitHub URL to raw PDF URL for PDF.js
  const convertGithubUrlToPdfUrl = (githubUrl: string): string => {
    if (!githubUrl) return '';

    // console.log('Converting GitHub URL for PDF.js:', githubUrl); // Suppressed for production

    // Handle raw.githubusercontent.com URLs (already viewable)
    if (githubUrl.includes('raw.githubusercontent.com')) {
      // console.log('Already raw.githubusercontent.com URL:', githubUrl); // Suppressed for production
      return githubUrl;
    }

    // Handle github.com/user/repo/blob/ URLs (convert to raw)
    if (githubUrl.includes('github.com') && githubUrl.includes('/blob/')) {
      const rawUrl = githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      // console.log('Converted blob to raw.githubusercontent.com:', rawUrl); // Suppressed for production
      return rawUrl;
    }

    // Handle github.com/user/repo/raw/ URLs (convert to raw.githubusercontent.com)
    if (githubUrl.includes('github.com') && githubUrl.includes('/raw/')) {
      const rawUrl = githubUrl.replace('github.com', 'raw.githubusercontent.com').replace('/raw/', '/');
      // console.log('Converted raw to raw.githubusercontent.com:', rawUrl); // Suppressed for production
      return rawUrl;
    }

    // Default fallback
    // console.log('Using original URL:', githubUrl); // Suppressed for production
    return githubUrl;
  };

  // Initialize PDF URL
  useEffect(() => {
    const convertedUrl = convertGithubUrlToPdfUrl(url);
    setPdfUrl(convertedUrl);
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setNumPages(null);
  }, [url]);

  // PDF.js event handlers
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    // console.log('PDF loaded successfully. Number of pages:', numPages); // Suppressed for production
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setCurrentPage(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setError(`Failed to load PDF: ${error.message}`);
  };

  const onPageLoadSuccess = () => {
    // console.log('Page loaded successfully'); // Suppressed for production
  };

  const onPageLoadError = (error: Error) => {
    // console.error('Error loading page:', error); // Suppressed for production
  };

  // Retry loading
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setNumPages(null);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Page navigation
  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (numPages && pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Rotation controls
  const rotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetRotation = () => {
    setRotation(0);
  };

  // Download PDF
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Fallback download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  // Render mobile view with PDF.js
  const renderMobileView = () => (
    <div className="bg-white rounded-lg border">
      {/* Mobile Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative h-[400px] overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-4">
              <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Failed to Load PDF</h3>
              <p className="text-xs text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {pdfUrl && !error && (
          <div className="flex flex-col items-center p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div><p className="text-sm text-gray-600">Loading PDF...</p></div>}
              error={<div className="text-center text-red-600 text-sm">Error loading PDF</div>}
            >
              <Page
                pageNumber={currentPage}
                width={Math.min(window.innerWidth - 40, 300)}
                scale={scale}
                rotate={rotation}
                onLoadSuccess={onPageLoadSuccess}
                onLoadError={onPageLoadError}
                loading={<div className="text-center py-4"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div><p className="text-xs text-gray-600">Loading page...</p></div>}
                error={<div className="text-center text-red-600 text-xs py-4">Error loading page</div>}
              />
            </Document>

            {/* Mobile Page Navigation */}
            {numPages && numPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 p-2 bg-gray-100 rounded-lg">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage <= 1}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {currentPage} of {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= numPages}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render desktop view with PDF.js
  const renderDesktopView = () => (
    <div className={`relative bg-white rounded-lg border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* PDF Viewer Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
            {fileName}
          </span>
          {numPages && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {numPages} pages
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          {numPages && numPages > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                {currentPage} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-600 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          
          {/* Other Controls */}
          <button
            onClick={rotateClockwise}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Rotate clockwise"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleRetry}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Retry loading"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className={`relative overflow-auto pdf-container ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load PDF</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Instead
                </button>
              </div>
            </div>
          </div>
        )}

        {pdfUrl && !error && (
          <div className="flex flex-col items-center p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading PDF...</p></div>}
              error={<div className="text-center text-red-600">Error loading PDF</div>}
            >
              <Page
                pageNumber={currentPage}
                width={isFullscreen ? Math.min(window.innerWidth - 100, 800) : 750}
                scale={scale}
                rotate={rotation}
                onLoadSuccess={onPageLoadSuccess}
                onLoadError={onPageLoadError}
                loading={<div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading page...</p></div>}
                error={<div className="text-center text-red-600 py-8">Error loading page</div>}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );

  // Render fallback view for unsupported PDFs
  const renderFallbackView = () => (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="mb-4">
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Download className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Preview</h3>
        <p className="text-gray-600 mb-4">
          Click the button below to download or view the PDF file.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="h-5 w-5" />
          Download PDF
        </button>
        <button
          onClick={openInNewTab}
          className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          <Maximize2 className="h-5 w-5" />
          Open in New Tab
        </button>
      </div>
    </div>
  );

  // Main render
  if (!pdfUrl) {
    return renderFallbackView();
  }

  // Always render desktop view for now (mobile detection can be added later)
  return isMobile ? renderMobileView() : renderDesktopView();
};

export default PDFViewer;
