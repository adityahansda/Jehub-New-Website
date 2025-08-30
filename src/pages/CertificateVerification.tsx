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
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  internId: string;
  verification: boolean;
  certificateUrl?: string;
  verifiedAt?: string;
  name: string;
  role: string;
  email: string;
  joiningType: string;
  duration: string;
  startingDate: string;
  endDate: string;
  issueDate: string;
  filterRowsToMerge?: string;
  mergedDocIdOfferLetter?: string;
  mergedDocUrlOfferLetter?: string;
  linkToMergedDocOfferLetter?: string;
  documentMergeStatusOfferLetter?: string;
  mergedDocIdNda?: string;
  mergedDocUrlNda?: string;
  linkToMergedDocNda?: string;
  documentMergeStatusNda?: string;
  lastUpdated?: string;
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
  const router = useRouter();
  const [internId, setInternId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVerificationAnimation, setShowVerificationAnimation] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  // Effect to handle URL parameters
  useEffect(() => {
    if (router.isReady) {
      const idFromUrl = router.query.id as string;
      if (idFromUrl && idFromUrl.trim()) {
        setInternId(idFromUrl.trim());
        // Auto-verify if ID is provided in URL
        verifyFromUrl(idFromUrl.trim());
      }
    }
  }, [router.isReady, router.query.id]);

  // Function to verify certificate from URL parameter
  const verifyFromUrl = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verify-certificate?id=${encodeURIComponent(id)}`, {
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internId.trim()) {
      setError('Please enter an Intern ID');
      return;
    }

    // Start verification animation
    setShowVerificationAnimation(true);
    setVerificationStep(0);
    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Step 0: Connecting to database
      setVerificationStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 1: Making API call
      setVerificationStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Validating during API call
      setVerificationStep(2);
      const response = await fetch(`/api/verify-certificate?id=${encodeURIComponent(internId.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Step 3: Processing response
      setVerificationStep(3);
      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 400));

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Check if verification actually succeeded
      if (!data.isValid) {
        throw new Error(data.message || 'Certificate not found or invalid');
      }

      // Step 4: Success (only if actually valid)
      setVerificationStep(4);
      await new Promise(resolve => setTimeout(resolve, 800));

      setVerificationResult(data);
      
      // Close animation popup after showing success
      setTimeout(() => {
        setShowVerificationAnimation(false);
      }, 1000);
    } catch (err) {
      // Show error in popup before closing
      setVerificationStep(-1); // Error state
      setError(err instanceof Error ? err.message : 'An error occurred during verification');
      
      // Keep popup open longer to show error
      setTimeout(() => {
        setShowVerificationAnimation(false);
      }, 3000);
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
      // Hide all controls and optimize for clean embedded viewing
      return `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true&widget=true&headers=false&gridlines=false&gid=0&single=true&rm=minimal`;
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

  // Function to generate full-size certificate image URL
  const getCertificateImageUrl = (url: string, type: string): string => {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && type.toLowerCase().includes('certificate')) {
      const fileId = fileIdMatch[1];
      // Use a larger size for full certificate display - works for both images and PDFs
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200-h900`;
    }
    return '';
  };

  // Function to generate thumbnail for certificates (backup)
  const getCertificateThumbnail = (url: string, type: string): string => {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch && type.toLowerCase().includes('certificate')) {
      const fileId = fileIdMatch[1];
      // Generate PDF thumbnail - Google Drive automatically creates thumbnails for PDFs
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
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
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Download Document"
                    disabled={!document.downloadUrl && !document.url}
                  >
                    <Download className="h-4 w-4" />
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

              {/* Certificate Preview Section */}
              {verificationResult.record && verificationResult.record.documents.length > 0 && (() => {
                // Find the certificate document
                const certificate = verificationResult.record.documents.find(doc => 
                  doc.type.toLowerCase().includes('certificate')
                );
                
                if (!certificate) return null;
                
                const certificateImageUrl = getCertificateImageUrl(certificate.url, certificate.type);
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Certificate Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                        <Award className="h-6 w-6" />
                        <span>Verified Certificate</span>
                      </h3>
                      <p className="text-blue-100 mt-1">Click on the certificate to view full size</p>
                    </div>
                    
                    {/* Certificate Preview */}
                    <div className="p-6">
                      {certificate.status === 'Not Issued Yet' ? (
                        <div className="text-center py-12">
                          <Shield className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Certificate Pending</h4>
                          <p className="text-gray-600">Your certificate is being processed and will be available soon.</p>
                          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Processing
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-6">
                          {/* Direct Certificate Preview with Google PDF Viewer */}
                          <div className="w-full flex justify-center">
                            <div className="relative max-w-6xl w-full">
                              {/* Google PDF Viewer Embedded - Displayed Directly */}
                              <div className="relative rounded-xl border-2 border-gray-200 shadow-2xl overflow-hidden bg-white">
                                <iframe
                                  src={getGoogleDocsViewerUrl(certificate.url)}
                                  className="w-full h-[600px] md:h-[700px] lg:h-[800px] border-0"
                                  title="Certificate Preview"
                                  loading="eager"
                                  onError={(e) => {
                                    // If Google Docs viewer fails, show fallback
                                    const target = e.target as HTMLIFrameElement;
                                    target.style.display = 'none';
                                    (target.nextElementSibling as HTMLElement)!.style.display = 'flex';
                                  }}
                                />
                                
                                {/* Fallback display if PDF viewer fails to load */}
                                <div className="w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl items-center justify-center flex-col space-y-6 hidden">
                                  <Award className="h-32 w-32 text-blue-400" />
                                  <p className="text-2xl font-medium text-gray-700">Certificate Preview</p>
                                  <p className="text-lg text-gray-500 text-center px-4">Unable to load preview. Please use the buttons below to view or download your certificate.</p>
                                  <div className="flex space-x-4">
                                    <button
                                      onClick={() => handlePreview(certificate)}
                                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>View in Modal</span>
                                    </button>
                                    <button
                                      onClick={() => window.open(certificate.url, '_blank')}
                                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span>Open Original</span>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Action buttons overlay */}
                                <div className="absolute top-4 right-4 flex space-x-2">
                                  <button
                                    onClick={() => handlePreview(certificate)}
                                    className="bg-white/95 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                                    title="View in Full Screen Modal"
                                  >
                                    <Maximize2 className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(certificate)}
                                    className="bg-white/95 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                                    title="Download Certificate"
                                  >
                                    <Download className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => window.open(certificate.url, '_blank')}
                                    className="bg-white/95 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                                    title="Open in New Tab"
                                  >
                                    <ExternalLink className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Certificate Info */}
                          <div className="text-center">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{certificate.type}</h4>
                            <p className="text-gray-600">Verified and authenticated certificate</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
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

        {/* Animated Verification Popup */}
        <AnimatePresence>
          {showVerificationAnimation && (
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
                      <Shield className="h-16 w-16 text-blue-600" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Verifying Certificate</h3>
                  
                  {/* Progress Steps */}
                  <div className="space-y-4 mb-6">
                    {[
                      { text: 'Connecting to database...', step: 0 },
                      { text: 'Searching for certificate...', step: 1 },
                      { text: 'Validating credentials...', step: 2 },
                      { text: 'Loading documents...', step: 3 },
                      { text: 'Verification complete!', step: 4 }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.3, x: -10 }}
                        animate={{ 
                          opacity: verificationStep >= item.step ? 1 : 0.3,
                          x: verificationStep >= item.step ? 0 : -10
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center space-x-3 text-left p-3 rounded-lg transition-colors ${
                          verificationStep >= item.step 
                            ? 'bg-blue-50 text-blue-900' 
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {verificationStep > item.step ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </motion.div>
                        ) : verificationStep === item.step ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex-shrink-0"
                          >
                            <Loader2 className="h-5 w-5 text-blue-600" />
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
                      animate={{ width: `${(verificationStep / 4) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Please wait while we verify your certificate...
                  </p>
                  
                  {/* Success Animation */}
                  {verificationStep === 4 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-6 w-6" />
                        <span className="font-semibold">Verification Successful!</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Error Animation */}
                  {verificationStep === -1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4"
                    >
                      <div className="flex items-center justify-center space-x-2 text-red-600 mb-3">
                        <XCircle className="h-6 w-6" />
                        <span className="font-semibold">Verification Failed!</span>
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

export default CertificateVerification;
