import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('../../components/PDFViewer'), {
  ssr: false,
  loading: () => <p>Loading PDF viewer...</p>
});
import {
  Download,
  Eye,
  Heart,
  Share2,
  Flag,
  User,
  Calendar,
  BookOpen,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ThumbsUp,
  MessageCircle,
  CheckCircle,
  X,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { databases } from '../../lib/appwrite';
import { Query } from 'appwrite';
import { checkUrlStatus } from '../../lib/pdfValidation';
import LoadingSpinner from '../../components/LoadingSpinner';

// Convert raw GitHub URL to download URL
function convertToDownloadUrl(url: string): string {
  if (!url) return url;

  console.log('Converting URL to download:', url);

  // Handle raw.githubusercontent.com URLs
  if (url.includes('raw.githubusercontent.com')) {
    // Convert: https://raw.githubusercontent.com/user/repo/main/path/file.pdf
    // To: https://github.com/user/repo/raw/main/path/file.pdf
    const parts = url.replace('https://raw.githubusercontent.com/', '').split('/');
    if (parts.length >= 3) {
      const user = parts[0];
      const repo = parts[1];
      const branch = parts[2];
      const filePath = parts.slice(3).join('/');
      const downloadUrl = `https://github.com/${user}/${repo}/raw/${branch}/${filePath}`;
      console.log('Converted to download URL:', downloadUrl);
      return downloadUrl;
    }
  }

  // Handle github.com/user/repo/raw/ URLs
  if (url.includes('github.com') && url.includes('/raw/')) {
    console.log('Already a GitHub raw URL for download:', url);
    return url;
  }

  // Handle github.com/user/repo/blob/ URLs (convert to raw for download)
  if (url.includes('github.com') && url.includes('/blob/')) {
    const downloadUrl = url.replace('/blob/', '/raw/');
    console.log('Converted blob to raw URL:', downloadUrl);
    return downloadUrl;
  }

  // If it's already a download URL or other format, return as is
  console.log('URL unchanged:', url);
  return url;
}


// Transform download URLs to viewable URLs
function transformUrlForViewing(url: string): string {
  if (!url) return url;

  console.log('Transforming URL for viewing:', url);

  // Handle GitHub URLs
  if (url.includes('github.com')) {
    // Convert GitHub blob URL to raw URL for viewing
    if (url.includes('/blob/')) {
      const rawUrl = url.replace('/blob/', '/raw/');
      console.log('Converted blob to raw for viewing:', rawUrl);
      return rawUrl;
    }
    // If it's already a raw URL, return as is
    if (url.includes('/raw/')) {
      console.log('Already a raw URL for viewing:', url);
      return url;
    }
  }

  // Handle raw.githubusercontent.com URLs (already good for viewing)
  if (url.includes('raw.githubusercontent.com')) {
    console.log('Raw githubusercontent URL for viewing:', url);
    return url;
  }

  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) ||
      url.match(/id=([a-zA-Z0-9-_]+)/) ||
      url.match(/\/d\/([a-zA-Z0-9-_]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // Handle Dropbox URLs
  if (url.includes('dropbox.com')) {
    // Convert Dropbox share URL to direct link
    if (url.includes('?dl=0')) {
      return url.replace('?dl=0', '?dl=1');
    }
    if (!url.includes('?dl=')) {
      return url + '?dl=1';
    }
  }

  // Handle OneDrive URLs
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    // OneDrive requires specific embedding format
    if (url.includes('1drv.ms')) {
      // For shortened OneDrive URLs, we'll try to use them directly
      return url;
    }
  }

  // Add CORS proxy for external URLs if needed
  if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    // Try to load directly first, fallback to CORS proxy if needed
    return url;
  }

  return url;
}


type Note = {
  id: string;
  title: string;
  branch: string;
  semester: string;
  subject: string;
  description: string;
  tags: string[];
  uploader: string;
  uploadDate: string;
  githubUrl: string;
  fileName: string;
  downloads: number;
  likes: number;
  points: number;
  degree: string;
};

