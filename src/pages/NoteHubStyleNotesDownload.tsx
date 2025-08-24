import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search, CheckCircle, X, User, Coins, Menu, GraduationCap, AlertTriangle, Upload, Grid3X3, Send, Clock, Filter, Tag, FileCheck, AlertCircle, CheckSquare, Download, Heart, Star, Trophy, BookOpen, Home, Calendar, MapPin, Info, Users, Bell, MessageCircle, Rss, ShieldCheck, Briefcase, Target, ArrowRight, Building, DollarSign, Code, Palette, Camera, Megaphone, PenTool, Globe, Award, Rocket, MessageSquare, UserPlus, UserCheck, Hash, ExternalLink, Mail, Phone, Medal, Crown, TrendingUp, Zap, Brain, Database, Activity, Server, BarChart3, FileBarChart, Gift, Share, Copy, Link as LinkIcon, Play, Video, List, Grid } from 'lucide-react';
import { generateNoteSlug } from '../utils/seo';
import { showError, showWarning, showSuccess, showConfirmation, showInfo } from '../utils/toast';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import VideoModal from '../components/VideoModal';
import { checkUrlStatus } from '../lib/pdfValidation';
import { databases } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { pointsService } from '../services/pointsService';
import HorizontalNotesCard from '../components/HorizontalNotesCard';
import VerticalNotesCard from '../components/VerticalNotesCard';
import { likesService } from '../services/likesService';
import KnowledgeGateSidebar from '../components/KnowledgeGateSidebar';
import CounsellingUpdates from './CounsellingUpdates';
import { getActiveTeamSortedByXP, getOldTeamSortedByXP } from '../data/teamData';
import AIChatPage from '../components/AIChatPage';
import AIChatWidget from '../components/AIChatWidget';
import AIChatComponent from '../components/AIChatComponent';
import { aiSettingsService } from '../services/aiSettingsService';
import GoogleDocsPDFViewer from '../components/GoogleDocsPDFViewer';
import { Bundle, bundlesService, BundleNote, BundleVideo } from '../services/bundlesService';
import { usePublishedBundles, useAdminBundles } from '../hooks/useBundles';

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

