import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye, 
  Calendar, 
  Mail, 
  User, 
  Award, 
  Clock,
  FileText,
  Shield,
  ExternalLink,
  Loader2,
  X,
  Maximize2,
  Star,
  BadgeCheck,
  Minimize2
} from 'lucide-react';

interface Document {
  type: string;
  url: string;
  downloadUrl: string | null;
  previewUrl: string | null;
  status: string;
  linkText: string;
}

interface InternshipRecord {
  internId: string;
  verification: boolean;
  certificateUrl: string;
  name: string;
  role: string;
  email: string;
  joiningType: string;
  duration: string;
  startingDate: string;
  endDate: string;
  issueDate: string;
  verifiedAt: string;
  documents: Document[];
}

interface VerificationResult {
  isValid: boolean;
  record?: InternshipRecord;
  message: string;
  verifiedAt: string;
  internIdSearched: string;
}

const CertificateVerification: React.FC = () => {
  const [internId, setInternId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internId.trim()) {
      setError('Please enter an Intern ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verify-certificate?internId=${encodeURIComponent(internId.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerificationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (document: Document) => {
    if (document.downloadUrl) {
      window.open(document.downloadUrl, '_blank');
    } else {
      window.open(document.url, '_blank');
    }
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const getGoogleDocsViewerUrl = (url: string): string => {
    // Extract file ID from Google Drive URL
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;
    }
    return url;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    
    try {
      // Handle different date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return as is
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">{document.type}</h4>
          </div>
          
          {document.linkText && (
            <p className="text-sm text-gray-600 mb-2">{document.linkText}</p>
          )}
          
          {document.status && document.status !== 'Available' && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${
              document.status === 'Not Issued Yet' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {document.status === 'Not Issued Yet' ? '⏳' : '✅'} {document.status}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {document.status === 'Not Issued Yet' ? (
            <div className="flex items-center text-xs text-gray-500 italic">
              🔒 Document not yet available
            </div>
          ) : (
            <>
              {document.previewUrl && (
                <button
                  onClick={() => handlePreview(document)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Preview Document"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => handleDownload(document)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Download Document"
                disabled={!document.downloadUrl && !document.url}
              >
                <Download className="h-4 w-4" />
              </button>
              
              {document.url && (
                <button
                  onClick={() => window.open(document.url, '_blank')}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                  title="Open in New Tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Add top spacing to avoid navigation overlap */}
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Certificate Verification</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verify the authenticity of internship certificates issued by Jharkhand Engineer's Hub. 
            Enter your Intern ID to check your certificate details and download documents.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="internId" className="block text-sm font-medium text-gray-700 mb-2">
                Intern ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="internId"
                  value={internId}
                  onChange={(e) => setInternId(e.target.value)}
                  placeholder="Enter your Intern ID (e.g., IN-WD-020)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !internId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
            >
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Results */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className={`rounded-xl shadow-lg p-6 ${
                verificationResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      verificationResult.isValid ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {verificationResult.isValid ? 'Certificate Verified ✓' : 'Verification Failed'}
                    </h2>
                    <p className={`${
                      verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Intern ID Searched: <span className="font-mono font-semibold">{verificationResult.internIdSearched}</span></p>
                  <p>Verified At: {formatDate(verificationResult.verifiedAt)}</p>
                </div>
              </div>

              {/* Intern Details */}
              {verificationResult.record && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <User className="h-6 w-6 text-blue-600" />
                    <span>Internship Details</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-semibold text-gray-900">{verificationResult.record.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <p className="font-semibold text-gray-900">{verificationResult.record.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{verificationResult.record.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Intern ID</p>
                          <p className="font-semibold text-gray-900 font-mono">{verificationResult.record.internId}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{verificationResult.record.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(verificationResult.record.startingDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(verificationResult.record.endDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Issue Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(verificationResult.record.issueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Documents Section */}
              {verificationResult.record && verificationResult.record.documents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Available Documents</span>
                  </h3>
                  
                  <div className="grid gap-4">
                    {verificationResult.record.documents.map((document, index) => (
                      <DocumentCard key={index} document={document} />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Document Preview Modal with Google Docs Viewer */}
        <AnimatePresence>
          {previewDocument && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${
                isFullscreen ? '' : ''
              }`}
              onClick={() => setPreviewDocument(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
                  isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh] w-full'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6" />
                    <h3 className="text-xl font-bold">{previewDocument.type} Preview</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleDownload(previewDocument)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setPreviewDocument(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className={`${isFullscreen ? 'h-full' : 'h-[70vh]'} overflow-hidden`}>
                  <iframe
                    src={getGoogleDocsViewerUrl(previewDocument.url)}
                    className="w-full h-full border-0"
                    title={`Preview of ${previewDocument.type}`}
                    loading="lazy"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
