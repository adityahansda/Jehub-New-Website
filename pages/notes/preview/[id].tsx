import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
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
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CheckCircle,
  X,
  XCircle,
  AlertCircle,
  Loader,
  FileText,
  Palette
} from 'lucide-react';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
import { checkUrlStatus } from '@/lib/pdfValidation';
import LoadingSpinner from '@/components/LoadingSpinner';
import GoogleDocsPDFViewer from '@/components/GoogleDocsPDFViewer';
import EnhancedCommentsSection from '@/components/EnhancedCommentsSection';
import ReportModal from '@/components/ReportModal';
import ReportsSection from '@/components/ReportsSection';

// Format file size in human-readable format
function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return 'Unknown';

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

// Convert raw GitHub URL to download URL
function convertToDownloadUrl(url: string): string {
  if (!url) return url;

  // console.log('Converting URL to download:', url); // Suppressed for production

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
      // console.log('Converted to download URL:', downloadUrl); // Suppressed for production
      return downloadUrl;
    }
  }

  // Handle github.com/user/repo/raw/ URLs
  if (url.includes('github.com') && url.includes('/raw/')) {
    // console.log('Already a GitHub raw URL for download:', url); // Suppressed for production
    return url;
  }

  // Handle github.com/user/repo/blob/ URLs (convert to raw for download)
  if (url.includes('github.com') && url.includes('/blob/')) {
    const downloadUrl = url.replace('/blob/', '/raw/');
    // console.log('Converted blob to raw URL:', downloadUrl); // Suppressed for production
    return downloadUrl;
  }

  // If it's already a download URL or other format, return as is
  // console.log('URL unchanged:', url); // Suppressed for production
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
  views: number;
  reports: number;
  fileSize: number | null;
  noteType: 'free' | 'premium';
  degree: string;
  uploaderDetails?: {
    name: string;
    notesUploaded: number;
    totalPoints: number;
    memberSince: string;
  };
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
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [downloadPopup, setDownloadPopup] = useState<{
    show: boolean;
    noteTitle: string;
    status: 'downloading' | 'success' | 'error';
  }>({ show: false, noteTitle: '', status: 'downloading' });

  // PDF validation function
  const validatePdfUrl = async (url: string) => {
    if (!url) return;

    setPdfValidationStatus('checking');
    try {
      const validation = await checkUrlStatus(url);
      setPdfValidationStatus(validation.status);

      if (validation.status === 'deleted') {
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
        setError(''); // Clear any previous errors

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
          points: response.points || 50,
          views: response.views || 0,
          reports: response.reports || 0,
          fileSize: response.fileSize || null,
          noteType: response.noteType || 'free',
          degree: response.degree,
          uploaderDetails: {
            name: response.authorName,
            notesUploaded: response.uploaderNotesCount || 0,
            totalPoints: response.uploaderTotalPoints || 0,
            memberSince: response.uploaderMemberSince || response.uploadDate
          }
        };

        setNote(fetchedNote);

        // Track view - increment view count
        try {
          await fetch(`/api/notes/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'increment_view' })
          });
          // Update local state with new view count without triggering re-renders
          setNote(prev => {
            if (prev) {
              return { ...prev, views: prev.views + 1 };
            }
            return prev;
          });
        } catch (viewError) {
          console.warn('Failed to track view:', viewError);
        }

        // Validate PDF URL if available
        if (fetchedNote.githubUrl) {
          validatePdfUrl(fetchedNote.githubUrl);
        }
      } catch (err: any) {
        console.error('Error fetching note:', err);

        // Provide more specific error messages
        if (err.code === 404) {
          setError('Note not found. It may have been removed or the link is incorrect.');
        } else if (err.code === 500) {
          setError('Server error. Please try again in a few moments.');
        } else if (err.message?.includes('Network')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to fetch note details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);


  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: ''
  });

  // Report modal and reports state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showReports, setShowReports] = useState(true);

  // Track report modal state changes

  // For now, allow anyone to comment (no login required)
  useEffect(() => {
    // Set to true to allow anyone to comment
    setIsLoggedIn(true);

    // Load user info from localStorage
    const savedUserInfo = localStorage.getItem('guestUserInfo');
    if (savedUserInfo) {
      try {
        setUserInfo(JSON.parse(savedUserInfo));
      } catch (error) {
        console.error('Error parsing saved user info:', error);
      }
    }
  }, []);

  // Fetch comments for the current note
  const fetchComments = async () => {
    if (!note?.id) return;

    try {
      setLoadingComments(true);
      const response = await fetch(`/api/comments?noteId=${note.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Optionally show error toast or notification
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch comments when note is loaded
  useEffect(() => {
    if (note?.id) {
      fetchComments();
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Fetch reports for the current note
  const fetchReports = async () => {
    if (!note?.id) return;

    try {
      setLoadingReports(true);
      const response = await fetch(`/api/reports?noteId=${note.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      // Map Appwrite document format to component format
      const formattedReports = data.map((report: Models.Document) => ({
        ...report,
        id: report.$id || report.id
      }));
      setReports(formattedReports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

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

        const fetchedRelatedNotes = response.documents.map((doc: Models.Document) => ({
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
          views: doc.views || 0,
          reports: doc.reports || 0,
          fileSize: doc.fileSize || null,
          noteType: doc.noteType || 'free',
          degree: doc.degree
        }));

        setRelatedNotes(fetchedRelatedNotes);
      } catch (err) {
        console.error('Error fetching related notes:', err);
      }
    };

    fetchRelatedNotes();
  }, [note?.id, note?.subject]);


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
    setShowReportModal(true);
  };

  // Handle report submission
  const handleReportSubmit = async (reportData: {
    reason: string;
    description: string;
    reporterName: string;
    reporterEmail: string;
  }) => {
    if (!note) return;

    try {
      setSubmittingReport(true);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          ...reportData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      const result = await response.json();

      // Refresh reports to get updated list
      await fetchReports();

      // Update note's report count
      setNote(prev => prev ? { ...prev, reports: (prev.reports || 0) + 1 } : null);

      setShowReportModal(false);

      // Report submitted successfully

    } catch (error) {
      console.error('Error submitting report:', error);
      throw error; // Let the modal handle the error display
    } finally {
      setSubmittingReport(false);
    }
  };

  // Handle report voting
  const handleReportVote = async (reportId: string, voteType: 'up' | 'down') => {
    try {
      const apiVoteType = voteType === 'up' ? 'upvote' : 'downvote';
      const response = await fetch('/api/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          action: apiVoteType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to vote on report');
      }

      // Refresh reports to get updated vote counts
      await fetchReports();

    } catch (error) {
      console.error('Error voting on report:', error);
      throw error;
    }
  };

  // Enhanced comment submit with reply support
  const handleEnhancedCommentSubmit = async (content: string, parentCommentId?: string) => {
    if (!note?.id) return;

    // Check if user info is available
    if (!userInfo.name) {
      setShowUserForm(true);
      return;
    }

    try {
      setSubmittingComment(true);

      // Check if this is the user's first comment (avatar generation needed)
      const savedUserInfo = localStorage.getItem('guestUserInfo');
      const userHasCustomAvatar = savedUserInfo && JSON.parse(savedUserInfo).customAvatar;
      const userHasGeneratedAvatar = savedUserInfo && JSON.parse(savedUserInfo).hasGeneratedAvatar;
      
      // Use provided user info or generate default
      const currentUser = {
        userId: 'guest_' + Date.now(),
        userName: userInfo.name || 'Anonymous User',
        userAvatar: getAvatarUrl(userInfo.name || userInfo.email)
      };

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          userId: currentUser.userId,
          userName: currentUser.userName,
          userAvatar: currentUser.userAvatar,
          content: content.trim(),
          parentCommentId: parentCommentId || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const data = await response.json();

      // Mark that user has generated avatar if this was their first comment
      if (!userHasCustomAvatar && !userHasGeneratedAvatar && savedUserInfo) {
        const updatedInfo = { ...JSON.parse(savedUserInfo), hasGeneratedAvatar: true };
        localStorage.setItem('guestUserInfo', JSON.stringify(updatedInfo));
      }

      // Refresh comments to get updated threaded structure
      await fetchComments();

      // Comment submitted successfully

    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle comment likes
  const handleCommentLike = async (commentId: string, isLiked: boolean) => {
    try {
      // Handle comment like/unlike

      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          action: isLiked ? 'like' : 'unlike'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to update comment like: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      // Like update successful

      // Refresh comments to get updated like counts
      await fetchComments();

    } catch (error) {
      console.error('Error updating comment like:', error);
      throw error; // Re-throw to allow component to handle optimistic update rollback
    }
  };

  // Keep original for backward compatibility
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await handleEnhancedCommentSubmit(newComment.trim());
    setNewComment('');
  };

  const closePopup = () => {
    setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
  };

  // Generate avatar URL based on name or email
  const getAvatarUrl = (identifier: string) => {
    if (!identifier) return 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop';

    // Generate a simple avatar using DiceBear API or use a default
    const seed = identifier.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4&size=150`;
  };

  // Handle user form submission
  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name.trim()) return;

    // Save to localStorage
    localStorage.setItem('guestUserInfo', JSON.stringify(userInfo));
    setShowUserForm(false);

    // Now submit the comment
    handleCommentSubmit(e);
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            {/* Note Header */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
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
                      <span>{note.views} views</span>
                    </div>
                    {note.fileSize && note.fileSize > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{formatFileSize(note.fileSize)}</span>
                      </div>
                    )}
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
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-base lg:text-lg font-bold self-start">
                  {note.points} pts
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                >
                  <Download className="h-5 w-5" />
                  <span className="hidden sm:inline">Download Notes</span>
                  <span className="sm:hidden">Download</span>
                </button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleLike}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-initial ${isLiked
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200 flex-1 sm:flex-initial"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handleReport}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200 flex-1 sm:flex-initial"
                  >
                    <Flag className="h-5 w-5" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                </div>
              </div>
            </div>

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
                  <Loader className="animate-spin h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-blue-800">Validating PDF availability...</span>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">PDF Preview</h3>
              {pdfValidationStatus === 'deleted' ? (
                <div className="text-center py-8 text-red-500">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">PDF Not Available</h3>
                  <p className="text-red-700 mb-4">This PDF file has been deleted from GitHub and cannot be previewed.</p>
                  <p className="text-sm text-red-600">Contact the administrator for assistance.</p>
                </div>
              ) : note && note.githubUrl ? (
                <GoogleDocsPDFViewer
                  pdfUrl={note.githubUrl}
                  fileName={note.fileName}
                  onDownload={handleDownload}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Loader className="animate-spin h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading PDF...</h3>
                  <p className="text-gray-600">Please wait while we load the PDF.</p>
                </div>
              )}
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 mt-4 lg:mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Community Reports ({reports.length})</h3>
              </div>

              {loadingReports ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Loading reports...</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <Flag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reports have been submitted yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Help maintain quality by reporting any issues you find.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const netVotes = (report.upvotes || 0) - (report.downvotes || 0);
                    
                    return (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Reporter Avatar */}
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-gray-900 truncate">
                                    {report.reporterName || 'Anonymous'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                    report.reason === 'Copyright Violation' ? 'bg-red-100 text-red-800 border-red-200' :
                                    report.reason === 'Inappropriate Content' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                    report.reason === 'Spam or Misleading' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    report.reason === 'Wrong Subject/Category' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    report.reason === 'Poor Quality' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    report.reason === 'Broken Link/File' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}>
                                    {report.reason || 'Other'}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(report.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Voting Controls */}
                              <div className="flex items-center gap-2 ml-4">
                                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => handleReportVote(report.id, 'up')}
                                    className={`p-2 transition-colors hover:bg-green-100 ${
                                      report.userVote === 'up' 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'text-gray-600 hover:text-green-600'
                                    }`}
                                    title="Upvote this report"
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </button>
                                  <span className={`px-2 py-1 text-sm font-medium ${
                                    netVotes > 0 
                                      ? 'text-green-600' 
                                      : netVotes < 0 
                                        ? 'text-red-600' 
                                        : 'text-gray-600'
                                  }`}>
                                    {netVotes > 0 ? `+${netVotes}` : netVotes}
                                  </span>
                                  <button
                                    onClick={() => handleReportVote(report.id, 'down')}
                                    className={`p-2 transition-colors hover:bg-red-100 ${
                                      report.userVote === 'down' 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'text-gray-600 hover:text-red-600'
                                    }`}
                                    title="Downvote this report"
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="mt-2">
                              <p className="text-gray-700 text-sm">
                                {report.description || 'No additional details provided.'}
                              </p>
                            </div>

                            {/* Vote Summary */}
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {report.upvotes || 0} helpful
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsDown className="h-3 w-3" />
                                {report.downvotes || 0} not helpful
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                Report #{(report.id || '').slice(-8) || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Enhanced Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 mt-4 lg:mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h3>
              </div>

              {isLoggedIn ? (
                loadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    <span className="text-gray-600">Loading comments...</span>
                  </div>
                ) : (
                  <EnhancedCommentsSection
                    comments={comments}
                    onCommentSubmit={handleEnhancedCommentSubmit}
                    onCommentLike={handleCommentLike}
                    submittingComment={submittingComment}
                    userInfo={userInfo}
                  />
                )
              ) : (
                <div className="border border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Login to Comment</h3>
                  <p className="text-gray-600 mb-4">You need to be logged in to post comments on this note.</p>
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login to Comment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Downloads</span>
                  <span className="font-semibold">{note.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{note.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-semibold">{note.likes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Comments</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reports</span>
                  <span className="font-semibold text-red-600">{note.reports || 0}</span>
                </div>
              </div>
            </div>

            {/* Uploader Info */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Related Notes</h3>
              <div className="space-y-4">
                {relatedNotes.map((relatedNote) => (
                  <Link
                    key={relatedNote.id}
                    href={`/notes/preview/${relatedNote.id}`}
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

      {/* User Info Form Popup */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tell us about yourself</h3>
              <button
                onClick={() => setShowUserForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit}>
              <div className="mb-4">
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="userName"
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 We'll create a unique avatar for you based on your name
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  id="userEmail"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We&apos;ll use this to generate a unique avatar for you.
                </p>
              </div>

              <div className="mb-4">
                <Link
                  href="/avatar-customizer"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
                  onClick={() => setShowUserForm(false)}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  Want to create a custom avatar?
                </Link>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save & Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Popup */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-gray-700 mb-2">
                  You need to be logged in to comment on this note.
                </p>
                <p className="text-sm text-gray-600">
                  Please log in to join the discussion.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                onClick={() => setShowLoginPrompt(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
                onClick={() => setShowLoginPrompt(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        submitting={submittingReport}
        noteTitle={note?.title || ''}
      />

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