const NotesPreview = () => {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [pdfValidationStatus, setPdfValidationStatus] = useState<'checking' | 'valid' | 'deleted' | 'error' | null>(null);
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);

  // Load liked status from localStorage when note is loaded
  useEffect(() => {
    if (note) {
      const savedLikedNotes = localStorage.getItem('likedNotes');
      if (savedLikedNotes) {
        try {
          const likedNotesArray = JSON.parse(savedLikedNotes);
          setIsLiked(likedNotesArray.includes(note.id));
        } catch (error) {
          console.error('Error parsing liked notes from localStorage:', error);
        }
      }
    }
  }, [note]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [downloadPopup, setDownloadPopup] = useState<{
    show: boolean;
    noteTitle: string;
    status: 'downloading' | 'success' | 'error';
  }>({ show: false, noteTitle: '', status: 'downloading' });

  // PDF-related state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Function to validate PDF URL
  const validatePdfUrl = async (url: string) => {
    setPdfValidationStatus('checking');
    try {
      const result = await checkUrlStatus(url);
      setPdfValidationStatus(result.status);
      
      if (result.status === 'deleted') {
        setShowDeletedMessage(true);
      }
    } catch (error) {
      console.error('PDF validation error:', error);
      setPdfValidationStatus('error');
    }
  };

  // Fetch note data from database
  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          id as string
        );

        const fetchedNote = {
          id: response.$id,
          title: response.title,
          branch: response.branch,
          semester: response.semester,
          subject: response.subject,
          description: response.description,
          tags: response.tags,
          uploader: response.authorName,
          uploadDate: response.uploadDate,
          githubUrl: response.githubUrl,
          fileName: response.fileName,
          downloads: response.downloads,
          likes: response.likes,
          points: response.points || 0,
          degree: response.degree
        };

        setNote(fetchedNote);

        // Set PDF URL if available and transform for viewing
        if (fetchedNote.githubUrl) {
          const viewableUrl = transformUrlForViewing(fetchedNote.githubUrl);
          console.log('Original URL:', fetchedNote.githubUrl);
          console.log('Transformed URL:', viewableUrl);
          setPdfUrl(viewableUrl);
          
          // Validate PDF URL
          validatePdfUrl(fetchedNote.githubUrl);
        }
      } catch (err) {
        setError('Failed to fetch note details. Please try again later.');
        console.error('Error fetching note:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);


  // Mock comments
  const comments = [
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'These notes are incredibly detailed! Really helped me understand the concepts better.',
      timestamp: '2 hours ago',
      likes: 5
    },
    {
      id: '2',
      user: 'Mike Davis',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Perfect for exam preparation. The examples are very clear.',
      timestamp: '1 day ago',
      likes: 3
    }
  ];

  // Related notes state
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);

  // Fetch related notes when note is loaded
  useEffect(() => {
    const fetchRelatedNotes = async () => {
      if (!note) return;

      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          [
            Query.equal('subject', note.subject),
            Query.notEqual('$id', note.id),
            Query.limit(3)
          ]
        );

        const fetchedRelatedNotes = response.documents.map(doc => ({
          id: doc.$id,
          title: doc.title,
          branch: doc.branch,
          semester: doc.semester,
          subject: doc.subject,
          description: doc.description,
          tags: doc.tags,
          uploader: doc.authorName,
          uploadDate: doc.uploadDate,
          githubUrl: doc.githubUrl,
          fileName: doc.fileName,
          downloads: doc.downloads,
          likes: doc.likes,
          points: doc.points || 0,
          degree: doc.degree
        }));

        setRelatedNotes(fetchedRelatedNotes);
      } catch (err) {
        console.error('Error fetching related notes:', err);
      }
    };

    fetchRelatedNotes();
  }, [note]);


  const handleDownload = async () => {
    if (!note) return;

    // Check if PDF is deleted before attempting download
    if (pdfValidationStatus === 'deleted') {
      setShowDeletedMessage(true);
      return;
    }

    // Show download popup
    setDownloadPopup({
      show: true,
      noteTitle: note.title,
      status: 'downloading'
    });

    try {
      // Update download count in database
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        note.id,
        {
          downloads: note.downloads + 1
        }
      );

      // Update local state
      setNote({ ...note, downloads: note.downloads + 1 });

      // Convert raw URL to download URL and create download link
      const downloadUrl = convertToDownloadUrl(note.githubUrl) || `https://example.com/notes/${note.fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', note.fileName);
      link.target = '_blank'; // Open in new tab for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update popup status
      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'success' }));

        // Auto-hide after 2 seconds
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 2000);
      }, 500);
    } catch (error) {
      console.error('Error updating download count:', error);

      // Still proceed with download but show error status
      const downloadUrl = convertToDownloadUrl(note.githubUrl) || `https://example.com/notes/${note.fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', note.fileName);
      link.target = '_blank'; // Open in new tab for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update popup status to show error
      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'error' }));

        // Auto-hide after 3 seconds for error
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 3000);
      }, 500);
    }
  };

  const handleLike = async () => {
    if (!note) return;

    try {
      const newLikes = isLiked ? note.likes - 1 : note.likes + 1;

      // Update database
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        note.id,
        { likes: newLikes }
      );

      // Update local state
      setNote({ ...note, likes: newLikes });
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);

      // Update localStorage
      const savedLikedNotes = localStorage.getItem('likedNotes');
      let likedNotesArray = [];
      if (savedLikedNotes) {
        try {
          likedNotesArray = JSON.parse(savedLikedNotes);
        } catch (error) {
          console.error('Error parsing liked notes from localStorage:', error);
        }
      }

      if (newIsLiked) {
        if (!likedNotesArray.includes(note.id)) {
          likedNotesArray.push(note.id);
        }
      } else {
        likedNotesArray = likedNotesArray.filter((id: string) => id !== note.id);
      }

      localStorage.setItem('likedNotes', JSON.stringify(likedNotesArray));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = () => {
    if (!note) return;

    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    if (!note) return;

    console.log('Reporting note:', note.id);
    alert('Thank you for your report. We will review this content.');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const closePopup = () => {
    setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading note details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Note</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/notes-download"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show note not found state
  if (!note) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Note Not Found</h3>
            <p className="text-gray-600 mb-4">The note you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link
              href="/notes-download"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/notes-download"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Notes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            {/* Note Header */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {note.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{note.uploader}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(note.uploadDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{note.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>1,234 views</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{note.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {note.branch}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {note.semester} Semester
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {note.subject}
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {note.degree}
                    </span>
                    {note.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                  {note.points} pts
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Download className="h-5 w-5" />
                  Download Notes
                </button>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isLiked
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                    }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
                >
                  <Flag className="h-5 w-5" />
                  Report
                </button>
              </div>
            </div>

            {/* Debug Info */}
            {note && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p><strong>Original GitHub URL:</strong> <span className="break-all">{note.githubUrl}</span></p>
                  <p><strong>PDF URL for viewing:</strong> <span className="break-all">{pdfUrl}</span></p>
                  <p><strong>Download URL would be:</strong> <span className="break-all">{note.githubUrl ? convertToDownloadUrl(note.githubUrl) : 'N/A'}</span></p>
                </div>
              </div>
            )}

            {/* Deleted PDF Message */}
            {showDeletedMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Note Deleted</h3>
                    <p className="text-red-700">This PDF file has been removed from GitHub and is no longer available.</p>
                  </div>
                </div>
                <div className="bg-red-100 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium mb-2">What happened?</p>
                  <p className="text-red-700 text-sm mb-2">
                    The PDF file linked to this note has been deleted from GitHub and cannot be accessed or downloaded.
                  </p>
                  <p className="text-red-700 text-sm">
                    This usually happens when the file is removed from the repository or the repository becomes private.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowDeletedMessage(false)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Dismiss
                  </button>
                  <p className="text-sm text-red-600">
                    <strong>Need help?</strong> Contact the administrator to report this issue.
                  </p>
                </div>
              </div>
            )}

            {/* PDF Validation Status */}
            {pdfValidationStatus === 'checking' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <LoadingSpinner size="small" className="mr-2" />
                  <span className="text-blue-800">Validating PDF availability...</span>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">PDF Preview</h3>
              {pdfValidationStatus === 'deleted' ? (
                <div className="text-center py-8 text-red-500">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">PDF Not Available</h3>
                  <p className="text-red-700 mb-4">This PDF file has been deleted from GitHub and cannot be previewed.</p>
                  <p className="text-sm text-red-600">Contact the administrator for assistance.</p>
                </div>
              ) : pdfUrl ? (
                <PDFViewer
                  url={pdfUrl}
                  fileName={note.fileName}
                  onDownload={handleDownload}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No PDF Available</h3>
                  <p className="text-gray-600">This note doesn&apos;t have a PDF file attached.</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h3>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showComments ? 'Hide' : 'Show'} Comments
                </button>
              </div>

              {showComments && (
                <div className="space-y-6">
                  {/* Add Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="border-b border-gray-200 pb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Image
                          src={comment.avatar}
                          alt={comment.user}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{comment.user}</h4>
                              <span className="text-sm text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                              <ThumbsUp className="h-4 w-4" />
                              <span className="text-sm">{comment.likes}</span>
                            </button>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-semibold">{note.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-semibold">{note.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Uploader Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Uploader</h3>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt={note.uploader}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{note.uploader}</h4>
                  <p className="text-sm text-gray-600">Scholar Level</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Notes Uploaded</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold">2,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">Aug 2023</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Profile
              </button>
            </div>

            {/* Related Notes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Notes</h3>
              <div className="space-y-4">
                {relatedNotes.map((relatedNote) => (
                  <Link
                    key={relatedNote.id}
                    href={`/notes-preview/${relatedNote.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {relatedNote.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      by {relatedNote.uploader}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">{relatedNote.downloads} downloads</span>
                      <span className="text-xs font-medium text-purple-600">{relatedNote.points} pts</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/notes-download"
                className="block w-full mt-4 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View All Notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Download Popup */}
      {downloadPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-slideUp">
            {/* Popup Content */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {downloadPopup.status === 'downloading' ? 'Downloading...' :
                  downloadPopup.status === 'success' ? 'Download Complete!' : 'Download Failed'}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              {downloadPopup.status === 'downloading' && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              )}
              {downloadPopup.status === 'success' && (
                <CheckCircle className="h-8 w-8 text-green-600 mr-3 animate-bounce" />
              )}
              {downloadPopup.status === 'error' && (
                <X className="h-8 w-8 text-red-600 mr-3" />
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {downloadPopup.status === 'downloading' ? 'Preparing your download...' :
                    downloadPopup.status === 'success' ? 'Your file is ready!' :
                      'Something went wrong. Please try again.'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {downloadPopup.noteTitle}
                </p>
              </div>
            </div>

            {downloadPopup.status === 'downloading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
              </div>
            )}

            {downloadPopup.status === 'success' && (
              <div className="flex justify-end">
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPreview;
