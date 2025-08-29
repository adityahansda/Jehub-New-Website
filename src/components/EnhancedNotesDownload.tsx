import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, CheckCircle, X, User, Coins, Menu, 
  Upload, Download, Heart, Star, BookOpen, Home, Users, 
  AlertCircle, List, Grid, Clock
} from 'lucide-react';
import { showError, showWarning, showSuccess, showConfirmation, showInfo } from '../utils/toast';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { checkUrlStatus } from '../lib/pdfValidation';
import { databases } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { pointsService } from '../services/pointsService';
import HorizontalNotesCard from './HorizontalNotesCard';
import VerticalNotesCard from './VerticalNotesCard';
import { likesService } from '../services/likesService';

// Convert raw GitHub URL to download URL
function convertToDownloadUrl(url: string): string {
  if (!url) return url;

  if (url.includes('raw.githubusercontent.com')) {
    const parts = url.replace('https://raw.githubusercontent.com/', '').split('/');
    if (parts.length >= 3) {
      const user = parts[0];
      const repo = parts[1];
      const branch = parts[2];
      const filePath = parts.slice(3).join('/');
      const downloadUrl = `https://github.com/${user}/${repo}/raw/${branch}/${filePath}`;
      return downloadUrl;
    }
  }

  if (url.includes('github.com') && url.includes('/raw/')) {
    return url;
  }

  if (url.includes('github.com') && url.includes('/blob/')) {
    const downloadUrl = url.replace('/blob/', '/raw/');
    return downloadUrl;
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
  views: number;
  reports: number;
  fileSize: number | null;
  noteType: 'free' | 'premium';
  degree: string;
};

type SidebarItemType = {
  icon: React.ElementType;
  label: string;
  count?: number;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
};

const EnhancedNotesDownload = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userPoints, setUserPoints] = useState({ availablePoints: 0, points: 0, pointsSpent: 0 });
  const [pointsLoading, setPointsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState('Most relevant');
  const [selectedFilters, setSelectedFilters] = useState({
    branch: '',
    semester: '',
    subject: '',
    degree: '',
    noteType: ''
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
  const [noteRequirements, setNoteRequirements] = useState<Record<string, { required: boolean; points: number; category: string }>>({});

  // Load liked notes - from database if user is authenticated, otherwise from localStorage
  useEffect(() => {
    const loadLikedNotes = async () => {
      if (user && user.$id) {
        try {
          // User is authenticated, load from database
          console.log('Loading user likes from database for user:', user.$id);
          const likedNoteIds = await likesService.getUserLikedNoteIds(user.$id);
          console.log('Loaded liked note IDs from database:', likedNoteIds);
          
          const newLikedNotes = new Set(likedNoteIds);
          setLikedNotes(newLikedNotes);
          
          // Also sync any local likes to database
          const savedLikedNotes = localStorage.getItem('likedNotes');
          if (savedLikedNotes) {
            try {
              const localLikedNotesArray = JSON.parse(savedLikedNotes);
              if (localLikedNotesArray.length > 0) {
                console.log('Syncing local likes to database:', localLikedNotesArray);
                const syncResult = await likesService.syncLocalLikesToDatabase(
                  user.$id,
                  user.email,
                  localLikedNotesArray
                );
                console.log('Sync result:', syncResult);
                
                if (syncResult.synced > 0) {
                  showSuccess(`Synced ${syncResult.synced} likes to your account!`);
                  // Reload the likes from database after sync
                  const updatedLikedNoteIds = await likesService.getUserLikedNoteIds(user.$id);
                  setLikedNotes(new Set(updatedLikedNoteIds));
                }
                
                // Clear localStorage after successful sync
                localStorage.removeItem('likedNotes');
              }
            } catch (error) {
              console.error('Error parsing/syncing local likes:', error);
            }
          }
        } catch (error) {
          console.error('Error loading user likes from database:', error);
          // Fallback to localStorage if database fails
          const savedLikedNotes = localStorage.getItem('likedNotes');
          if (savedLikedNotes) {
            try {
              const likedNotesArray = JSON.parse(savedLikedNotes);
              setLikedNotes(new Set(likedNotesArray));
            } catch (error) {
              console.error('Error parsing liked notes from localStorage:', error);
            }
          }
        }
      } else {
        // User not authenticated, load from localStorage
        const savedLikedNotes = localStorage.getItem('likedNotes');
        if (savedLikedNotes) {
          try {
            const likedNotesArray = JSON.parse(savedLikedNotes);
            setLikedNotes(new Set(likedNotesArray));
          } catch (error) {
            console.error('Error parsing liked notes from localStorage:', error);
          }
        }
      }
    };

    loadLikedNotes();
  }, [user]);

  // Save liked notes to localStorage whenever it changes (only for non-authenticated users)
  useEffect(() => {
    if (!user || !user.$id) {
      // Only save to localStorage if user is not authenticated
      localStorage.setItem('likedNotes', JSON.stringify(Array.from(likedNotes)));
    }
  }, [likedNotes, user]);

  // Load user points when user changes
  useEffect(() => {
    const loadUserPoints = async () => {
      if (user && user.email) {
        try {
          setPointsLoading(true);
          console.log('Loading points for user:', user.$id, user.email);
          
          const points = await pointsService.getUserPointsByEmail(user.email);
          console.log('Points from getUserPointsByEmail:', points);
          
          setUserPoints(points);
        } catch (error) {
          console.error('Error loading user points:', error);
          showError('Failed to load user points. Some features may not work correctly.');
        } finally {
          setPointsLoading(false);
        }
      } else {
        setUserPoints({ availablePoints: 0, points: 0, pointsSpent: 0 });
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
  const sortOptions = ['Most relevant', 'Most recent', 'Most downloaded', 'Most liked'];

  // Fetch notes from API
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

  // Sidebar items
  const sidebarItems: SidebarItemType[] = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: BookOpen, label: 'My Library', count: 0 },
    { icon: Download, label: 'Download Notes', isActive: true },
    { icon: Upload, label: 'Upload Notes', href: '/notes-upload' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Star, label: 'Favorites', count: likedNotes.size },
  ];

  // Filter courses/notes by branches
  const courseFilters = [
    { label: 'Computer Science', count: notes.filter(n => n.branch === 'Computer Science').length, value: 'Computer Science' },
    { label: 'Electronics', count: notes.filter(n => n.branch === 'Electronics').length, value: 'Electronics' },
    { label: 'Mechanical', count: notes.filter(n => n.branch === 'Mechanical').length, value: 'Mechanical' },
    { label: 'Civil', count: notes.filter(n => n.branch === 'Civil').length, value: 'Civil' },
    { label: 'Mathematics', count: notes.filter(n => n.branch === 'Mathematics').length, value: 'Mathematics' },
    { label: 'Physics', count: notes.filter(n => n.branch === 'Physics').length, value: 'Physics' },
  ];

  // Filter and search notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = !selectedFilters.branch || note.branch === selectedFilters.branch;
    const matchesSemester = !selectedFilters.semester || note.semester === selectedFilters.semester;
    const matchesDegree = !selectedFilters.degree || note.degree === selectedFilters.degree;
    const matchesSubject = !selectedFilters.subject || note.subject.toLowerCase().includes(selectedFilters.subject.toLowerCase());

    return matchesSearch && matchesBranch && matchesSemester && matchesSubject && matchesDegree;
  });

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'Most recent':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'Most downloaded':
        return b.downloads - a.downloads;
      case 'Most liked':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const handleDownload = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to download notes.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          window.location.href = '/login';
        }
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    // Check download requirements
    const requirement = noteRequirements[noteId];
    const requiredPoints = requirement?.points || note.points || 0;
    const isPointsRequired = requiredPoints > 0;

    // If points are required, check if user has enough points
    if (isPointsRequired && userPoints.availablePoints < requiredPoints) {
      const pointsNeeded = requiredPoints - userPoints.availablePoints;
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

      // Proceed with download
      const downloadUrl = convertToDownloadUrl(note.githubUrl);
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = note.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Deduct points if required
      if (isPointsRequired) {
        try {
          // Find user profile by email to get correct user ID
          const { databases } = await import('../lib/appwrite');
          const { Query } = await import('appwrite');
          const userResponse = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            [Query.equal('email', user.email)]
          );
          
          if (userResponse.documents.length > 0) {
            const userProfile = userResponse.documents[0];
            await pointsService.spendPoints(userProfile.$id, user.email, requiredPoints, noteId, note.title);
            setUserPoints(prev => ({
              ...prev,
              availablePoints: prev.availablePoints - requiredPoints,
              pointsSpent: prev.pointsSpent + requiredPoints
            }));
          } else {
            console.warn('User profile not found for points deduction');
            showWarning('Download started, but there was an issue updating your points.');
          }
        } catch (error) {
          console.error('Error deducting points:', error);
          showWarning('Download started, but there was an issue updating your points.');
        }
      }

      // Update download count
      try {
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === noteId ? { ...n, downloads: n.downloads + 1 } : n
          )
        );
      } catch (error) {
        console.error('Error updating download count:', error);
      }

      // Show success status
      setDownloadPopup(prev => ({ ...prev, status: 'success' }));
      setTimeout(() => {
        setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
      }, 2000);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadPopup(prev => ({ ...prev, status: 'error' }));
      setTimeout(() => {
        setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
      }, 3000);
      showError('Failed to download the file. Please try again.');
    }
  };

  const handleLike = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const isLiked = likedNotes.has(noteId);
    
    // Optimistically update the UI first
    const newLikes = isLiked ? note.likes - 1 : note.likes + 1;
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

    // Now update the database
    if (user && user.$id && user.email) {
      // User is authenticated, use the proper likes service
      try {
        console.log('Toggling like for authenticated user:', { userId: user.$id, noteId, isLiked });
        const result = await likesService.toggleLike(user.$id, user.email, noteId);
        
        if (result.success) {
          console.log('Like toggled successfully:', result);
          // Update the notes with the actual like count from database
          setNotes(prevNotes =>
            prevNotes.map(n =>
              n.id === noteId ? { ...n, likes: result.newLikeCount } : n
            )
          );
          
          // Update the liked notes set with the actual state
          setLikedNotes(prev => {
            const newSet = new Set(prev);
            if (result.isLiked) {
              newSet.add(noteId);
            } else {
              newSet.delete(noteId);
            }
            return newSet;
          });
        } else {
          throw new Error(result.error || 'Failed to toggle like');
        }
      } catch (error) {
        console.error('Error toggling like in database:', error);
        showError('Failed to update like. Please try again.');
        
        // Revert optimistic updates on error
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
      }
    } else {
      console.log('Guest user like toggled locally:', { noteId, wasLiked: isLiked, newLikes });
      // For non-authenticated users, the optimistic update is all we do
      // The likes will be stored in localStorage via the useEffect
    }
  };
  
  // Add these handler functions that the cards expect
  const handlePreview = (note: Note) => {
    // Open preview in a new window or modal
    if (note.githubUrl) {
      window.open(note.githubUrl, '_blank');
    }
  };
  
  const handleShare = (note: Note) => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href + `?note=${note.id}`
      }).catch(console.error);
    } else {
      // Fallback to copying to clipboard
      const shareUrl = window.location.href + `?note=${note.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showSuccess('Link copied to clipboard!');
      }).catch(() => {
        showError('Failed to copy link.');
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      branch: '',
      semester: '',
      subject: '',
      degree: '',
      noteType: ''
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Notes</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Notes Download</h1>
          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-medium">{userPoints.availablePoints}</span>
              </div>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.div
              initial={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={`${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'sticky top-0 h-screen'} w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">JE Hub</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notes Library</p>
                    </div>
                  </div>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name || user.email}
                      </p>
                      <div className="flex items-center space-x-1 text-xs">
                        <Coins className="w-3 h-3 text-yellow-500" />
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                          {pointsLoading ? '...' : userPoints.availablePoints} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="p-4 space-y-1">
                {sidebarItems.map((item, index) => (
                  <div key={index}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          item.isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          item.isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                            {item.count}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </nav>

              {/* Filters Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h3>
                  {(selectedFilters.branch || selectedFilters.semester || selectedFilters.subject || selectedFilters.degree) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Branch Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch
                    </label>
                    <select
                      value={selectedFilters.branch}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Branches</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Degree
                    </label>
                    <select
                      value={selectedFilters.degree}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, degree: e.target.value }))}
                      className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Degrees</option>
                      {degrees.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={selectedFilters.semester}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, semester: e.target.value }))}
                      className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Semesters</option>
                      {semesters.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Course Filters */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Branches</h3>
                <div className="space-y-2">
                  {courseFilters.map((filter, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFilters(prev => ({ 
                        ...prev, 
                        branch: prev.branch === filter.value ? '' : filter.value 
                      }))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        selectedFilters.branch === filter.value
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes Download</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Browse and download engineering notes from our vast collection
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {user && (
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 text-yellow-800 dark:text-yellow-400">
                      <Coins className="w-5 h-5" />
                      <span className="font-semibold">{pointsLoading ? '...' : userPoints.availablePoints} points</span>
                    </div>
                  )}
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                    <span className="text-sm">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes, subjects, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="px-4 lg:px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedNotes.length} of {notes.length} notes
              {searchTerm && (
                <span> for "{searchTerm}"</span>
              )}
              {(selectedFilters.branch || selectedFilters.semester || selectedFilters.degree) && (
                <span className="ml-2">
                  • Filtered by: {[selectedFilters.branch, selectedFilters.degree, selectedFilters.semester].filter(Boolean).join(', ')}
                </span>
              )}
            </p>
          </div>

          {/* Notes Grid/List */}
          <div className="p-4 lg:p-6">
            {sortedNotes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || Object.values(selectedFilters).some(Boolean)
                    ? 'Try adjusting your search or filters to find what you&rsquo;re looking for.'
                    : 'No notes are available at the moment.'}
                </p>
                {(searchTerm || Object.values(selectedFilters).some(Boolean)) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                layout
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'}
              >
                <AnimatePresence mode="popLayout">
                  {sortedNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {viewMode === 'grid' ? (
                        <VerticalNotesCard
                          note={note}
                          index={index}
                          isLiked={likedNotes.has(note.id)}
                          onLike={() => handleLike(note.id)}
                          onDownload={() => handleDownload(note.id)}
                          onPreview={() => handlePreview(note)}
                          onShare={() => handleShare(note)}
                          noteRequirements={noteRequirements[note.id]}
                          userPoints={userPoints}
                          user={user}
                          formatFileSize={formatFileSize}
                        />
                      ) : (
                        <HorizontalNotesCard
                          note={note}
                          index={index}
                          isLiked={likedNotes.has(note.id)}
                          onLike={() => handleLike(note.id)}
                          onDownload={() => handleDownload(note.id)}
                          onPreview={() => handlePreview(note)}
                          onShare={() => handleShare(note)}
                          noteRequirements={noteRequirements[note.id]}
                          userPoints={userPoints}
                          user={user}
                          formatFileSize={formatFileSize}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Download Popup */}
      <AnimatePresence>
        {downloadPopup.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                {downloadPopup.status === 'downloading' && (
                  <>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-blue-500 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Downloading...</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      "{downloadPopup.noteTitle}"
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </>
                )}

                {downloadPopup.status === 'success' && (
                  <>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download Started!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      "{downloadPopup.noteTitle}" is being downloaded.
                    </p>
                  </>
                )}

                {downloadPopup.status === 'error' && (
                  <>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Download Failed</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      There was an issue downloading "{downloadPopup.noteTitle}". Please try again.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedNotesDownload;
