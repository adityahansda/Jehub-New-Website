import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  Minimize2,
  DownloadCloud,
  Archive,
  FolderOpen
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

interface DownloadResult {
  isValid: boolean;
  record?: InternshipRecord;
  message: string;
  verifiedAt: string;
  internIdSearched: string;
}

const CertificateDownloader: React.FC = () => {
  const router = useRouter();
  const [internId, setInternId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadingDocument, setDownloadingDocument] = useState<string | null>(null);
  const [showSearchAnimation, setShowSearchAnimation] = useState(false);
  const [searchStep, setSearchStep] = useState(0);

  // Effect to handle URL parameters
  useEffect(() => {
    if (router.isReady) {
      const idFromUrl = router.query.id as string;
      if (idFromUrl && idFromUrl.trim()) {
        setInternId(idFromUrl.trim());
        // Auto-search if ID is provided in URL
        searchFromUrl(idFromUrl.trim());
      }
    }
  }, [router.isReady, router.query.id]);

  // Function to search from URL parameter
  const searchFromUrl = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setDownloadResult(null);

    try {
      const response = await fetch(`/api/verify-certificate?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch documents');
      }

      setDownloadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internId.trim()) {
      setError('Please enter an Intern ID');
      return;
    }

    // Start search animation
    setShowSearchAnimation(true);
    setSearchStep(0);
    setIsLoading(true);
    setError(null);
    setDownloadResult(null);

    try {
      // Step 0: Connecting to database
      setSearchStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 1: Making API call
      setSearchStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Validating during API call
      setSearchStep(2);
      const response = await fetch(`/api/verify-certificate?id=${encodeURIComponent(internId.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Step 3: Processing response
      setSearchStep(3);
      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 400));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch documents');
      }

      // Check if search actually succeeded
      if (!data.isValid) {
        throw new Error(data.message || 'No documents found for this ID');
      }

      // Step 4: Success (only if actually valid)
      setSearchStep(4);
      await new Promise(resolve => setTimeout(resolve, 800));

      setDownloadResult(data);
      
      // Close animation popup after showing success
      setTimeout(() => {
        setShowSearchAnimation(false);
      }, 1000);
    } catch (err) {
      // Show error in popup before closing
      setSearchStep(-1); // Error state
      setError(err instanceof Error ? err.message : 'An error occurred while fetching documents');
      
      // Keep popup open longer to show error
      setTimeout(() => {
        setShowSearchAnimation(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    setDownloadingDocument(document.type);
    
    try {
      if (document.downloadUrl) {
        // Create a temporary anchor element to trigger download
        const link = window.document.createElement('a');
        link.href = document.downloadUrl;
        link.download = `${document.type.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${internId}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else if (document.url) {
        window.open(document.url, '_blank');
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      if (document.url) {
        window.open(document.url, '_blank');
      }
    } finally {
      setDownloadingDocument(null);
    }
  };

  const handleDownloadAll = async () => {
    if (!downloadResult?.record?.documents) return;

    const availableDocuments = downloadResult.record.documents.filter(
      doc => doc.status !== 'Not Issued Yet' && (doc.downloadUrl || doc.url)
    );

    setDownloadingDocument('all');

    try {
      // Download all documents with a small delay between each
      for (let i = 0; i < availableDocuments.length; i++) {
        const doc = availableDocuments[i];
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
        
        if (doc.downloadUrl) {
          const link = window.document.createElement('a');
          link.href = doc.downloadUrl;
          link.download = `${doc.type.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${internId}.pdf`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else if (doc.url) {
          window.open(doc.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Bulk download failed:', error);
    } finally {
      setDownloadingDocument(null);
    }
  };

  const handlePreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const getGoogleDocsViewerUrl = (url: string): string => {
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
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
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

  // Function to get document type icon
  const getDocumentIcon = (type: string) => {
    if (type.toLowerCase().includes('certificate')) {
      return <Award className="h-5 w-5 text-blue-600" />;
    } else if (type.toLowerCase().includes('letter')) {
      return <Mail className="h-5 w-5 text-green-600" />;
    } else if (type.toLowerCase().includes('nda')) {
      return <Shield className="h-5 w-5 text-purple-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  // Function to generate thumbnail for certificates
  const getCertificateThumbnail = (url: string, type: string): string => {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && type.toLowerCase().includes('certificate')) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300-h200`;
    }
    return '';
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => {
    const thumbnail = getCertificateThumbnail(document.url, document.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start space-x-4">
            {/* Document Icon/Thumbnail */}
            <div className="flex-shrink-0">
              {thumbnail ? (
                <div className="relative group cursor-pointer" onClick={() => handlePreview(document)}>
                  <img
                    src={thumbnail}
                    alt={`${document.type} thumbnail`}
                    className="w-16 h-12 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                    onError={(e) => {
                      // If thumbnail fails to load, show icon instead
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      (target.nextElementSibling as HTMLElement)!.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-12 bg-blue-50 rounded-lg border border-gray-200 items-center justify-center hidden">
                    {getDocumentIcon(document.type)}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                  {getDocumentIcon(document.type)}
                </div>
              )}
            </div>
            
            {/* Document Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{document.type}</h4>
              
              {document.status && document.status !== 'Available' && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  document.status === 'Not Issued Yet' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {document.status === 'Not Issued Yet' ? '⏳' : '✅'} {document.status}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              {document.status === 'Not Issued Yet' ? (
                <div className="text-xs text-gray-500 italic flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Pending</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handlePreview(document)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Preview Document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDownload(document)}
                    disabled={downloadingDocument === document.type || (!document.downloadUrl && !document.url)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Download Document"
                  >
                    {downloadingDocument === document.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => window.open(document.url, '_blank')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <DownloadCloud className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Certificate Downloader</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Download your internship certificates and related documents from Jharkhand Engineer's Hub. 
            Enter your Intern ID to access all your documents in one place.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !internId.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FolderOpen className="h-5 w-5" />
                  <span>Find My Documents</span>
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

        {/* Download Results */}
        <AnimatePresence>
          {downloadResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className={`rounded-xl shadow-lg p-6 ${
                downloadResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  {downloadResult.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      downloadResult.isValid ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {downloadResult.isValid ? 'Documents Found ✓' : 'No Documents Found'}
                    </h2>
                    <p className={`${
                      downloadResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {downloadResult.message}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Intern ID Searched: <span className="font-mono font-semibold">{downloadResult.internIdSearched}</span></p>
                  <p>Searched At: {formatDate(downloadResult.verifiedAt)}</p>
                </div>
              </div>

              {/* Intern Details */}
              {downloadResult.record && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <User className="h-6 w-6 text-green-600" />
                    <span>Internship Details</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-semibold text-gray-900">{downloadResult.record.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <p className="font-semibold text-gray-900">{downloadResult.record.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{downloadResult.record.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Intern ID</p>
                          <p className="font-semibold text-gray-900 font-mono">{downloadResult.record.internId}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{downloadResult.record.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Start Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(downloadResult.record.startingDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(downloadResult.record.endDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Issue Date</p>
                          <p className="font-semibold text-gray-900">{formatDate(downloadResult.record.issueDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Documents Section */}
              {downloadResult.record && downloadResult.record.documents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <Archive className="h-6 w-6 text-green-600" />
                      <span>Available Documents</span>
                    </h3>
                    
                    {downloadResult.record.documents.some(doc => doc.status !== 'Not Issued Yet') && (
                      <button
                        onClick={handleDownloadAll}
                        disabled={downloadingDocument === 'all'}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                      >
                        {downloadingDocument === 'all' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span>Download All</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid gap-4">
                    {downloadResult.record.documents.map((document, index) => (
                      <DocumentCard key={index} document={document} />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Document Preview Modal */}
        <AnimatePresence>
          {previewDocument && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50`}
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
                <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white flex items-center justify-between">
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

        {/* Animated Search Popup */}
        <AnimatePresence>
          {showSearchAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  {/* Header */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <FolderOpen className="h-16 w-16 text-green-600" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-green-200 border-t-green-600 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Searching Documents</h3>
                  
                  {/* Progress Steps */}
                  <div className="space-y-4 mb-6">
                    {[
                      { text: 'Connecting to database...', step: 0 },
                      { text: 'Searching for documents...', step: 1 },
                      { text: 'Validating access...', step: 2 },
                      { text: 'Loading document list...', step: 3 },
                      { text: 'Search complete!', step: 4 }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3, x: -10 }}
                        animate={{ 
                          opacity: searchStep >= item.step ? 1 : 0.3,
                          x: searchStep >= item.step ? 0 : -10
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center space-x-3 text-left p-3 rounded-lg transition-colors ${
                          searchStep >= item.step 
                            ? 'bg-green-50 text-green-900' 
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {searchStep > item.step ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </motion.div>
                        ) : searchStep === item.step ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex-shrink-0"
                          >
                            <Loader2 className="h-5 w-5 text-green-600" />
                          </motion.div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-2 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(searchStep / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Please wait while we search for your documents...
                  </p>
                  
                  {/* Success Animation */}
                  {searchStep === 4 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold">Search Complete!</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Error Animation */}
                  {searchStep === -1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <div className="flex items-center justify-center space-x-2 text-red-600 mb-3">
                        <XCircle className="h-6 w-6" />
                        <span className="font-semibold">Search Failed!</span>
                      </div>
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
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

export default CertificateDownloader;
