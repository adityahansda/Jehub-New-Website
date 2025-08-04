import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Eye, Calendar, User, Tag, CheckCircle, X, Heart, Share2, Grid, List, FileText, Coins, AlertTriangle } from 'lucide-react';
import { generateNoteSlug } from '../utils/seo';
import { showError, showWarning, showSuccess, showConfirmation, showInfo } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { checkUrlStatus } from '../lib/pdfValidation';
import { databases } from '../lib/appwrite';
import PageHeader from '../components/PageHeader';
import UniversalSidebar from '../components/UniversalSidebar';
import { useAuth } from '../contexts/AuthContext';
import { pointsService } from '../services/pointsService';

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
};

const NotesDownload = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userPoints, setUserPoints] = useState({ availablePoints: 0, totalPoints: 0 });
  const [pointsLoading, setPointsLoading] = useState(false);
  const [filters, setFilters] = useState({
    branch: '',
    semester: '',
    subject: '',
    degree: ''
  });

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloadPopup, setDownloadPopup] = useState<{
    show: boolean;
    noteTitle: string;
    status: 'downloading' | 'success' | 'error';
  }>({ show: false, noteTitle: '', status: 'downloading' });
  const [likedNotes, setLikedNotes] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [noteRequirements, setNoteRequirements] = useState<Record<string, { required: boolean; points: number; category: string }>>({});

  // Load liked notes from localStorage on component mount
  useEffect(() => {
    const savedLikedNotes = localStorage.getItem('likedNotes');
    if (savedLikedNotes) {
      try {
        const likedNotesArray = JSON.parse(savedLikedNotes);
        setLikedNotes(new Set(likedNotesArray));
      } catch (error) {
        console.error('Error parsing liked notes from localStorage:', error);
      }
    }
  }, []);

  // Save liked notes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('likedNotes', JSON.stringify(Array.from(likedNotes)));
  }, [likedNotes]);

  // Load user points when user changes
  useEffect(() => {
    const loadUserPoints = async () => {
      if (user && user.email) {
        try {
          setPointsLoading(true);
          console.log('Loading points for user:', user.$id, user.email);
          
          // Use the new email-based method
          const points = await pointsService.getUserPointsByEmail(user.email);
          
          console.log('Points from getUserPointsByEmail:', points);
          
          setUserPoints(points);
        } catch (error) {
          console.error('Error loading user points:', error);
        } finally {
          setPointsLoading(false);
        }
      } else {
        setUserPoints({ availablePoints: 0, totalPoints: 0 });
      }
    };

    loadUserPoints();
  }, [user]);

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const branches = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const degrees = ['B.Tech', 'Diploma'];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notes');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setNotes(data.notes);
        
        // Load download requirements for all notes
        const requirements: Record<string, { required: boolean; points: number; category: string }> = {};
        for (const note of data.notes) {
          try {
            const noteReq = await pointsService.getNoteDownloadRequirements(note.id);
            if (noteReq) {
              requirements[note.id] = noteReq;
            }
          } catch (error) {
            console.error(`Error loading requirements for note ${note.id}:`, error);
          }
        }
        setNoteRequirements(requirements);
        
      } catch (err) {
        setError('Failed to fetch notes. Please try again later.');
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !filters.branch || note.branch === filters.branch;
    const matchesSemester = !filters.semester || note.semester === filters.semester;
    const matchesDegree = !filters.degree || note.degree === filters.degree;
    const matchesSubject = !filters.subject || note.subject.toLowerCase().includes(filters.subject.toLowerCase());

    return matchesSearch && matchesBranch && matchesSemester && matchesSubject && matchesDegree;
  });

  const handleDownload = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Check download requirements
    const requirement = noteRequirements[noteId];
    const requiredPoints = requirement?.points || note.points || 0;
    const isPointsRequired = requiredPoints > 0;

    // If points are required and user is not authenticated
    if (isPointsRequired && !user) {
      showWarning('Please sign in to download this premium note. Premium notes require points to download.');
      return;
    }

    // If points are required, check if user has enough points
    if (isPointsRequired && user && userPoints.availablePoints < requiredPoints) {
      const pointsNeeded = requiredPoints - userPoints.availablePoints;
      const earningSuggestions = [
        `Refer a friend: +50 pts`,
        `Upload notes: +30 pts`,
        `Complete profile: +20 pts`
      ];
      
      const message = `Insufficient Points! Required: ${requiredPoints} points, Available: ${userPoints.availablePoints} points, Needed: ${pointsNeeded} more points. Ways to earn: Refer a friend (+50 pts), Upload notes (+30 pts), Complete profile (+20 pts). Would you like to go to your Referral Dashboard?`;
      
      showConfirmation(message, () => {
        window.open('/referral', '_blank');
      });
      return;
    }

    // Show download popup
    setDownloadPopup({
      show: true,
      noteTitle: note.title,
      status: 'downloading'
    });

    try {
      // First validate the PDF URL
      const urlValidation = await checkUrlStatus(note.githubUrl);
      
      if (urlValidation.status === 'deleted') {
        setDownloadPopup(prev => ({ ...prev, status: 'error' }));
        setTimeout(() => {
          setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
        }, 3000);
        showError('This PDF has been deleted from GitHub and is no longer available. Please contact the administrator.');
        return;
      }

      if (urlValidation.status === 'error') {
        console.warn('PDF validation failed, but attempting download anyway');
      }
      
      // Spend points if required (for authenticated users only)
      if (isPointsRequired && user && requiredPoints > 0) {
        try {
          const success = await pointsService.spendPoints(
            user.$id,
            user.email,
            requiredPoints,
            noteId,
            note.title
          );
          
          if (!success) {
            throw new Error('Failed to spend points for download');
          }
          
          // Update local user points
          setUserPoints(prev => ({
            ...prev,
            availablePoints: prev.availablePoints - requiredPoints
          }));
          
        } catch (pointsError) {
          console.error('Error spending points:', pointsError);
          setDownloadPopup(prev => ({ ...prev, status: 'error' }));
          setTimeout(() => {
            setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
          }, 3000);
          showError('Failed to spend points for download. Please try again.');
          return;
        }
      }
      
      // Try to update download count in database (gracefully handle if not authenticated)
      try {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          noteId,
          {
            downloads: note.downloads + 1
          }
        );
        
        // Update local state only if database update succeeds
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === noteId
              ? { ...n, downloads: n.downloads + 1 }
              : n
          )
        );
      } catch (dbError) {
        console.warn('Could not update download count in database:', dbError);
        // Don't fail the download if database update fails
        // The download still proceeds for public users
      }

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
      console.error('Error during download:', error);

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

  const closePopup = () => {
    setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
  };

  const handleLike = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const isLiked = likedNotes.has(noteId);
    const newLikes = isLiked ? note.likes - 1 : note.likes + 1;
    
    // Optimistic update - update UI immediately
    setNotes(prevNotes =>
      prevNotes.map(n =>
        n.id === noteId ? { ...n, likes: newLikes } : n
      )
    );
    
    setLikedNotes(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });

    try {
      // Update database (gracefully handle if not authenticated)
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        noteId,
        { likes: newLikes }
      );
    } catch (error) {
      console.warn('Could not update like in database (may require authentication):', error);
      
      // Revert optimistic update on error
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId ? { ...n, likes: note.likes } : n
        )
      );
      
      setLikedNotes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(noteId);
        } else {
          newSet.delete(noteId);
        }
        return newSet;
      });
      
      // Show a subtle notification that likes require authentication
      setTimeout(() => {
        showInfo('Note: Likes are saved locally. Sign in to sync your preferences across devices.');
      }, 100);
    }
  };

  const handleShare = (note: Note) => {
    const noteSlug = generateNoteSlug(note.id, note.title);
    const shareUrl = `${window.location.origin}/notes/preview/${noteSlug}`;
    const shareText = `${note.title}\n\nThis note is downloaded from Jharkhand Engineer's Hub. You can join the amazing community:\n• Telegram Group: [Link]\n• WhatsApp Group: [Link]\n\nCheck it out: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        showSuccess('Link with message copied to clipboard!');
      }).catch(() => {
        // If clipboard fails, just copy the URL
        navigator.clipboard.writeText(shareUrl).then(() => {
          showSuccess('Link copied to clipboard!');
        });
      });
    }
  };

  const handleViewPDF = (note: Note) => {
    // Redirect to notes preview page with SEO-friendly URL
    const noteSlug = generateNoteSlug(note.id, note.title);
    window.open(`/notes/preview/${noteSlug}`, '_blank');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      {/* Page Header */}
      <PageHeader 
        title="Notes Download"
        icon={Download}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Universal Sidebar */}
      <UniversalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8 xl:px-10 pt-20">
        {/* Description */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access thousands of high-quality notes from students worldwide
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg mt-8">
            {error}
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar with Filter Button */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes by title, subject, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {/* Filter Button - Visible on mobile */}
                  <button
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-all lg:hidden ${
                      filtersOpen ? 'bg-blue-50 scale-105' : ''
                    }`}
                    title={filtersOpen ? 'Hide Filters' : 'Show Filters'}
                  >
                    <Filter className={`h-5 w-5 transition-colors ${
                      filtersOpen ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                    }`} />
                    {/* Active filter indicator */}
                    {(filters.branch || filters.semester || filters.degree || filters.subject) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </button>
                </div>

                {/* Filter Dropdowns - Hidden on mobile by default */}
                <AnimatePresence>
                  {(filtersOpen || !isMobile) && (
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4"
                      initial={isMobile ? { opacity: 0, y: -10 } : undefined}
                      animate={isMobile ? { opacity: 1, y: 0 } : undefined}
                      exit={isMobile ? { opacity: 0, y: -10 } : undefined}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                  <select
                    value={filters.branch}
                    onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>

                  <select
                    value={filters.semester}
                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map(semester => (
                      <option key={semester} value={semester}>{semester}</option>
                    ))}
                  </select>

                  <select
                    value={filters.degree}
                    onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Degrees</option>
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Subject"
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 w-full focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Clear Filters Button - Mobile only */}
                  {isMobile && (filters.branch || filters.semester || filters.degree || filters.subject) && (
                    <button
                      onClick={() => setFilters({ branch: '', semester: '', subject: '', degree: '' })}
                      className="mt-2 w-full px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode Toggle */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Found {filteredNotes.length} notes
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Grid View"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* User Points Display */}
            {user && (
              <motion.div 
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-2">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Your Points</h3>
                      <p className="text-sm text-gray-600">Use points to download premium notes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {pointsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-amber-600">
                          {userPoints.availablePoints}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total earned: {userPoints.totalPoints}
                        </div>
                        {/* Debug info - only in development */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-red-500 mt-1">
                            Debug: User ID: {user.$id}<br/>
                            Raw points: {JSON.stringify(userPoints)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Need more points?</span>
                    <Link 
                      href="/referral" 
                      className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      Refer friends & earn →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notes Grid/List */}
            <motion.div 
              key={`${searchTerm}-${filters.branch}-${filters.semester}-${filters.subject}-${filters.degree}-${viewMode}`}
              className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8' 
                  : 'space-y-4'
              }`}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                  }
                }
              }}
            >
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <motion.div 
                    key={note.id} 
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[360px] lg:min-h-[380px] flex flex-col"
                    variants={{
                      hidden: { 
                        opacity: 0, 
                        y: 50,
                        scale: 0.9
                      },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        scale: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 12,
                          duration: 0.6
                        }
                      }
                    }}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    layout
                  >
                  <div className="p-4 sm:p-5 flex flex-col h-full relative">
                    {/* Badges - Top Corner */}
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      {/* Single Badge showing either Points Required or Free */}
                      {(() => {
                        const requiredPoints = noteRequirements[note.id]?.points || note.points || 0;
                        
                        if (requiredPoints > 0) {
                          return (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                              <Coins className="h-3 w-3" />
                              {requiredPoints} PTS
                            </span>
                          );
                        } else {
                          return (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                              FREE
                            </span>
                          );
                        }
                      })()} 
                    </div>

                    {/* Header Section */}
                    <motion.div 
                      className="mb-4 pr-20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {note.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 gap-2 mb-1">
                        <User className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{note.uploader}</span>
                        <Calendar className="h-4 w-4 mx-2 flex-shrink-0" />
                        <span className="truncate">{new Date(note.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {/* File Size */}
                      {note.fileSize && note.fileSize > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>{formatFileSize(note.fileSize)}</span>
                        </div>
                      )}
                    </motion.div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {note.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {note.branch}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {note.semester} Sem
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        {note.subject}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {note.degree}
                      </span>
                    </div>

                    {/* Spacer to push content to bottom */}
                    <div className="flex-grow"></div>
                    
                    <div className="flex flex-col space-y-2">
{/* Stats Row */}
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-gray-600">
                            <Download className="h-4 w-4 mr-1" />
                            <span>{note.downloads}</span>
                            <span className="ml-1 hidden sm:inline">downloads</span>
                          </div>
                          <button
                            onClick={() => handleLike(note.id)}
                            className="flex items-center transition-all duration-200 hover:scale-105 group"
                          >
                            <Heart 
                              className={`h-4 w-4 mr-1 transition-all duration-200 stroke-2 ${
                                likedNotes.has(note.id) 
                                  ? 'fill-red-500 text-red-500 scale-110' 
                                  : 'text-gray-700 hover:text-red-500 group-hover:fill-red-100'
                              }`} 
                            />
                            <span className={`transition-colors ${
                              likedNotes.has(note.id) ? 'text-red-500 font-medium' : 'text-gray-700'
                            }`}>
                              {note.likes}
                            </span>
                            <span className="ml-1 hidden sm:inline text-gray-600">likes</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleShare(note)}
                          className="flex items-center px-2 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                          title="Share note"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Action Buttons Row */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewPDF(note)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-blue-600 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-lg transition-all duration-200 text-sm font-semibold"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                        {(() => {
                          const requirement = noteRequirements[note.id];
                          const requiredPoints = requirement?.points || note.points || 0;
                          const isPointsRequired = requiredPoints > 0;
                          const hasEnoughPoints = !isPointsRequired || !user || userPoints.availablePoints >= requiredPoints;
                          const needsAuth = isPointsRequired && !user;
                          
                          return (
                            <button
                              onClick={() => handleDownload(note.id)}
                              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-xl ${
                                needsAuth
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                                  : !hasEnoughPoints
                                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-75'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                              }`}
                              title={needsAuth ? 'Sign in required' : !hasEnoughPoints ? `Need ${requiredPoints - userPoints.availablePoints} more points` : 'Download note'}
                            >
                              {needsAuth ? (
                                <>
                                  <User className="h-4 w-4 mr-1" />
                                  Sign In
                                </>
                              ) : !hasEnoughPoints ? (
                                <>
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  {requiredPoints - userPoints.availablePoints} more pts needed
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-1" />
                                  {isPointsRequired ? `Download (${requiredPoints} pts)` : 'Download'}
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                      {/* Extra Tags */}
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              <Tag className="h-3 w-3 mr-0.5" />
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-gray-500 text-xs px-2 py-1">
                              +{note.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </motion.div>

            {/* No Results */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notes found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find what you&quot;re looking for.
                </p>
              </div>
            )}
          </>
        )}

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
      
      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .min-h-\\[480px\\] {
            min-height: auto;
          }
          .lg\\:min-h-\\[520px\\] {
            min-height: auto;
          }
        }
        
        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1023px) {
          .min-h-\\[480px\\] {
            min-height: 450px;
          }
        }
        
        /* Desktop enhancements */
        @media (min-width: 1024px) {
          .grid {
            grid-auto-rows: 1fr;
          }
        }
        
        /* Smooth hover transitions */
        .transform {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default NotesDownload;