const NoteHubStyleNotesDownload = () => {
  const { user } = useAuth();
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
  const [currentPage, setCurrentPage] = useState('notes-download');
  
  // Debug state to track sidebar
  useEffect(() => {
    console.log('Sidebar state changed:', sidebarOpen);
  }, [sidebarOpen]);
  
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
      
      // Spend points if required (for authenticated users only)
      if (isPointsRequired && user && requiredPoints > 0) {
        try {
          console.log('Attempting to spend points:', {
            userId: user.$id,
            userEmail: user.email,
            requiredPoints,
            availablePoints: userPoints.availablePoints
          });
          
          if (userPoints.availablePoints < requiredPoints) {
            throw new Error(`Insufficient points: need ${requiredPoints}, have ${userPoints.availablePoints}`);
          }
          
          const success = await pointsService.spendPoints(
            user.$id,
            user.email,
            requiredPoints,
            noteId,
            note.title
          );
          
          if (!success) {
            throw new Error('Points service returned false - insufficient points or database error');
          }
          
          console.log('Points spent successfully, updating local state');
          
          // Update local user points
          setUserPoints(prev => ({
            ...prev,
            availablePoints: prev.availablePoints - requiredPoints,
            pointsSpent: (prev.pointsSpent || 0) + requiredPoints
          }));
          
          showSuccess(`Successfully spent ${requiredPoints} points for download!`);
          
        } catch (pointsError) {
          console.error('Error spending points:', pointsError);
          
          const isNetworkError = pointsError instanceof Error && 
            (pointsError.message.includes('Failed to fetch') || 
             pointsError.message.includes('CONNECTION_RESET') ||
             pointsError.message.includes('network'));
          
          if (isNetworkError) {
            showWarning(`Network issue prevented points spending. Download will proceed, but points will be deducted when connection is restored.`);
            
            const pendingTransaction = {
              userId: user.$id,
              userEmail: user.email,
              points: requiredPoints,
              noteId,
              noteTitle: note.title,
              timestamp: new Date().toISOString()
            };
            
            const existingPending = localStorage.getItem('pendingPointsTransactions');
            const pendingTransactions = existingPending ? JSON.parse(existingPending) : [];
            pendingTransactions.push(pendingTransaction);
            localStorage.setItem('pendingPointsTransactions', JSON.stringify(pendingTransactions));
            
            setUserPoints(prev => ({
              ...prev,
              availablePoints: prev.availablePoints - requiredPoints,
              pointsSpent: (prev.pointsSpent || 0) + requiredPoints
            }));
            
            showInfo('Points will be processed when connection is restored.');
          } else {
            setDownloadPopup(prev => ({ ...prev, status: 'error' }));
            setTimeout(() => {
              setDownloadPopup({ show: false, noteTitle: '', status: 'downloading' });
            }, 3000);
            
            const errorMessage = pointsError instanceof Error ? pointsError.message : 'Unknown error occurred';
            showError(`Failed to spend points: ${errorMessage}. Please try again.`);
            return;
          }
        }
      }
      
      // Try to update download count in database
      try {
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
          noteId,
          {
            downloads: note.downloads + 1
          }
        );
        
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === noteId
              ? { ...n, downloads: n.downloads + 1 }
              : n
          )
        );
      } catch (dbError) {
        console.warn('Could not update download count in database:', dbError);
      }

      // Convert raw URL to download URL and create download link
      const downloadUrl = convertToDownloadUrl(note.githubUrl) || `https://example.com/notes/${note.fileName}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', note.fileName);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update popup status
      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'success' }));

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
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadPopup(prev => ({ ...prev, status: 'error' }));

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
          
          // Show success message
          const action = result.isLiked ? 'liked' : 'unliked';
          showSuccess(`Successfully ${action} the note!`);
        } else {
          // Revert the optimistic update on failure
          console.error('Failed to toggle like:', result.error);
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
          
          showError(`Failed to ${isLiked ? 'unlike' : 'like'} the note. Please try again.`);
        }
      } catch (error) {
        console.error('Error in handleLike:', error);
        // Revert the optimistic update on error
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
        
        showError('An error occurred while updating the like. Please try again.');
      }
    } else {
      // User not authenticated, just save to localStorage (already handled by useEffect)
      setTimeout(() => {
        showInfo('Likes are saved locally. Sign in to sync your preferences across devices and contribute to the community!');
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
      navigator.clipboard.writeText(shareText).then(() => {
        showSuccess('Link with message copied to clipboard!');
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showSuccess('Link copied to clipboard!');
        });
      });
    }
  };

  const handleViewPDF = (note: Note) => {
    const noteSlug = generateNoteSlug(note.id, note.title);
    window.open(`/notes/preview/${noteSlug}`, '_blank');
  };

  // Handle page changes from the KnowledgeGateSidebar
  const handlePageChange = (pageId: string, pageTitle: string) => {
    setCurrentPage(pageId);
    console.log(`Navigating to page: ${pageId} (${pageTitle})`);
    // Add logic here to handle page transitions or navigate to different components
    // For now, we'll just update the current page state
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Header - Modern Study Hub Style */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 pt-safe-area-inset-top">
        {/* Mobile safe area spacing */}
        <div className="h-2 sm:h-0 bg-gray-800"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
              >
              <Menu className="h-6 w-6" />
              </button>
              
              <Link href="/" className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                   <GraduationCap className="h-7 w-7 text-white" />
                 </div>
                 <span className="font-bold text-2xl text-white">JEHub</span>
               </Link>
              
              {/* Search Bar - Desktop */}
              <div className="hidden md:block flex-1 max-w-md ml-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for courses, notes, etc."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Points Display */}
                  <div className="hidden sm:flex items-center space-x-2 bg-amber-900/20 px-3 py-1 rounded-full border border-amber-700/50">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-300">
                      {pointsLoading ? '...' : userPoints.availablePoints}
                    </span>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-200">
                      {user.name || 'Guest user'}
                    </span>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses, notes, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 bg-gray-50"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Knowledge Gate Sidebar */}
        <KnowledgeGateSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={currentPage}
          likedNotesCount={likedNotes.size}
          courseFilters={courseFilters}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          semesters={semesters}
          degrees={degrees}
          onPageChange={handlePageChange}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">Notes Download</h1>
          </div>


          {/* Quick Search Section Above Results */}
          <motion.div 
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search through notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>
              
              {/* Search Stats and Controls */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  <span className="font-medium">{sortedNotes.length}</span> of <span className="font-medium">{notes.length}</span> notes
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Horizontal layout"
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Grid layout"
                  >
                    <Grid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>
                
                {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilters({ branch: '', semester: '', subject: '', degree: '', noteType: '' });
                    }}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedFilters.branch && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Branch: {selectedFilters.branch}
                    <button
                      onClick={() => setSelectedFilters({...selectedFilters, branch: ''})}
                      className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedFilters.semester && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Semester: {selectedFilters.semester}
                    <button
                      onClick={() => setSelectedFilters({...selectedFilters, semester: ''})}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedFilters.degree && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Degree: {selectedFilters.degree}
                    <button
                      onClick={() => setSelectedFilters({...selectedFilters, degree: ''})}
                      className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {selectedFilters.subject && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                    Subject: {selectedFilters.subject}
                    <button
                      onClick={() => setSelectedFilters({...selectedFilters, subject: ''})}
                      className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
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

              {/* Notes Layout - Dynamic switching between List and Grid */}
              {viewMode === 'list' ? (
                // Horizontal List Layout
                <motion.div
                  key={`${searchTerm}-${selectedFilters.branch}-${selectedFilters.semester}-${selectedFilters.subject}-${selectedFilters.degree}-list`}
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.03,
                        delayChildren: 0.1
                      }
                    }
                  }}
                >
                  <AnimatePresence>
                    {sortedNotes.map((note, index) => (
                      <HorizontalNotesCard
                        key={note.id}
                        note={note}
                        index={index}
                        onDownload={handleDownload}
                        onPreview={handleViewPDF}
                        onLike={handleLike}
                        onShare={handleShare}
                        isLiked={likedNotes.has(note.id)}
                        noteRequirements={noteRequirements[note.id]}
                        userPoints={userPoints}
                        user={user}
                        formatFileSize={formatFileSize}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                // Vertical Grid Layout
                <motion.div
                  key={`${searchTerm}-${selectedFilters.branch}-${selectedFilters.semester}-${selectedFilters.subject}-${selectedFilters.degree}-grid`}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.1
                      }
                    }
                  }}
                >
                  <AnimatePresence>
                    {sortedNotes.map((note, index) => (
                      <VerticalNotesCard
                        key={note.id}
                        note={note}
                        index={index}
                        onDownload={handleDownload}
                        onPreview={handleViewPDF}
                        onLike={handleLike}
                        onShare={handleShare}
                        isLiked={likedNotes.has(note.id)}
                        noteRequirements={noteRequirements[note.id]}
                        userPoints={userPoints}
                        user={user}
                        formatFileSize={formatFileSize}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* No Results */}
              {sortedNotes.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notes found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Download Popup */}
      {downloadPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-slideUp">
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

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NoteHubStyleNotesDownload;
