import React, { useState } from 'react';
import Head from 'next/head';
import LocalPDFViewer from '../src/components/LocalPDFViewer';
import GoogleDocsPDFViewer from '../src/components/GoogleDocsPDFViewer';
import { FileText, Globe, Github, TestTube, Eye, Layers } from 'lucide-react';

interface TestPDFExample {
  name: string;
  url: string;
  description: string;
  source: 'local' | 'github' | 'web' | 'gdrive';
  icon: React.ReactNode;
}

const testPDFs: TestPDFExample[] = [
  {
    name: 'Sample PDF (PDFium)',
    url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    description: 'Mozilla PDF.js test document - TracemonKey research paper',
    source: 'github',
    icon: <Github className="h-4 w-4" />
  },
  {
    name: 'Lorem Ipsum PDF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'W3C test PDF document',
    source: 'web',
    icon: <Globe className="h-4 w-4" />
  },
  {
    name: 'GitHub README PDF',
    url: 'https://github.com/mozilla/pdf.js/raw/master/examples/learning/helloworld.pdf',
    description: 'PDF.js Hello World example document',
    source: 'github',
    icon: <Github className="h-4 w-4" />
  },
  {
    name: 'Custom Test PDF',
    url: '',
    description: 'Enter your own PDF URL to test',
    source: 'local',
    icon: <TestTube className="h-4 w-4" />
  }
];

type ViewerType = 'local' | 'google' | 'both';

const TestPDFPage: React.FC = () => {
  const [selectedPDF, setSelectedPDF] = useState<TestPDFExample>(testPDFs[0]);
  const [customURL, setCustomURL] = useState('');
  const [viewerType, setViewerType] = useState<ViewerType>('local');
  const [isTestingCustom, setIsTestingCustom] = useState(false);

  const effectivePDF = isTestingCustom && customURL ? 
    { ...testPDFs[3], url: customURL, name: 'Custom PDF' } : 
    selectedPDF;

  const handleCustomURLTest = () => {
    if (customURL.trim()) {
      setIsTestingCustom(true);
      setSelectedPDF({ ...testPDFs[3], url: customURL.trim() });
    }
  };

  const handlePresetSelect = (pdf: TestPDFExample) => {
    setIsTestingCustom(false);
    setSelectedPDF(pdf);
    if (pdf.source !== 'local') {
      setCustomURL('');
    }
  };

  return (
    <>
      <Head>
        <title>PDF Viewer Test Page - JEHub</title>
        <meta name="description" content="Test page for PDF viewer components" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">PDF Viewer Test Page</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Test and compare different PDF viewer implementations. This page allows you to test both 
              the LocalPDFViewer (using PDF.js) and GoogleDocsPDFViewer components with various PDF sources.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* PDF Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Select PDF to Test
                </h3>
                <div className="space-y-3">
                  {testPDFs.map((pdf, index) => (
                    <div key={index}>
                      {pdf.source === 'local' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                               onClick={() => handlePresetSelect(pdf)}>
                            {pdf.icon}
                            <div className="flex-grow">
                              <div className="font-medium text-gray-900">{pdf.name}</div>
                              <div className="text-sm text-gray-500">{pdf.description}</div>
                            </div>
                          </div>
                          <div className="ml-7 space-y-2">
                            <input
                              type="url"
                              placeholder="Enter PDF URL..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              value={customURL}
                              onChange={(e) => setCustomURL(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleCustomURLTest()}
                            />
                            <button
                              onClick={handleCustomURLTest}
                              disabled={!customURL.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                            >
                              Test Custom URL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPDF === pdf && !isTestingCustom
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePresetSelect(pdf)}
                        >
                          {pdf.icon}
                          <div className="flex-grow">
                            <div className="font-medium text-gray-900">{pdf.name}</div>
                            <div className="text-sm text-gray-500">{pdf.description}</div>
                            <div className="text-xs text-gray-400 mt-1 truncate">{pdf.url}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewer Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Viewer Type
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="viewerType"
                      value="local"
                      checked={viewerType === 'local'}
                      onChange={(e) => setViewerType(e.target.value as ViewerType)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Local PDF Viewer</div>
                      <div className="text-sm text-gray-500">
                        Uses PDF.js with CORS proxy fallback
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="viewerType"
                      value="google"
                      checked={viewerType === 'google'}
                      onChange={(e) => setViewerType(e.target.value as ViewerType)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Google Docs Viewer</div>
                      <div className="text-sm text-gray-500">
                        Uses Google Docs PDF viewer service
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="viewerType"
                      value="both"
                      checked={viewerType === 'both'}
                      onChange={(e) => setViewerType(e.target.value as ViewerType)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Side by Side</div>
                      <div className="text-sm text-gray-500">
                        Compare both viewers simultaneously
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Current Selection Info */}
            {effectivePDF.url && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Currently Testing:</h4>
                <div className="text-sm text-blue-800">
                  <div className="font-medium">{effectivePDF.name}</div>
                  <div className="text-blue-600 break-all">{effectivePDF.url}</div>
                </div>
              </div>
            )}
          </div>

          {/* PDF Viewers */}
          {effectivePDF.url && (
            <div className="space-y-8">
              {viewerType === 'local' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Local PDF Viewer</h2>
                  <LocalPDFViewer
                    pdfUrl={effectivePDF.url}
                    fileName={`${effectivePDF.name}.pdf`}
                    onDownload={() => console.log('Download clicked for:', effectivePDF.name)}
                  />
                </div>
              )}

              {viewerType === 'google' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Docs PDF Viewer</h2>
                  <GoogleDocsPDFViewer
                    pdfUrl={effectivePDF.url}
                    fileName={`${effectivePDF.name}.pdf`}
                    onDownload={() => console.log('Download clicked for:', effectivePDF.name)}
                  />
                </div>
              )}

              {viewerType === 'both' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Local PDF Viewer</h2>
                    <LocalPDFViewer
                      pdfUrl={effectivePDF.url}
                      fileName={`${effectivePDF.name}.pdf`}
                      onDownload={() => console.log('Download clicked for:', effectivePDF.name)}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Docs PDF Viewer</h2>
                    <GoogleDocsPDFViewer
                      pdfUrl={effectivePDF.url}
                      fileName={`${effectivePDF.name}.pdf`}
                      onDownload={() => console.log('Download clicked for:', effectivePDF.name)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Instructions</h3>
            <div className="prose prose-sm text-gray-600">
              <ul className="space-y-2">
                <li>
                  <strong>Local PDF Viewer:</strong> Uses PDF.js with automatic CORS proxy fallback. 
                  It will first try to load the PDF directly, and if that fails due to CORS restrictions, 
                  it will automatically try using the proxy server.
                </li>
                <li>
                  <strong>Google Docs Viewer:</strong> Uses Google&apos;s document viewer service. 
                  Works well with most publicly accessible PDFs but may have limitations with some sources.
                </li>
                <li>
                  <strong>Custom URLs:</strong> Test with your own PDF URLs. The viewers will handle 
                  various URL formats including GitHub blob URLs (automatically converted to raw URLs).
                </li>
                <li>
                  <strong>Error Handling:</strong> Both viewers include comprehensive error handling 
                  with retry options and fallback mechanisms.
                </li>
                <li>
                  <strong>Features:</strong> Both viewers support download functionality, opening in new tabs, 
                  and provide detailed technical information about loading methods.
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This is a development test page. In production, choose the appropriate viewer based on your needs.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPDFPage;
