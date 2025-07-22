import React, { useState } from 'react';
import GoogleDocsPDFViewer from '../src/components/GoogleDocsPDFViewer';

const TestPDF = () => {
  const [showViewer, setShowViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  
  const testUrls = [
    {
      name: 'Sample PDF from Mozilla',
      url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
    },
    {
      name: 'GitHub Raw PDF (example)',
      url: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf'
    },
    {
      name: 'Another test PDF',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const handleTestPDF = (url: string) => {
    setPdfUrl(url);
    setShowViewer(true);
  };

  const closePDFViewer = () => {
    setShowViewer(false);
    setPdfUrl('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF Viewer Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test PDF URLs</h2>
          <div className="space-y-3">
            {testUrls.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 truncate max-w-md">{item.url}</p>
                </div>
                <button
                  onClick={() => handleTestPDF(item.url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Test PDF
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom PDF URL</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter PDF URL to test..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleTestPDF(pdfUrl)}
              disabled={!pdfUrl.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Enter any PDF URL to test the viewer functionality and CORS proxy.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Testing Notes</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• The viewer uses Google Docs Viewer for PDF display</li>
            <li>• GitHub URLs are automatically converted to raw.githubusercontent.com format</li>
            <li>• Click &quot;Retry&quot; if initial loading fails</li>
            <li>• Use &quot;Open&quot; button to view PDF in a new tab</li>
            <li>• Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>

      {showViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-7xl mx-4 my-4">
            <button
              onClick={closePDFViewer}
              className="absolute top-4 right-4 z-10 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
            <GoogleDocsPDFViewer
              pdfUrl={pdfUrl}
              fileName="Test PDF"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPDF;
