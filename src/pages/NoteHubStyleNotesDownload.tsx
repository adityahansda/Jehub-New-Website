import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Search, CheckCircle, X, User, Coins, Menu, GraduationCap, AlertTriangle, Upload, Grid3X3, Send, Clock, Filter, Tag, FileCheck, AlertCircle, CheckSquare, Download, Heart, Star, Trophy, BookOpen, Home, Calendar, MapPin, Info, Users, Bell, MessageCircle, Rss, ShieldCheck, Briefcase, Target, ArrowRight, Building, DollarSign, Code, Palette, Camera, Megaphone, PenTool, Globe, Award, Rocket, MessageSquare, UserPlus, UserCheck, Hash, ExternalLink, Mail, Phone, Medal, Crown, TrendingUp, Zap, Brain, Database, Activity, Server, BarChart3, FileBarChart, Gift, Share, Copy, Link as LinkIcon, Play, Video } from 'lucide-react';
import { generateNoteSlug } from '../utils/seo';
import { showError, showWarning, showSuccess, showConfirmation, showInfo } from '../utils/toast';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { checkUrlStatus } from '../lib/pdfValidation';
import { databases } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { pointsService } from '../services/pointsService';
import HorizontalNotesCard from '../components/HorizontalNotesCard';
import { likesService } from '../services/likesService';
// Removed KnowledgeGateSidebar import as component doesn't exist
import CounsellingUpdates from './CounsellingUpdates';
import { getActiveTeamSortedByXP, getOldTeamSortedByXP } from '../data/teamData';
// AI components - removed imports for components that don't exist
// import AIChatPage from '../components/AIChatPage';
// import AIChatWidget from '../components/AIChatWidget';
// import AIChatComponent from '../components/AIChatComponent';
// import { aiSettingsService } from '../services/aiSettingsService';
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


const NoteHubStyleNotesDownload = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  interface UserPoints {
    availablePoints: number;
    points: number;
    pointsSpent: number;
    totalReferrals: number;
  }

  const [userPoints, setUserPoints] = useState<UserPoints>({
    availablePoints: 0,
    points: 0,
    pointsSpent: 0,
    totalReferrals: 0
  });
  const [pointsLoading, setPointsLoading] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
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
  const [pageTitle, setPageTitle] = useState('Engineering Notes');
  const pageTitleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'courses': 'My Courses',
    'notes-download': 'Engineering Notes',
    'notes-upload': 'Upload Notes',
    'notes-category': 'Notes Categories',
    'wishlist': 'My Wishlist',
    'leaderboard': 'Leaderboard',
    'notes-request': 'Notes Request',
    'notes-status-check': 'Notes Status Check',
    'exam-updates': 'Exam Updates',
    'counselling-updates': 'Counselling Updates',
    'notifications': 'Notifications',
    'groups': 'Groups',
    'events': 'Events',
    'blog': 'Blog',
    'team': 'Team',
    'old-team-members': 'Alumni Team Members',
    'join-team': 'Join Team',
    'internships': 'Internships',
    'community-rules': 'Community Rules',
    'ai-chat': 'AI Chat Assistant',
    'ai-knowledge-base': 'Knowledge Base',
    'ai-settings': 'AI Settings',
    'ai-training-data': 'Training Data',
    'note-preview': 'Note Preview',
    'premium': 'Become Premium User',
    'study-bundles': 'Study Bundles',
    // Admin Control Pages
    'admin-analytics': 'Analytics Dashboard',
    'admin-users': 'User Management',
    'admin-moderation': 'Content Moderation',
    'admin-system-health': 'System Health Monitor',
    'admin-server': 'Server Management',
    'admin-database': 'Database Administration',
    'admin-notifications': 'Notification Center',
    'admin-email': 'Email Management',
    'admin-security': 'Security Settings',
    'admin-settings': 'System Settings',
    'admin-audit-logs': 'Audit Logs',
    'admin-errors': 'Error Monitoring',
    'admin-api': 'API Management',
    'admin-bundle-management': 'Bundle Management'
  };
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    branch: '',
    semester: '',
    subject: '',
    description: '',
    tags: '',
    authorName: '',
    degree: '',
    noteType: 'free' as 'free' | 'premium',
    points: 50,
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedNoteUrl, setUploadedNoteUrl] = useState('');
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [downloadPopup, setDownloadPopup] = useState<{
    show: boolean;
    noteTitle: string;
    status: 'downloading' | 'success' | 'error';
  }>({ show: false, noteTitle: '', status: 'downloading' });
  const [likedNotes, setLikedNotes] = useState<Set<string>>(new Set());
  const [noteRequirements, setNoteRequirements] = useState<Record<string, { required: boolean; points: number; category: string }>>({});
  const [teamActiveTab, setTeamActiveTab] = useState<'present' | 'past'>('present');
  
  // AI Chat states
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // AI Knowledge Base states
  const [aiKnowledgeEntries, setAiKnowledgeEntries] = useState<any[]>([]);
  const [newKnowledgeEntry, setNewKnowledgeEntry] = useState({
    title: '',
    content: '',
    category: 'general',
    rules: '',
    isActive: true,
    tags: ''
  });
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // AI Settings states
  const [aiSettings, setAiSettings] = useState({
    // Response Parameters
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    
    // System Configuration
    systemPrompt: "You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub. Help students with their academic questions, provide study guidance, and assist with course materials. Be supportive, accurate, and educational in your responses.",
    responseStyle: 'friendly',
    languagePreference: 'english',
    
    // Safety & Moderation
    contentFilter: true,
    moderationLevel: 'medium',
    allowPersonalInfo: false,
    
    // Performance Settings
    cacheEnabled: true,
    responseTimeLimit: 30,
    maxConversationLength: 50,
    
    // API Configuration
    apiProvider: 'google-gemini',
    apiKeyStatus: 'connected',
    rateLimitPerUser: 20,
    rateLimitPerHour: 100
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [previewBundle, setPreviewBundle] = useState<any | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ title: string; url: string; description?: string } | null>(null);
  
  // Use real bundles from hooks
  const { bundles: publishedBundles, loading: publishedLoading, error: publishedError, createBundle: createPublishedBundle, updateBundle: updatePublishedBundle, deleteBundle: deletePublishedBundle } = usePublishedBundles();
  const { bundles: adminBundles, loading: adminLoading, error: adminError, createBundle: createAdminBundle, updateBundle: updateAdminBundle, deleteBundle: deleteAdminBundle } = useAdminBundles();
  
  // Current bundles based on context (admin or public view)
  const bundles = (currentPage === 'admin-bundle-management' || currentPage === 'study-bundles') ? adminBundles : publishedBundles;
  const bundlesLoading = currentPage === 'admin-bundle-management' ? adminLoading : publishedLoading;
  const bundlesError = currentPage === 'admin-bundle-management' ? adminError : publishedError;
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  interface Bundle {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    access: string;
    notes: Array<{
      id: string;
      title: string;
      description: string;
      fileUrl: string;
      type: string;
      size: string;
    }>;
    videos: Array<{
      id: string;
      title: string;
      description: string;
      url: string;
      type: string;
      duration: string;
    }>;
    instructor: string;
    tags: string | string[];
    status: string;
    notesCount: number;
    videosCount?: number;
    revenue?: number;
    totalSales?: number;
    targetSales?: number;
    discount?: number;
    originalPrice?: number;
    isFeatured?: boolean;
    isPopular?: boolean;
  }

  const [newBundle, setNewBundle] = useState<Bundle>({
    id: '',
    title: '',
    description: '',
    category: '',
    price: 0,
    access: 'free',
    tags: '',
    status: 'draft',
    notesCount: 0,
    instructor: '',
    notes: [], // Array of note objects
    videos: [] // Array of video objects
  });
  
  // Note and Video management states
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    size: '',
    fileUrl: '',
    type: 'pdf'
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    duration: '',
    url: '',
    type: 'youtube'
  });
  
  const [isCreatingBundle, setIsCreatingBundle] = useState(false);
  const [bundleCreationError, setBundleCreationError] = useState('');
  const [editingBundle, setEditingBundle] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBrowseNotesModal, setShowBrowseNotesModal] = useState(false);
  const [browseNotesData, setBrowseNotesData] = useState<Note[]>([]);
  const [browseNotesLoading, setBrowseNotesLoading] = useState(false);
  const [browseNotesError, setBrowseNotesError] = useState('');
  const [selectedNotesForBundle, setSelectedNotesForBundle] = useState<string[]>([]);
  // Local search term for the Browse Existing modal
  const [browseNotesSearch, setBrowseNotesSearch] = useState('');

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

  // Load AI settings on component mount
  useEffect(() => {
    const loadAiSettings = async () => {
      try {
        // const settings = await aiSettingsService.getSettings();
        // setAiSettings(settings);
      } catch (error) {
        console.error('Error loading AI settings:', error);
        // Fall back to default settings if loading fails
        // const defaultSettings = aiSettingsService.getDefaultSettings();
        // setAiSettings(defaultSettings);
      }
    };

    // loadAiSettings();
  }, []);

  // Load AI Knowledge Base entries
  const loadKnowledgeEntries = async () => {
    try {
      setKnowledgeLoading(true);
      setKnowledgeError('');
      
      console.log('Loading knowledge entries from database...');
      
      const response = await fetch('/api/ai-knowledge?limit=100');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load knowledge entries');
      }
      
      console.log('Loaded knowledge entries:', data.entries?.length || 0);
      setAiKnowledgeEntries(data.entries || []);
      
    } catch (error) {
      console.error('Error loading knowledge entries:', error);
      setKnowledgeError(error instanceof Error ? error.message : 'Failed to load knowledge entries');
      showError('Failed to load knowledge entries from database');
    } finally {
      setKnowledgeLoading(false);
    }
  };

  // Load knowledge base on component mount and when AI knowledge page is accessed
  useEffect(() => {
    if (currentPage === 'ai-knowledge-base') {
      loadKnowledgeEntries();
    }
  }, [currentPage]);

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
        setUserPoints({ availablePoints: 0, points: 0, pointsSpent: 0, totalReferrals: 0 });
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

  // Sync state from URL on first load and when URL changes
  useEffect(() => {
    if (!router.isReady) return;
    const view = (router.query.view as string) || 'notes-download';
    if (view && view !== currentPage) {
      setCurrentPage(view);
      // If we have a dynamic preview, keep its title, else use map
      if (view !== 'note-preview') {
        setPageTitle(pageTitleMap[view] || pageTitle);
      }
    }
  }, [router.isReady, router.query.view]);

  // Ensure URL reflects current page on mount (deep link support)
  useEffect(() => {
    if (!router.isReady) return;
    const view = router.query.view as string | undefined;
    if (!view && currentPage !== 'notes-download') {
      // Set the initial view param
      router.replace(
        { pathname: router.pathname, query: { ...router.query, view: currentPage } },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const userMenuButton = document.querySelector('[data-user-menu-button]');
      const userMenu = document.querySelector('[data-user-menu]');
      
      if (userMenuOpen && userMenuButton && userMenu) {
        if (!userMenuButton.contains(target) && !userMenu.contains(target)) {
          setUserMenuOpen(false);
        }
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

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

  // When opening the Browse Existing modal, populate it with current notes
  useEffect(() => {
    const populateBrowseNotes = async () => {
      if (!showBrowseNotesModal) return;
      try {
        setBrowseNotesLoading(true);
        setBrowseNotesError('');
        // Reuse the already loaded notes list
        setBrowseNotesData(notes);
      } catch (e) {
        setBrowseNotesError('Failed to load existing notes.');
      } finally {
        setBrowseNotesLoading(false);
      }
    };

    populateBrowseNotes();
  }, [showBrowseNotesModal, notes]);


  // Filter courses/notes by branches
  const courseFilters = [
    { label: 'Computer Science', count: notes.filter((n: Note) => n.branch === 'Computer Science').length, value: 'Computer Science' },
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
    setPreviewNote(note);
    handlePageChange('note-preview', `Preview: ${note.title}`);
  };

  const handleClosePreview = () => {
    setPreviewNote(null);
    handlePageChange('notes-download', 'Engineering Notes');
  };
  
  const handleCloseBundlePreview = () => {
    setPreviewBundle(null);
    handlePageChange('study-bundles', 'Study Bundles');
  };

  const handlePageChange = (pageId: string, title: string) => {
    setCurrentPage(pageId);
    setPageTitle(title);

    // Update the URL query parameter without a full navigation
    try {
      const nextQuery = { ...router.query, view: pageId } as Record<string, any>;
      // Cleanup default param when going back to main
      if (pageId === 'notes-download') {
        delete nextQuery.view;
      }
      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    } catch (e) {
      console.warn('Failed to update URL parameter for view:', e);
    }
  };

  // Upload Form Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please upload a valid file (PDF, DOC, DOCX, PPT, PPTX, TXT)');
        return;
      }
      
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        setUploadError('File size must be less than 100MB');
        return;
      }
      
      setUploadFormData({ ...uploadFormData, file });
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!user) {
      showError('Please sign in to upload notes.');
      return;
    }
    
    if (!uploadFormData.file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress >= 90) {
          clearInterval(progressInterval);
        }
        setUploadProgress(progress);
      }, 200);
      
      // Get user's IP
      const ipResponse = await fetch('/api/ip');
      const { ip } = await ipResponse.json();
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', uploadFormData.file);
      formData.append('title', uploadFormData.title);
      formData.append('branch', uploadFormData.branch);
      formData.append('semester', uploadFormData.semester);
      formData.append('subject', uploadFormData.subject);
      formData.append('description', uploadFormData.description);
      formData.append('tags', uploadFormData.tags);
      formData.append('authorName', uploadFormData.authorName);
      formData.append('degree', uploadFormData.degree);
      formData.append('noteType', uploadFormData.noteType);
      formData.append('points', uploadFormData.points.toString());
      formData.append('userIp', ip);
      
      // Upload via existing API
      const response = await fetch('/api/notes-upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      // Award points to user
      try {
        await pointsService.awardUploadBonus(
          user.$id,
          user.email,
          result.documentId,
          uploadFormData.title
        );
        showSuccess(`Upload successful! You earned 30 bonus points!`);
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        showSuccess('Upload successful!');
      }
      
      // Generate preview URL if possible
      if (result.documentId) {
        const slug = generateNoteSlug(result.documentId, uploadFormData.title);
        setUploadedNoteUrl(`/notes/preview/${slug}`);
      }
      
      setUploadSuccess(true);
      
      // Reset form
      setUploadFormData({
        title: '',
        branch: '',
        semester: '',
        subject: '',
        description: '',
        tags: '',
        authorName: '',
        degree: '',
        noteType: 'free',
        points: 50,
        file: null
      });
      
      // Refresh notes list
      const notesResponse = await fetch('/api/notes');
      if (notesResponse.ok) {
        const data = await notesResponse.json();
        setNotes(data.notes);
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUploadState = () => {
    setUploadSuccess(false);
    setUploadedNoteUrl('');
    setUploadError('');
  };

  // Helper functions for status and priority colors
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-orange-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'upcoming': return 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border border-slate-400/30';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-slate-500';
    }
  };
  
  const getCounsellingStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ongoing': return <Users className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-purple-600" />;
      default: return <Info className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const getCounsellingStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'ongoing': return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'upcoming': return 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
      case 'scheduled': return 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
      default: return 'bg-slate-500/20 text-slate-300 border border-slate-400/30';
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'exam': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'admission': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'result': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'counselling': return <Info className="h-5 w-5 text-purple-600" />;
      case 'notes': return <BookOpen className="h-5 w-5 text-indigo-600" />;
      default: return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const getNotificationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-slate-500';
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'notes-download':
        return (
          <>
            {/* Simple Search Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 mb-8 transition-colors duration-300">
              {/* Simple Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notes by title, subject, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Filter Options</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Branch Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Branch</label>
                    <select
                      value={selectedFilters.branch}
                      onChange={(e) => setSelectedFilters({...selectedFilters, branch: e.target.value})}
                      className="w-full bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">All Branches</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Semester</label>
                    <select
                      value={selectedFilters.semester}
                      onChange={(e) => setSelectedFilters({...selectedFilters, semester: e.target.value})}
                      className="w-full bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">All Semesters</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem} Semester</option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Degree</label>
                    <select
                      value={selectedFilters.degree}
                      onChange={(e) => setSelectedFilters({...selectedFilters, degree: e.target.value})}
                      className="w-full bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">All Degrees</option>
                      {degrees.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    >
                      {sortOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Count and Clear Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-slate-700/50">
                  <div className="text-sm text-gray-600 dark:text-slate-400 mb-2 sm:mb-0">
                    Showing <span className="text-gray-900 dark:text-white font-semibold">{sortedNotes.length}</span> of <span className="text-gray-900 dark:text-white font-semibold">{notes.length}</span> notes
                  </div>
                  
                  {(searchTerm || Object.values(selectedFilters).some(v => v)) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilters({ branch: '', semester: '', subject: '', degree: '', noteType: '' });
                      }}
                      className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Loading State */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <div className="relative">
                    <LoadingSpinner size="large" />
                    <div className="absolute inset-0 animate-ping">
                      <div className="w-16 h-16 rounded-full bg-blue-500/20"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-6 mb-2">Loading Amazing Notes...</h3>
                  <p className="text-slate-400 mb-4">Fetching the best study materials for you</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-red-500/10 via-red-600/10 to-red-700/10 border border-red-500/20 rounded-2xl p-12 max-w-lg mx-auto backdrop-blur-sm">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-red-400 text-xl font-bold mb-3">Oops! Something went wrong</h3>
                  <p className="text-red-300/80 mb-6">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Notes Layout - Horizontal Cards Only */}
                <motion.div
                  className="space-y-4 md:space-y-6"
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

                {/* Enhanced No Results State */}
                {sortedNotes.length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-16 max-w-2xl mx-auto backdrop-blur-sm">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                          <Search className="h-12 w-12 text-slate-400" />
                        </div>
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        No Notes Found
                      </h3>
                      <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                        We couldn't find any notes matching your criteria.<br/>
                        Try adjusting your search terms or filters to discover more content.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedFilters({ branch: '', semester: '', subject: '', degree: '', noteType: '' });
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Clear All Filters
                        </button>
                        <button
                          onClick={() => window.location.href = '/notes-upload'}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Upload Notes
                        </button>
                      </div>
                      
                      <div className="mt-12 pt-8 border-t border-slate-700/50">
                        <h4 className="text-lg font-semibold text-white mb-4">Popular Suggestions</h4>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {['Computer Science', 'Electronics', 'Mechanical', '3rd', '5th', '7th'].map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => {
                                if (['3rd', '5th', '7th'].includes(suggestion)) {
                                  setSelectedFilters({...selectedFilters, semester: suggestion});
                                } else {
                                  setSelectedFilters({...selectedFilters, branch: suggestion});
                                }
                              }}
                              className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        );
      
      case 'notes-upload':
        return (
          <div className="space-y-8">
            {/* Upload Success Modal */}
            {uploadSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Upload Successful!</h3>
                  <p className="text-slate-400 mb-4">
                    Your notes have been uploaded successfully and are now available to the community.
                  </p>
                  {uploadedNoteUrl && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-300 font-medium mb-2">📖 View your uploaded notes:</p>
                      <a 
                        href={uploadedNoteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Open Notes Preview
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {uploadedNoteUrl && (
                      <a
                        href={uploadedNoteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        View Notes
                      </a>
                    )}
                    <button
                      onClick={resetUploadState}
                      className="flex-1 bg-slate-600 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Header */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload Notes</h2>
                  <p className="text-slate-400 text-sm">Share your knowledge with the community and earn points</p>
                </div>
              </div>
              
              {!user && (
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
                    <div>
                      <p className="text-amber-300 font-medium">Sign in required</p>
                      <p className="text-amber-200 text-sm">You need to be signed in to upload notes and earn points.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Form */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-300 font-medium">Uploading...</span>
                        <span className="text-blue-300">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {uploadError && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                        <p className="text-red-300">{uploadError}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleUploadSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                      <input
                        type="text"
                        required
                        value={uploadFormData.title}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter a descriptive title for your notes"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Branch *</label>
                        <select
                          required
                          value={uploadFormData.branch}
                          onChange={(e) => setUploadFormData({ ...uploadFormData, branch: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          disabled={isUploading}
                        >
                          <option value="">Select Branch</option>
                          {branches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Semester *</label>
                        <select
                          required
                          value={uploadFormData.semester}
                          onChange={(e) => setUploadFormData({ ...uploadFormData, semester: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          disabled={isUploading}
                        >
                          <option value="">Select Semester</option>
                          {semesters.map(semester => (
                            <option key={semester} value={semester}>{semester}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Degree *</label>
                        <select
                          required
                          value={uploadFormData.degree}
                          onChange={(e) => setUploadFormData({ ...uploadFormData, degree: e.target.value })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          disabled={isUploading}
                        >
                          <option value="">Select Degree</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="Diploma">Diploma</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subject *</label>
                      <input
                        type="text"
                        required
                        value={uploadFormData.subject}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, subject: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g., Data Structures, Calculus, Physics"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={uploadFormData.description}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Describe what your notes cover, key topics, and any special features"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Author Name *</label>
                      <input
                        type="text"
                        required
                        value={uploadFormData.authorName}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, authorName: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Enter your name or nickname"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Note Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="noteType"
                              value="free"
                              checked={uploadFormData.noteType === 'free'}
                              onChange={(e) => setUploadFormData({ ...uploadFormData, noteType: e.target.value as 'free' | 'premium' })}
                              className="mr-2"
                              disabled={isUploading}
                            />
                            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                              🆓 FREE
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="noteType"
                              value="premium"
                              checked={uploadFormData.noteType === 'premium'}
                              onChange={(e) => setUploadFormData({ ...uploadFormData, noteType: e.target.value as 'free' | 'premium' })}
                              className="mr-2"
                              disabled={isUploading}
                            />
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              ⭐ PREMIUM
                            </span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Points *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="1000"
                          value={uploadFormData.points}
                          onChange={(e) => setUploadFormData({ ...uploadFormData, points: parseInt(e.target.value, 10) || 50 })}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                          disabled={isUploading}
                        />
                        <p className="text-xs text-slate-400 mt-1">Points required to download (1-1000)</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tags (optional)</label>
                      <input
                        type="text"
                        value={uploadFormData.tags}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="e.g., algorithms, programming, exam-prep (comma separated)"
                        disabled={isUploading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Upload File *</label>
                      <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                        <input
                          type="file"
                          required
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          className="hidden"
                          id="file-upload"
                          disabled={isUploading}
                        />
                        <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isUploading ? (
                            <LoadingSpinner size="large" className="mb-4" />
                          ) : (
                            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          )}
                          <p className="text-lg font-medium text-white mb-2">
                            {uploadFormData.file ? uploadFormData.file.name : 'Click to upload your notes'}
                          </p>
                          <p className="text-sm text-slate-400">
                            Support: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 100MB)
                          </p>
                          {uploadFormData.file && (
                            <p className="text-sm text-blue-400 mt-2">
                              Size: {formatFileSize(uploadFormData.file.size)}
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isUploading || !uploadFormData.file || !user}
                      className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                        (isUploading || !uploadFormData.file || !user) 
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="small" color="text-white" className="mr-2" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        'Upload Notes & Earn 30 Points'
                      )}
                    </button>
                  </form>
                </div>
              </div>
              
              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Points Information */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6">
                  <div className="text-center">
                    <Coins className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Earn Points</h3>
                    <p className="text-blue-100 mb-4">
                      Upload quality notes and earn 30 bonus points plus the points from downloads
                    </p>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-2xl font-bold">+30 Bonus</p>
                      <p className="text-sm text-blue-100">Upload Reward</p>
                    </div>
                  </div>
                </div>
                
                {/* Upload Guidelines */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                    Upload Guidelines
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Ensure notes are original and high quality
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Include clear titles and descriptions
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Use appropriate tags for better discovery
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      Files should be readable and well-organized
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      No copyrighted material without permission
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      No inappropriate or spam content
                    </li>
                  </ul>
                </div>
                
                {/* File Requirements */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-blue-400" />
                    File Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>📄 PDF, DOC, DOCX, PPT, PPTX, TXT</li>
                    <li>📏 Maximum file size: 100MB</li>
                    <li>📝 Clear and readable content</li>
                    <li>🏷️ Descriptive filename preferred</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'notes-category':
        return (
          <div className="space-y-8">
            {/* Category Overview */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Grid3X3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Notes Categories</h2>
                    <p className="text-slate-400 text-sm">Browse notes by subject and category</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Filter className="h-4 w-4" />
                  <span>{notes.length} Total Notes</span>
                </div>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, index) => {
                const branchNotes = notes.filter(n => n.branch === branch);
                const subjects = [...new Set(branchNotes.map(n => n.subject))];
                
                return (
                  <motion.div
                    key={branch}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          index % 4 === 0 ? 'bg-blue-500/20 text-blue-400' :
                          index % 4 === 1 ? 'bg-green-500/20 text-green-400' :
                          index % 4 === 2 ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-white">{branch}</h3>
                      </div>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                        {branchNotes.length} notes
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {subjects.slice(0, 4).map(subject => (
                          <span key={subject} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                            {subject}
                          </span>
                        ))}
                        {subjects.length > 4 && (
                          <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded-full">
                            +{subjects.length - 4} more
                          </span>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-slate-700/50">
                        <button 
                          onClick={() => {
                            setSelectedFilters({...selectedFilters, branch});
                            handlePageChange('notes-download', 'Engineering Notes');
                          }}
                          className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          Browse {branch} Notes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Popular Categories */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Tag className="h-5 w-5 text-blue-400" />
                <span>Popular Categories</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {semesters.map((semester, index) => {
                  const semesterNotes = notes.filter(n => n.semester === semester);
                  return (
                    <button
                      key={semester}
                      onClick={() => {
                        setSelectedFilters({...selectedFilters, semester});
                        handlePageChange('notes-download', 'Engineering Notes');
                      }}
                      className="bg-slate-700/50 hover:bg-blue-600/20 border border-slate-600/50 hover:border-blue-500/50 rounded-lg p-4 text-center transition-all duration-200 group"
                    >
                      <div className="text-lg font-semibold text-white group-hover:text-blue-400">
                        {semester} Semester
                      </div>
                      <div className="text-sm text-slate-400 group-hover:text-blue-300">
                        {semesterNotes.length} notes
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case 'notes-request':
        return (
          <div className="space-y-8">
            {/* Request Form */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Send className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Request Notes</h2>
                  <p className="text-slate-400 text-sm">Can't find the notes you need? Request them from the community</p>
                </div>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject/Topic *</label>
                    <input
                      type="text"
                      placeholder="Enter subject or topic name"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Branch *</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Semester *</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20">
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem} Semester</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what specific notes you need (chapters, topics, etc.)"
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>Requests are typically fulfilled within 24-48 hours</span>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
            
            {/* Recent Requests */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Requests</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">Data Structures and Algorithms Notes</h4>
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">Pending</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>Computer Science</span>
                      <span>•</span>
                      <span>5th Semester</span>
                      <span>•</span>
                      <span>Requested 2 days ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'notes-status-check':
        return (
          <div className="space-y-8">
            {/* Status Check Header */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Notes Status Check</h2>
                  <p className="text-slate-400 text-sm">Track your note requests and uploads</p>
                </div>
              </div>
              
              {/* Quick Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by request ID or note title..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
            
            {/* Status Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Submitted', count: 5, color: 'blue', icon: Send },
                { label: 'In Progress', count: 2, color: 'orange', icon: Clock },
                { label: 'Completed', count: 12, color: 'green', icon: CheckSquare },
                { label: 'Under Review', count: 3, color: 'purple', icon: FileCheck }
              ].map((status, index) => (
                <div key={status.label} className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${
                      status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      status.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                      status.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      <status.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-2xl font-bold ${
                      status.color === 'blue' ? 'text-blue-400' :
                      status.color === 'orange' ? 'text-orange-400' :
                      status.color === 'green' ? 'text-green-400' :
                      'text-purple-400'
                    }`}>
                      {status.count}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-white">{status.label}</div>
                  <div className="text-xs text-slate-400">Total requests</div>
                </div>
              ))}
            </div>
            
            {/* Recent Status Updates */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Recent Status Updates</h3>
              <div className="space-y-4">
                {[
                  { id: 'REQ001', title: 'Machine Learning Notes', branch: 'Computer Science', status: 'Completed', date: '2 hours ago', color: 'green' },
                  { id: 'REQ002', title: 'Thermodynamics Chapter 5', branch: 'Mechanical', status: 'In Progress', date: '1 day ago', color: 'orange' },
                  { id: 'REQ003', title: 'Digital Electronics', branch: 'Electronics', status: 'Under Review', date: '2 days ago', color: 'purple' },
                  { id: 'REQ004', title: 'Structural Analysis', branch: 'Civil', status: 'Submitted', date: '3 days ago', color: 'blue' }
                ].map((item) => (
                  <div key={item.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col">
                          <h4 className="font-medium text-white">{item.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <span>#{item.id}</span>
                            <span>•</span>
                            <span>{item.branch}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.color === 'green' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          item.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                          item.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                          'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        }`}>
                          {item.status}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{item.date}</div>
                      </div>
                    </div>
                    {item.status === 'Completed' && (
                      <div className="pt-3 border-t border-slate-600/50">
                        <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                          Download Notes
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      // Dashboard Page
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name || 'Student'}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Ready to continue your learning journey?
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userPoints.availablePoints}</div>
                  <div className="text-blue-200">Available Points</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Download className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{notes.length}</div>
                </div>
                <h3 className="font-semibold text-white">Available Notes</h3>
                <p className="text-slate-400 text-sm">Ready to download</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{likedNotes.size}</div>
                </div>
                <h3 className="font-semibold text-white">Liked Notes</h3>
                <p className="text-slate-400 text-sm">Your favorites</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{userPoints.points}</div>
                </div>
                <h3 className="font-semibold text-white">Total Points</h3>
                <p className="text-slate-400 text-sm">Lifetime earned</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{branches.length}</div>
                </div>
                <h3 className="font-semibold text-white">Branches</h3>
                <p className="text-slate-400 text-sm">Engineering fields</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  Recent Downloads
                </h3>
                <div className="space-y-4">
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{note.title}</h4>
                          <p className="text-sm text-slate-400">{note.subject} • {note.branch}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {note.downloads} downloads
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-400" />
                  Popular This Week
                </h3>
                <div className="space-y-4">
                  {notes.slice(0, 3).map((note, index) => (
                    <div key={note.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{note.title}</h4>
                          <p className="text-sm text-slate-400">{note.subject}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">
                        {note.likes} ❤️
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                  className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-4 text-blue-300 hover:text-blue-200 transition-all"
                >
                  <Download className="h-5 w-5" />
                  <span>Browse Notes</span>
                </button>
                
                <button 
                  onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                  className="flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-4 text-green-300 hover:text-green-200 transition-all"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Notes</span>
                </button>
                
                <button 
                  onClick={() => handlePageChange('notes-request', 'Notes Request')}
                  className="flex items-center justify-center space-x-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-4 text-purple-300 hover:text-purple-200 transition-all"
                >
                  <Send className="h-5 w-5" />
                  <span>Request Notes</span>
                </button>
                
                <button 
                  onClick={() => handlePageChange('wishlist', 'My Wishlist')}
                  className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg p-4 text-red-300 hover:text-red-200 transition-all"
                >
                  <Heart className="h-5 w-5" />
                  <span>My Wishlist</span>
                </button>
              </div>
            </div>
          </div>
        );
        
      // Leaderboard Page
      case 'leaderboard':
        return (
          <div className="space-y-8">
            {/* Leaderboard Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-8 text-white">
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-200" />
                <h2 className="text-3xl font-bold mb-2">Leaderboard 🏆</h2>
                <p className="text-orange-100 text-lg">
                  Top contributors ranked by their platform contributions
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-2">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'weekly', label: 'Weekly' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { rank: 1, name: 'Aditya Kumar', college: 'NIT Jamshedpur', points: 2450, level: 'Scholar', avatar: '/api/placeholder/64/64' },
                { rank: 2, name: 'Priya Sharma', college: 'BIT Mesra', points: 2100, level: 'Expert', avatar: '/api/placeholder/64/64' },
                { rank: 3, name: 'Rahul Singh', college: 'NIT Rourkela', points: 1850, level: 'Advanced', avatar: '/api/placeholder/64/64' }
              ].map((user, index) => (
                <div
                  key={user.rank}
                  className={`${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}
                    bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 text-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
                  <div className="relative">
                    <div className="text-4xl mb-4">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">{user.college}</p>
                    <div className="flex items-center justify-center gap-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-300">{user.level}</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold">
                      {user.points.toLocaleString()} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Leaderboard */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  Top Contributors
                </h2>
              </div>
              <div className="divide-y divide-slate-700/50">
                {[
                  { rank: 1, name: 'Aditya Kumar', college: 'NIT Jamshedpur', points: 2450, level: 'Scholar' },
                  { rank: 2, name: 'Priya Sharma', college: 'BIT Mesra', points: 2100, level: 'Expert' },
                  { rank: 3, name: 'Rahul Singh', college: 'NIT Rourkela', points: 1850, level: 'Advanced' },
                  { rank: 4, name: 'Anita Pal', college: 'Jharkhand University', points: 1650, level: 'Intermediate' },
                  { rank: 5, name: 'Vikash Kumar', college: 'KIIT University', points: 1450, level: 'Intermediate' }
                ].map((user, index) => (
                  <div
                    key={user.rank}
                    className={`p-6 hover:bg-slate-700/30 transition-colors ${
                      index < 3 ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-slate-400 min-w-[3rem]">
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <p className="text-sm text-slate-400">{user.college}</p>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-slate-300">{user.level}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">
                            {user.points.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-400">points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Point System Info */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                How Points Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Upload Notes</span>
                    <span className="font-semibold text-blue-400">+50 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Fulfill Request</span>
                    <span className="font-semibold text-blue-400">+30 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Platform Post</span>
                    <span className="font-semibold text-blue-400">+10 pts</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Get Upvoted</span>
                    <span className="font-semibold text-blue-400">+5 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Write Blog</span>
                    <span className="font-semibold text-blue-400">+25 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Daily Login</span>
                    <span className="font-semibold text-blue-400">+2 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Wishlist Page  
      case 'wishlist':
        const wishlistNotes = notes.filter(note => likedNotes.has(note.id));
        return (
          <div className="space-y-8">
            {/* Wishlist Header */}
            <div className="bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 rounded-xl p-8 text-white">
              <div className="text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-pink-200" />
                <h2 className="text-3xl font-bold mb-2">My Wishlist ❤️</h2>
                <p className="text-pink-100 text-lg">
                  Your favorite notes collection ({likedNotes.size} items)
                </p>
              </div>
            </div>

            {/* Wishlist Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{likedNotes.size}</div>
                </div>
                <h3 className="font-semibold text-white">Total Liked</h3>
                <p className="text-slate-400 text-sm">Notes you love</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {new Set(wishlistNotes.map(n => n.branch)).size}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Branches</h3>
                <p className="text-slate-400 text-sm">Different fields</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {new Set(wishlistNotes.map(n => n.subject)).size}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Subjects</h3>
                <p className="text-slate-400 text-sm">Unique topics</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Download className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {wishlistNotes.reduce((sum, n) => sum + n.downloads, 0)}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Downloads</h3>
                <p className="text-slate-400 text-sm">Total downloads</p>
              </div>
            </div>

            {/* Wishlist Notes */}
            {wishlistNotes.length > 0 ? (
              <motion.div
                className="space-y-4 md:space-y-6"
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
                  {wishlistNotes.map((note, index) => (
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
              <div className="text-center py-20">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-16 max-w-2xl mx-auto">
                  <Heart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h3>
                  <p className="text-slate-400 mb-8">
                    Start building your wishlist by liking notes you find helpful!
                  </p>
                  <button 
                    onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                    className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Browse Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      // Courses Page
      case 'courses':
        return (
          <div className="space-y-8">
            {/* Courses Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-xl p-8 text-white">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
                <h2 className="text-3xl font-bold mb-2">My Courses 📚</h2>
                <p className="text-indigo-100 text-lg">
                  Your personalized learning dashboard
                </p>
              </div>
            </div>

            {/* Course Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Progress */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Course Progress</h3>
                  
                  {branches.slice(0, 3).map((branch, index) => {
                    const branchNotes = notes.filter(n => n.branch === branch);
                    const completedNotes = branchNotes.filter(n => likedNotes.has(n.id));
                    const progress = branchNotes.length > 0 ? (completedNotes.length / branchNotes.length) * 100 : 0;
                    
                    return (
                      <div key={branch} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              index % 3 === 0 ? 'bg-blue-500/20 text-blue-400' :
                              index % 3 === 1 ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <h4 className="font-medium text-white">{branch}</h4>
                          </div>
                          <div className="text-sm text-slate-400">
                            {completedNotes.length}/{branchNotes.length} completed
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              index % 3 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              index % 3 === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              'bg-gradient-to-r from-purple-500 to-purple-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                          {Math.round(progress)}% Complete
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommended Courses */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Recommended for You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.slice(0, 4).map((branch, index) => {
                      const branchNotes = notes.filter(n => n.branch === branch);
                      return (
                        <div key={branch} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-colors cursor-pointer"
                             onClick={() => {
                               setSelectedFilters({...selectedFilters, branch});
                               handlePageChange('notes-download', 'Engineering Notes');
                             }}>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              index % 4 === 0 ? 'bg-blue-500/20 text-blue-400' :
                              index % 4 === 1 ? 'bg-green-500/20 text-green-400' :
                              index % 4 === 2 ? 'bg-purple-500/20 text-purple-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <h4 className="font-medium text-white">{branch}</h4>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">
                            {branchNotes.length} notes available
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full">
                              {branchNotes.filter(n => n.noteType === 'free').length} Free
                            </span>
                            <span className="text-xs text-slate-400">
                              {branchNotes.reduce((sum, n) => sum + n.downloads, 0)} downloads
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Learning Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Notes Downloaded</span>
                      <span className="font-semibold text-white">
                        {notes.filter(n => likedNotes.has(n.id)).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Subjects Covered</span>
                      <span className="font-semibold text-white">
                        {new Set(notes.filter(n => likedNotes.has(n.id)).map(n => n.subject)).size}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Points</span>
                      <span className="font-semibold text-white">{userPoints.points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Rank</span>
                      <span className="font-semibold text-yellow-400">#42</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                      className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-3 text-blue-300 hover:text-blue-200 transition-all text-sm"
                    >
                      Browse More Notes
                    </button>
                    <button 
                      onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                      className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-3 text-green-300 hover:text-green-200 transition-all text-sm"
                    >
                      Share Your Notes
                    </button>
                    <button 
                      onClick={() => handlePageChange('wishlist', 'My Wishlist')}
                      className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg p-3 text-red-300 hover:text-red-200 transition-all text-sm"
                    >
                      View Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Exam Updates Page
      case 'exam-updates':
        const examUpdates = [
          {
            id: 1,
            title: 'Final Semester Examination Schedule 2024',
            description: 'Complete examination schedule for all diploma courses final semester examinations.',
            date: '2024-08-15',
            time: '09:00 AM',
            venue: 'Various Examination Centers',
            status: 'scheduled',
            priority: 'high',
            category: 'Schedule',
            subjects: ['Computer Science', 'Electronics', 'Mechanical', 'Civil']
          },
          {
            id: 2,
            title: 'Mid-Term Examination Results',
            description: 'Results for mid-term examinations are now available for download.',
            date: '2024-07-28',
            time: '10:00 AM',
            venue: 'Online Portal',
            status: 'completed',
            priority: 'medium',
            category: 'Results',
            subjects: ['All Branches']
          },
          {
            id: 3,
            title: 'Practical Examination Guidelines',
            description: 'Updated guidelines and procedures for upcoming practical examinations.',
            date: '2024-08-05',
            time: '11:00 AM',
            venue: 'College Laboratories',
            status: 'upcoming',
            priority: 'high',
            category: 'Guidelines',
            subjects: ['Engineering Branches']
          }
        ];
        
        const getStatusIcon = (status: string) => {
          switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'scheduled': return <Calendar className="h-5 w-5 text-blue-600" />;
            case 'upcoming': return <Clock className="h-5 w-5 text-orange-600" />;
            default: return <AlertTriangle className="h-5 w-5 text-slate-600" />;
          }
        };
        
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-300 border border-green-400/30';
            case 'scheduled': return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
            case 'upcoming': return 'bg-orange-500/20 text-orange-300 border border-orange-400/30';
            default: return 'bg-slate-500/20 text-slate-300 border border-slate-400/30';
          }
        };
        
        const getPriorityColor = (priority: string) => {
          switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-slate-500';
          }
        };
        
        return (
          <div className="space-y-8">
            {/* Exam Updates Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                <h2 className="text-3xl font-bold mb-2">Exam Updates 📋</h2>
                <p className="text-blue-100 text-lg">
                  Stay informed about examination schedules, results, and important notices
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{examUpdates.filter(u => u.status === 'scheduled').length}</div>
                <div className="text-sm text-slate-400">Scheduled</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-orange-400 mb-1">{examUpdates.filter(u => u.status === 'upcoming').length}</div>
                <div className="text-sm text-slate-400">Upcoming</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">{examUpdates.filter(u => u.status === 'completed').length}</div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-red-400 mb-1">{examUpdates.filter(u => u.priority === 'high').length}</div>
                <div className="text-sm text-slate-400">High Priority</div>
              </div>
            </div>
            
            {/* Exam Updates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {examUpdates.map((update) => (
                <div
                  key={update.id}
                  className={`bg-slate-800/50 rounded-xl border-l-4 ${getPriorityColor(update.priority)} border border-slate-700/50 shadow-sm hover:shadow-lg transition-shadow duration-200 p-6`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(update.status)}
                      <h3 className="text-lg font-semibold text-white">{update.title}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                      {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 mb-4 leading-relaxed">{update.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(update.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{update.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{update.venue}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex flex-wrap gap-1">
                      {update.subjects.map(subject => (
                        <span key={subject} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                      {update.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      // Counselling Updates Page
      case 'counselling-updates':
        return <CounsellingUpdates />;
        
      // Notifications Page
      case 'notifications':
        const mockNotifications = [
          {
            id: '1',
            title: 'New Notes Available: Machine Learning Fundamentals',
            message: 'Fresh notes for Machine Learning Fundamentals have been uploaded by top contributors.',
            type: 'notes',
            category: 'Academic',
            priority: 'medium',
            isActive: true,
            targetAudience: 'Computer Science Students',
            createdBy: 'System',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Exam Schedule Released',
            message: 'Final semester examination schedule has been published. Check your exam dates now.',
            type: 'exam',
            category: 'Important',
            priority: 'high',
            isActive: true,
            targetAudience: 'All Students',
            createdBy: 'Admin',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'Counselling Round 2 Registration Open',
            message: 'Registration for second round of counselling is now open. Limited seats available.',
            type: 'counselling',
            category: 'Admission',
            priority: 'high',
            isActive: true,
            targetAudience: 'Admission Seekers',
            createdBy: 'Counselling Team',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        
        const getNotificationIcon = (type: string) => {
          switch (type) {
            case 'exam': return <Calendar className="h-5 w-5 text-blue-600" />;
            case 'admission': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            case 'result': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'counselling': return <Info className="h-5 w-5 text-purple-600" />;
            case 'notes': return <BookOpen className="h-5 w-5 text-indigo-600" />;
            default: return <Bell className="h-5 w-5 text-slate-600" />;
          }
        };
        
        const getNotificationPriorityColor = (priority: string) => {
          switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-slate-500';
          }
        };
        
        return (
          <div className="space-y-8">
            {/* Notifications Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
                <h2 className="text-3xl font-bold mb-2">Notifications 🔔</h2>
                <p className="text-indigo-100 text-lg">
                  Stay updated with the latest announcements and important information
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{mockNotifications.length}</div>
                <div className="text-sm text-slate-400">Total</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">{mockNotifications.filter(n => n.isActive).length}</div>
                <div className="text-sm text-slate-400">Active</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-orange-400 mb-1">{mockNotifications.filter(n => n.priority === 'high').length}</div>
                <div className="text-sm text-slate-400">High Priority</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{mockNotifications.filter(n => n.priority === 'medium').length}</div>
                <div className="text-sm text-slate-400">Medium Priority</div>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-slate-800/50 rounded-xl border-l-4 ${getNotificationPriorityColor(notification.priority)} border border-slate-700/50 shadow-sm hover:shadow-lg transition-shadow duration-200 p-6`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {notification.title}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                            notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                            'bg-green-500/20 text-green-300 border border-green-400/30'
                          }`}>
                            {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-slate-400 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(notification.createdAt).toLocaleString()}</span>
                            </div>
                            <span className="px-2 py-1 bg-slate-700/50 rounded-full text-xs">
                              {notification.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.isActive ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'
                            }`}>
                              {notification.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      // Groups Page
      case 'groups':
        const whatsappGroups = [
          {
            id: 1,
            name: 'CSE Students Hub',
            description: 'Connect with Computer Science Engineering students across Jharkhand',
            category: 'Branch Specific',
            type: 'Study Group',
            members: 487,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder1'
          },
          {
            id: 2,
            name: 'Electronics & Communication',
            description: 'ECE students discussion and study materials sharing group',
            category: 'Branch Specific',
            type: 'Study Group', 
            members: 342,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder2'
          },
          {
            id: 3,
            name: 'Mechanical Engineers Network',
            description: 'For all mechanical engineering students and professionals',
            category: 'Branch Specific',
            type: 'Professional',
            members: 298,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder3'
          },
          {
            id: 4,
            name: 'Civil Engineering Community',
            description: 'Civil engineering students collaboration and project discussions',
            category: 'Branch Specific',
            type: 'Study Group',
            members: 156,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder4'
          },
          {
            id: 5,
            name: 'Coding & Placement Prep',
            description: 'Programming practice, interview preparation, and placement discussions',
            category: 'Career',
            type: 'Study Group',
            members: 892,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder5'
          },
          {
            id: 6,
            name: 'Project Collaboration Hub',
            description: 'Find team members and collaborate on engineering projects',
            category: 'Projects',
            type: 'Collaboration',
            members: 234,
            isActive: true,
            link: 'https://chat.whatsapp.com/placeholder6'
          }
        ];

        return (
          <div className="space-y-8">
            {/* Groups Header */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">WhatsApp Community Groups 👥</h2>
                <p className="text-green-100 text-lg">
                  Join our vibrant WhatsApp communities and connect with fellow students
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{whatsappGroups.length}</div>
                </div>
                <h3 className="font-semibold text-white">Active Groups</h3>
                <p className="text-slate-400 text-sm">Available to join</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <UserPlus className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {whatsappGroups.reduce((sum, group) => sum + group.members, 0)}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Total Members</h3>
                <p className="text-slate-400 text-sm">Across all groups</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Hash className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {new Set(whatsappGroups.map(g => g.category)).size}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Categories</h3>
                <p className="text-slate-400 text-sm">Different types</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(whatsappGroups.reduce((sum, group) => sum + group.members, 0) / whatsappGroups.length)}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Avg Members</h3>
                <p className="text-slate-400 text-sm">Per group</p>
              </div>
            </div>
            
            {/* Groups Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {whatsappGroups.map((group) => (
                <div key={group.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-green-500/30 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                          {group.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                            {group.category}
                          </span>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                            {group.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      group.isActive ? 'bg-green-500' : 'bg-slate-500'
                    }`}></div>
                  </div>
                  
                  <p className="text-slate-400 mb-4 leading-relaxed">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{group.members} members</span>
                    </div>
                    <a
                      href={group.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Group
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8 text-center">
              <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Want to Create Your Own Group?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Have an idea for a new community group? Contact our team to get your group featured and connect with like-minded students across Jharkhand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:admin@jehub.in"
                  className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Admin
                </a>
                <button
                  onClick={() => handlePageChange('community-rules', 'Community Rules')}
                  className="inline-flex items-center bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Community Rules
                </button>
              </div>
            </div>
          </div>
        );
        
      // Events Page
      case 'events':
        return (
          <div className="space-y-8">
            {/* Events Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">Community Events 🎉</h2>
                <p className="text-green-100 text-lg">
                  Stay updated with workshops, webinars, and community meetups
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Calendar className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Events Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                We're organizing exciting events for our community:<br/>
                • Technical workshops and coding bootcamps<br/>
                • Career guidance webinars<br/>
                • Study group meetups<br/>
                • Industry expert talks
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Learning
              </button>
            </div>
          </div>
        );
        
      // Blog Page
      case 'blog':
        return (
          <div className="space-y-8">
            {/* Blog Header */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Rss className="h-16 w-16 mx-auto mb-4 text-orange-200" />
                <h2 className="text-3xl font-bold mb-2">JEHub Blog ✍️</h2>
                <p className="text-orange-100 text-lg">
                  Read articles, tutorials, and insights from the community
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <BookOpen className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Blog Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Our blog will feature:<br/>
                • Study tips and exam strategies<br/>
                • Technical tutorials and guides<br/>
                • Career advice from industry experts<br/>
                • Student success stories
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue Learning
              </button>
            </div>
          </div>
        );
        
      // Team Page
      case 'team':
        const presentTeam = getActiveTeamSortedByXP();
        const pastTeam = getOldTeamSortedByXP();

        const getRankIcon = (rank: number) => {
          switch (rank) {
            case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Award className="h-5 w-5 text-orange-500" />;
            default: return <Trophy className="h-4 w-4 text-gray-400" />;
          }
        };

        const getRankBadgeColor = (rank: number) => {
          switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
            default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
          }
        };

        const getDepartmentColor = (department: string) => {
          switch (department) {
            case 'Development Team': return 'bg-blue-100 text-blue-800';
            case 'Academic Team': return 'bg-green-100 text-green-800';
            case 'Communication Team': return 'bg-purple-100 text-purple-800';
            case 'Marketing Team': return 'bg-orange-100 text-orange-800';
            case 'Support Team': return 'bg-pink-100 text-pink-800';
            case 'Community Team': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };

        const renderTeamMember = (member: any, index: number) => {
          const rank = index + 1;
          return (
            <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)} shadow-lg`}>
                    {rank <= 3 ? getRankIcon(rank) : <span className="font-bold text-lg">#{rank}</span>}
                  </div>
                </div>
                
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-4 border-slate-600 shadow-md group-hover:border-blue-400 transition-all duration-300"
                  />
                  {teamActiveTab === 'present' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  )}
                </div>
                
                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-blue-400 font-medium mb-1">{member.role}</p>
                      <p className="text-xs text-slate-400 mb-2">{member.education}</p>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(member.department)}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        {member.department}
                      </div>
                    </div>
                    
                    {/* XP Display */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400 font-bold">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-lg">{member.xp}</span>
                      </div>
                      <p className="text-xs text-slate-400">XP Points</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Member Bio */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          );
        };

        return (
          <div className="space-y-8">
            {/* Team Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-purple-200" />
                <h2 className="text-3xl font-bold mb-2">Team Leaderboard 👨‍💼</h2>
                <p className="text-purple-100 text-lg">
                  Meet our amazing team members ranked by their contribution and experience points
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center">
              <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50">
                <button
                  onClick={() => setTeamActiveTab('present')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    teamActiveTab === 'present'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Present Team ({presentTeam.length})
                  </div>
                </button>
                <button
                  onClick={() => setTeamActiveTab('past')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    teamActiveTab === 'past'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Past Team ({pastTeam.length})
                  </div>
                </button>
              </div>
            </div>

            {/* Team Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {teamActiveTab === 'present' ? presentTeam.length : pastTeam.length}
                    </p>
                    <p className="text-sm text-slate-400">
                      {teamActiveTab === 'present' ? 'Active Members' : 'Former Members'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {teamActiveTab === 'present' 
                        ? presentTeam.reduce((sum, member) => sum + member.xp, 0).toLocaleString()
                        : pastTeam.reduce((sum, member) => sum + member.xp, 0).toLocaleString()
                      }
                    </p>
                    <p className="text-sm text-slate-400">Total XP</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {teamActiveTab === 'present' 
                        ? Math.round(presentTeam.reduce((sum, member) => sum + member.xp, 0) / presentTeam.length)
                        : Math.round(pastTeam.reduce((sum, member) => sum + member.xp, 0) / pastTeam.length)
                      }
                    </p>
                    <p className="text-sm text-slate-400">Average XP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members List */}
            <div className="space-y-4">
              {teamActiveTab === 'present' ? (
                <>
                  {presentTeam.length > 0 ? (
                    presentTeam.map((member, index) => renderTeamMember(member, index))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No active team members found.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {pastTeam.length > 0 ? (
                    <>
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                        <div className="text-center">
                          <Award className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            Honoring Our Former Contributors
                          </h3>
                          <p className="text-slate-300">
                            These dedicated individuals helped build JEHUB into what it is today.
                          </p>
                        </div>
                      </div>
                      {pastTeam.map((member, index) => renderTeamMember(member, index))}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No past team members found.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Want to Join Our Team?
              </h3>
              <p className="text-slate-400 mb-6">
                Be part of our mission to help JUT students succeed
              </p>
              <button
                onClick={() => handlePageChange('join-team', 'Join Team')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Join Team
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      // Refer & Earn Page
      case 'referral':
        return (
          <div className="space-y-8">
            {/* Referral Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Refer & Earn 🎁</h2>
                <p className="text-green-100 text-lg mb-4">
                  Invite friends and earn points together! Get 50 points for every successful referral
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="font-semibold">Earn up to 500+ points monthly!</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <UserPlus className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {referralLoading ? '...' : (referralData?.totalReferrals || userPoints.totalReferrals || 0)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Total Referrals</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Friends invited</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Coins className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pointsLoading ? '...' : userPoints.availablePoints}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Available Points</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Ready to spend</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pointsLoading ? '...' : userPoints.points}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Total Earned</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Lifetime points</p>
              </div>
              
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    #{referralLoading ? '...' : (referralData?.rank || 999)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Rank</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">In leaderboard</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Referral Tools */}
              <div className="space-y-6">
                {/* Referral Code & Link */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Hash className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Your Referral Tools</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Share these with your friends</p>
                    </div>
                  </div>
                  
                  {/* Referral Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Referral Code</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING...'}
                        readOnly
                        className="flex-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-l-lg px-4 py-3 text-gray-900 dark:text-white font-mono text-center text-lg font-bold tracking-wider transition-colors duration-300"
                      />
                      <button
                        onClick={() => {
                          const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING...';
                          navigator.clipboard.writeText(code);
                          showSuccess('Referral code copied!');
                        }}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-r-lg transition-colors duration-200 font-medium"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Referral Link */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Referral Link</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={`https://jehub.vercel.app/login?ref=${user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING'}`}
                        readOnly
                        className="flex-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-l-lg px-4 py-3 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                      />
                      <button
                        onClick={() => {
                          const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                          const link = `https://jehub.vercel.app/login?ref=${code}`;
                          navigator.clipboard.writeText(link);
                          showSuccess('Referral link copied!');
                        }}
                        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded-r-lg transition-colors duration-200 font-medium"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Share Buttons */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-400" />
                      Quick Share
                    </h4>
                    
                    <button
                      onClick={() => {
                        const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                        const link = `https://jehub.vercel.app/login?ref=${code}`;
                        const message = `🎓 Join JEHUB and get FREE Engineering Notes!\n\nUse my referral code: ${code}\nOr click: ${link}\n\n✅ Download premium notes\n✅ Earn points for activities\n✅ Get 20 bonus points with my referral!\n\n#JEHUB #EngineeringNotes #FreeEducation`;
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/>
                      </svg>
                      Share on WhatsApp
                    </button>
                    
                    <button
                      onClick={() => {
                        const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                        const link = `https://jehub.vercel.app/login?ref=${code}`;
                        const message = `🎓 Join JEHUB - Engineering Notes Platform!\n\nGet 20 bonus points with my referral code: ${code}\nDirect link: ${link}\n\n✨ Features:\n• Free engineering notes download\n• Points-based reward system\n• Upload notes for bonus points\n• Join study communities\n\nStart your learning journey! 🚀`;
                        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
                        window.open(telegramUrl, '_blank');
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      Share on Telegram
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                          const link = `https://jehub.vercel.app/login?ref=${code}`;
                          const message = `Check out JEHUB - Free Engineering Notes Platform! Use my referral code ${code} for bonus points: ${link}`;
                          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
                          window.open(twitterUrl, '_blank');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </button>
                      
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                            const link = `https://jehub.vercel.app/login?ref=${code}`;
                            navigator.share({
                              title: 'Join JEHUB - Free Engineering Notes',
                              text: `Use my referral code ${code} for bonus points!`,
                              url: link,
                            });
                          } else {
                            showInfo('Share feature not available on this device');
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <Share className="w-4 h-4" />
                        More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Earnings & Activity */}
              <div className="space-y-6">
                {/* How It Works */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How It Works</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Simple steps to earn points</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Share Your Code', desc: 'Send your referral code or link to friends', icon: Send, color: 'blue' },
                      { step: 2, title: 'Friend Joins', desc: 'They sign up using your referral code', icon: UserPlus, color: 'purple' },
                      { step: 3, title: 'Both Get Points', desc: 'You get 50 points, they get 20 bonus points', icon: Gift, color: 'green' },
                      { step: 4, title: 'Keep Earning', desc: 'Refer more friends for unlimited points', icon: TrendingUp, color: 'yellow' }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg transition-colors duration-300">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          item.color === 'blue' ? 'bg-blue-500' :
                          item.color === 'purple' ? 'bg-purple-500' :
                          item.color === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                          <p className="text-gray-600 dark:text-slate-400 text-sm">{item.desc}</p>
                        </div>
                        <item.icon className={`h-5 w-5 ${
                          item.color === 'blue' ? 'text-blue-500' :
                          item.color === 'purple' ? 'text-purple-500' :
                          item.color === 'green' ? 'text-green-500' : 'text-yellow-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Earning Opportunities */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Coins className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Points System</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Ways to earn more points</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { action: 'Successful Referral', points: 50, icon: UserPlus, color: 'text-green-500' },
                      { action: 'Upload Notes', points: 30, icon: Upload, color: 'text-blue-500' },
                      { action: 'Welcome Bonus', points: 20, icon: Gift, color: 'text-purple-500' },
                      { action: 'Daily Login', points: 5, icon: Calendar, color: 'text-orange-500' },
                      { action: 'Complete Profile', points: 15, icon: User, color: 'text-indigo-500' },
                      { action: 'Like Notes', points: 2, icon: Heart, color: 'text-red-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg transition-colors duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 ${item.color.replace('text-', 'bg-').replace('500', '500/20')} rounded-lg`}>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{item.action}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold text-yellow-500">+{item.points}</span>
                          <Coins className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Referral Leaderboard */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Top Referrers This Month</h3>
                    <p className="text-gray-600 dark:text-slate-400 text-sm">See who's leading the referral game</p>
                  </div>
                </div>
                <button 
                  onClick={() => handlePageChange('leaderboard', 'Leaderboard')}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  View Full Board
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { rank: 1, name: 'Aditya Kumar', referrals: 23, points: 1150, avatar: 'AK' },
                  { rank: 2, name: 'Priya Sharma', referrals: 19, points: 950, avatar: 'PS' },
                  { rank: 3, name: 'Rohit Singh', referrals: 15, points: 750, avatar: 'RS' }
                ].map((leader) => (
                  <div key={leader.rank} className={`relative p-4 rounded-lg border-2 transition-colors duration-300 ${
                    leader.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800' :
                    leader.rank === 2 ? 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800' :
                    'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800'
                  }`}>
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {leader.rank === 1 ? '🥇' : leader.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                        {leader.avatar}
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">{leader.name}</h4>
                      <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                        {leader.referrals} referrals • {leader.points} pts
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        leader.rank === 1 ? 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' :
                        leader.rank === 2 ? 'bg-gray-200 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200' :
                        'bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200'
                      }`}>
                        <Crown className="h-3 w-3" />
                        Rank #{leader.rank}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-xl p-8 text-center transition-colors duration-300">
              <div className="max-w-2xl mx-auto">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ready to Start Earning?</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-6 text-lg">
                  Start referring your friends today and build your points balance. The more you share, the more you earn!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      const code = user?.email ? user.email.split('@')[0].toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase() : 'LOADING';
                      const link = `https://jehub.vercel.app/login?ref=${code}`;
                      navigator.clipboard.writeText(link);
                      showSuccess('Referral link copied! Share it with your friends.');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Copy My Referral Link
                  </button>
                  <button 
                    onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                    className="px-8 py-4 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-xl font-bold text-lg transition-all duration-200"
                  >
                    Upload Notes (+30 pts)
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      // Old Team Members Page
      case 'old-team-members':
        return (
          <div className="space-y-8">
            {/* Old Team Header */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                <h2 className="text-3xl font-bold mb-2">Alumni Team Members 🏆</h2>
                <p className="text-slate-100 text-lg">
                  Honoring our former team members who helped build JEHub
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Trophy className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Alumni Section Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This section will honor:<br/>
                • Former team members and their contributions<br/>
                • Alumni success stories<br/>
                • Historical journey of JEHub<br/>
                • Recognition and achievements
              </p>
              <button 
                onClick={() => handlePageChange('team', 'Team')}
                className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View Current Team
              </button>
            </div>
          </div>
        );
        
      // Join Team Page
      case 'join-team':
        return (
          <div className="space-y-8">
            {/* Join Team Header */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">Join Our Team 🚀</h2>
                <p className="text-green-100 text-lg">
                  Be part of something amazing - Help us build the future of education
                </p>
              </div>
            </div>
            
            {/* Hiring Badge */}
            <div className="text-center">
              <span className="bg-green-500/20 text-green-300 border border-green-400/30 px-6 py-3 rounded-full text-lg font-bold animate-pulse">
                🔥 We're Hiring! 🔥
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Why Join JEHub?</h3>
                <div className="space-y-4 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Make an Impact</h4>
                      <p className="text-sm text-slate-400">Help thousands of students access quality education resources</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Flexible Work</h4>
                      <p className="text-sm text-slate-400">Work remotely with flexible hours that fit your schedule</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Learn & Grow</h4>
                      <p className="text-sm text-slate-400">Gain experience in tech, education, and community building</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Great Community</h4>
                      <p className="text-sm text-slate-400">Work with passionate, like-minded individuals</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Open Positions</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Frontend Developer', type: 'Part-time', skills: ['React', 'TypeScript', 'Tailwind'] },
                    { title: 'Content Creator', type: 'Volunteer', skills: ['Writing', 'Video Editing', 'Education'] },
                    { title: 'Community Manager', type: 'Part-time', skills: ['Communication', 'Social Media', 'Community'] },
                    { title: 'Backend Developer', type: 'Part-time', skills: ['Node.js', 'Database', 'APIs'] }
                  ].map((job, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{job.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          job.type === 'Part-time' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                        }`}>
                          {job.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.map(skill => (
                          <span key={skill} className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Join?</h3>
              <p className="text-slate-300 mb-6">
                Send us your details and let's build something amazing together!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Apply Now
                </button>
                <button 
                  onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  Back to Notes
                </button>
              </div>
            </div>
          </div>
        );
        
      // Internships Page
      case 'internships':
        return (
          <div className="space-y-8">
            {/* Internships Header */}
            <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-yellow-200" />
                <h2 className="text-3xl font-bold mb-2">Internship Opportunities 💼</h2>
                <p className="text-yellow-100 text-lg">
                  Discover internship opportunities and kickstart your career
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Target className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Internships Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                We're building partnerships to offer:<br/>
                • Tech internships with top companies<br/>
                • Remote work opportunities<br/>
                • Skill-based matching<br/>
                • Mentorship programs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handlePageChange('join-team', 'Join Team')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Intern With Us
                </button>
                <button 
                  onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Learning
                </button>
              </div>
            </div>
          </div>
        );
        
      // Premium Page
      case 'premium':
        return (
          <div className="space-y-8">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-200" />
                <h2 className="text-3xl font-bold mb-2">Become Premium User 👑</h2>
                <p className="text-yellow-100 text-lg">
                  Unlock exclusive benefits and premium content access
                </p>
              </div>
            </div>
            
            {/* Premium Benefits */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">Premium Benefits</h3>
                  <p className="text-slate-400 text-sm">Enjoy exclusive features and priority access</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { icon: Download, title: 'Unlimited Downloads', desc: 'Download any number of premium notes without restrictions' },
                    { icon: Star, title: 'Exclusive Content', desc: 'Access to premium notes and study materials' },
                    { icon: Zap, title: 'Priority Support', desc: 'Get faster response times for your queries' },
                    { icon: Crown, title: 'Premium Badge', desc: 'Show your premium status with a special badge' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                        <benefit.icon className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                        <p className="text-slate-400 text-sm">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {[
                    { icon: Users, title: 'Community Access', desc: 'Join exclusive premium user groups' },
                    { icon: Gift, title: 'Bonus Points', desc: 'Get extra points for activities and referrals' },
                    { icon: Calendar, title: 'Early Access', desc: 'Get first access to new features and content' },
                    { icon: Award, title: 'Special Recognition', desc: 'Premium users get highlighted in leaderboards' }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
                        <benefit.icon className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                        <p className="text-slate-400 text-sm">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Eligibility Criteria */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">How to Become Premium</h3>
                  <p className="text-slate-400 text-sm">Choose any one of these methods to upgrade</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <UserPlus className="h-6 w-6 mr-3 text-blue-400" />
                    Community Contribution
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Refer 100 members</span>
                      <Crown className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Upload 100 notes</span>
                      <Upload className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Become a team member</span>
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center">
                    <DollarSign className="h-6 w-6 mr-3 text-green-400" />
                    Subscription Plan
                  </h4>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">₹150</div>
                    <div className="text-slate-400 mb-4">per month</div>
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
                      <p className="text-green-300 font-medium text-sm">Special Launch Offer!</p>
                      <p className="text-green-200 text-xs">First month only ₹99</p>
                    </div>
                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Points to Money Conversion */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Coins className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">Points & Rewards System</h3>
                  <p className="text-slate-400 text-sm">Understand how our points system works</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white mb-4">Conversion Rate</h4>
                  <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">10 Coins = ₹10</div>
                    <div className="text-amber-300 text-sm">Direct conversion rate</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white mb-4">New Member Bonus</h4>
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="h-8 w-8 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-blue-400">+15 Coins</span>
                    </div>
                    <div className="text-blue-300 text-sm text-center">Welcome bonus for new members</div>
                    <div className="text-xs text-slate-400 text-center mt-1">Added to your account on signup</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-amber-500/10 border border-amber-400/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-medium mb-2">How to Use Points</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-200">
                      <div>• Download premium notes</div>
                      <div>• Request custom content</div>
                      <div>• Unlock exclusive features</div>
                      <div>• Convert to real money (coming soon)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Go Premium?</h3>
              <p className="text-slate-400 mb-8 text-lg">
                Join thousands of premium users and unlock the full potential of JEHUB!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handlePageChange('referral', 'Refer & Earn')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start Referring Friends
                </button>
                <button 
                  onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upload Notes
                </button>
                <button 
                  onClick={() => handlePageChange('join-team', 'Join Team')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Join Our Team
                </button>
              </div>
            </div>
          </div>
        );
        
      // Study Bundles Page
      case 'study-bundles':
        const [studyBundles, setStudyBundles] = useState<Bundle[]>([
          {
            id: '1',
            title: 'Complete Data Structures & Algorithms',
            description: 'Comprehensive collection of DSA notes, practice problems, and implementation guides for competitive programming and technical interviews.',
            price: 299,
            originalPrice: 599,
            discount: 50,
            notesCount: 12,
            videosCount: 8,
            totalDownloads: 1247,
            rating: 4.8,
            reviews: 89,
            category: 'Computer Science',
            level: 'Intermediate',
            duration: '6 weeks',
            instructor: 'Prof. Aditya Kumar',
            tags: ['DSA', 'Algorithms', 'Data Structures', 'Coding', 'Interviews'],
            thumbnail: '/api/placeholder/300/200',
            isPopular: true,
            access: 'premium', // 'free', 'premium', 'purchase'
            notes: [
              { id: '1-1', title: 'Arrays & Strings Fundamentals', type: 'pdf', size: '2.4 MB', description: 'Learn array manipulation and string processing techniques', fileUrl: '#' },
              { id: '1-2', title: 'Linked Lists Complete Guide', type: 'pdf', size: '1.8 MB', description: 'Master linked list operations and implementations', fileUrl: '#' },
              { id: '1-3', title: 'Trees & Binary Search Trees', type: 'pdf', size: '3.1 MB', description: 'Complete guide to tree data structures', fileUrl: '#' },
              { id: '1-4', title: 'Graph Algorithms Masterclass', type: 'pdf', size: '2.7 MB', description: 'Advanced graph algorithms and applications', fileUrl: '#' }
            ],
            videos: [
              { id: '1-v1', title: 'DSA Introduction & Roadmap', type: 'youtube', url: 'https://www.youtube.com/watch?v=0IAPZzGSbME', duration: '15:30', description: 'Complete roadmap for learning DSA effectively' },
              { id: '1-v2', title: 'Arrays Problem Solving', type: 'youtube', url: 'https://www.youtube.com/watch?v=example1', duration: '25:45', description: 'Solve complex array problems step by step' },
              { id: '1-v3', title: 'Linked List Implementation', type: 'youtube', url: 'https://www.youtube.com/watch?v=example2', duration: '20:15', description: 'Implement linked lists from scratch' },
              { id: '1-v4', title: 'Binary Trees Explained', type: 'youtube', url: 'https://www.youtube.com/watch?v=example3', duration: '35:20', description: 'Understanding binary trees and traversals' }
            ]
          },
          {
            id: '2',
            title: 'Digital Electronics Mastery Bundle',
            description: 'Master digital electronics with logic gates, flip-flops, counters, and digital system design. Perfect for ECE students.',
            price: 199,
            originalPrice: 399,
            discount: 50,
            notesCount: 8,
            videosCount: 6,
            totalDownloads: 856,
            rating: 4.6,
            reviews: 67,
            category: 'Electronics',
            level: 'Beginner',
            duration: '4 weeks',
            instructor: 'Dr. Priya Sharma',
            tags: ['Digital Electronics', 'Logic Gates', 'Flip Flops', 'Counters'],
            thumbnail: '/api/placeholder/300/200',
            isPopular: false,
            access: 'purchase',
            notes: [
              { title: 'Logic Gates & Boolean Algebra', type: 'pdf', size: '1.9 MB', description: 'Fundamentals of logic gates and Boolean operations' },
              { title: 'Flip-Flops & Latches', type: 'pdf', size: '1.6 MB', description: 'Sequential circuits and memory elements' },
              { title: 'Counters & Shift Registers', type: 'pdf', size: '2.2 MB', description: 'Digital counting circuits and data storage' }
            ],
            videos: [
              { title: 'Digital Electronics Basics', type: 'youtube', url: 'https://www.youtube.com/watch?v=example4', duration: '18:45', description: 'Introduction to digital electronics concepts' },
              { title: 'Logic Gates Explained', type: 'youtube', url: 'https://www.youtube.com/watch?v=example5', duration: '22:30', description: 'Complete guide to logic gates and truth tables' },
              { title: 'Flip-Flop Circuits', type: 'youtube', url: 'https://www.youtube.com/watch?v=example6', duration: '28:15', description: 'Understanding sequential logic circuits' }
            ]
          },
          {
            id: '3',
            title: 'Mechanical Engineering Fundamentals',
            description: 'Core mechanical engineering concepts including thermodynamics, fluid mechanics, and strength of materials.',
            price: 0,
            originalPrice: 0,
            discount: 0,
            notesCount: 15,
            videosCount: 12,
            totalDownloads: 2134,
            rating: 4.7,
            reviews: 156,
            category: 'Mechanical',
            level: 'Beginner',
            duration: '8 weeks',
            instructor: 'Prof. Rajesh Singh',
            tags: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials'],
            thumbnail: '/api/placeholder/300/200',
            isPopular: true,
            access: 'free',
            notes: [
              { title: 'Thermodynamics Laws & Cycles', type: 'pdf', size: '3.5 MB', description: 'Complete thermodynamics theory and applications' },
              { title: 'Fluid Mechanics Basics', type: 'pdf', size: '2.8 MB', description: 'Fluid properties and flow analysis' },
              { title: 'Strength of Materials', type: 'pdf', size: '4.1 MB', description: 'Stress, strain and material properties' },
              { title: 'Heat Transfer Fundamentals', type: 'pdf', size: '3.2 MB', description: 'Conduction, convection, and radiation heat transfer' },
              { title: 'Machine Design Principles', type: 'pdf', size: '4.5 MB', description: 'Design of mechanical components and systems' },
              { title: 'Manufacturing Processes', type: 'pdf', size: '3.8 MB', description: 'Machining, welding, and casting processes' },
              { title: 'Engineering Mechanics', type: 'pdf', size: '3.1 MB', description: 'Statics and dynamics of mechanical systems' },
              { title: 'Material Science & Engineering', type: 'pdf', size: '4.2 MB', description: 'Properties and selection of engineering materials' },
              { title: 'Vibrations & Control Systems', type: 'pdf', size: '3.6 MB', description: 'Mechanical vibrations and control theory' },
              { title: 'Internal Combustion Engines', type: 'pdf', size: '4.3 MB', description: 'Design and analysis of IC engines' },
              { title: 'Refrigeration & Air Conditioning', type: 'pdf', size: '3.9 MB', description: 'HVAC systems and refrigeration cycles' },
              { title: 'Power Plant Engineering', type: 'pdf', size: '4.0 MB', description: 'Steam and gas turbine power plants' },
              { title: 'Automotive Engineering', type: 'pdf', size: '3.7 MB', description: 'Vehicle design and automotive systems' },
              { title: 'Finite Element Analysis', type: 'pdf', size: '4.4 MB', description: 'FEA methods and applications' },
              { title: 'Industrial Engineering', type: 'pdf', size: '3.3 MB', description: 'Production planning and quality control' }
            ],
            videos: [
              { title: 'Thermodynamics Introduction', type: 'youtube', url: 'https://www.youtube.com/watch?v=example7', duration: '30:00', description: 'Introduction to thermodynamic principles' },
              { title: 'Heat Engines & Cycles', type: 'youtube', url: 'https://www.youtube.com/watch?v=example8', duration: '45:30', description: 'Understanding heat engines and thermodynamic cycles' },
              { title: 'Fluid Flow Analysis', type: 'youtube', url: 'https://www.youtube.com/watch?v=example9', duration: '35:45', description: 'Analyzing fluid flow in pipes and channels' },
              { title: 'Stress & Strain Concepts', type: 'youtube', url: 'https://www.youtube.com/watch?v=example10', duration: '25:20', description: 'Understanding material behavior under load' },
              { title: 'Heat Transfer Mechanisms', type: 'youtube', url: 'https://www.youtube.com/watch?v=example11', duration: '40:15', description: 'Heat transfer by conduction, convection, radiation' },
              { title: 'Machine Design Fundamentals', type: 'youtube', url: 'https://www.youtube.com/watch?v=example12', duration: '38:45', description: 'Design principles for mechanical components' },
              { title: 'Manufacturing Process Overview', type: 'youtube', url: 'https://www.youtube.com/watch?v=example13', duration: '42:30', description: 'Common manufacturing techniques and processes' },
              { title: 'Static Equilibrium Problems', type: 'youtube', url: 'https://www.youtube.com/watch?v=example14', duration: '28:20', description: 'Solving statics problems step by step' },
              { title: 'Material Properties & Testing', type: 'youtube', url: 'https://www.youtube.com/watch?v=example15', duration: '33:45', description: 'Understanding material behavior and testing methods' },
              { title: 'Vibration Analysis', type: 'youtube', url: 'https://www.youtube.com/watch?v=example16', duration: '36:15', description: 'Free and forced vibrations in mechanical systems' },
              { title: 'IC Engine Working Principles', type: 'youtube', url: 'https://www.youtube.com/watch?v=example17', duration: '44:30', description: '4-stroke and 2-stroke engine operation' },
              { title: 'HVAC System Design', type: 'youtube', url: 'https://www.youtube.com/watch?v=example18', duration: '41:20', description: 'Heating, ventilation, and air conditioning systems' }
            ]
          },
          {
            id: '4',
            title: 'Civil Engineering Construction Bundle',
            description: 'Learn construction management, structural analysis, and building materials for modern civil engineering projects.',
            price: 249,
            originalPrice: 449,
            discount: 44,
            notesCount: 10,
            videosCount: 7,
            totalDownloads: 643,
            rating: 4.5,
            reviews: 42,
            category: 'Civil',
            level: 'Advanced',
            duration: '5 weeks',
            instructor: 'Eng. Kavitha Reddy',
            tags: ['Construction', 'Structural Analysis', 'Building Materials'],
            thumbnail: '/api/placeholder/300/200',
            isPopular: false,
            access: 'premium',
            notes: [
              { title: 'Construction Management Principles', type: 'pdf', size: '2.6 MB', description: 'Project planning and construction management' },
              { title: 'Structural Analysis Methods', type: 'pdf', size: '3.3 MB', description: 'Analyzing structural loads and responses' },
              { title: 'Modern Building Materials', type: 'pdf', size: '2.1 MB', description: 'Contemporary construction materials and properties' }
            ],
            videos: [
              { title: 'Construction Project Management', type: 'youtube', url: 'https://www.youtube.com/watch?v=example11', duration: '40:15', description: 'Managing construction projects effectively' },
              { title: 'Structural Design Basics', type: 'youtube', url: 'https://www.youtube.com/watch?v=example12', duration: '32:45', description: 'Introduction to structural design principles' },
              { title: 'Building Materials Testing', type: 'youtube', url: 'https://www.youtube.com/watch?v=example13', duration: '28:30', description: 'Testing procedures for construction materials' }
            ]
          }
        ];
        
        const getAccessBadge = (access: string, price: number) => {
          if (access === 'free') {
            return <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">🆓 FREE</span>;
          } else if (access === 'premium') {
            return <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">⭐ PREMIUM</span>;
          } else {
            return <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">₹{price}</span>;
          }
        };
        
        const handleBundlePreview = (bundle: any) => {
          setPreviewBundle(bundle);
          handlePageChange('bundle-preview', `Preview: ${bundle.title}`);
        };
        
        const handleBundleAction = (bundle: any) => {
          if (bundle.access === 'free') {
            showSuccess(`Started accessing ${bundle.title}!`);
            // Open bundle preview for free bundles
            setTimeout(() => handleBundlePreview(bundle), 500);
          } else if (bundle.access === 'premium') {
            if (user) {
              showInfo(`This bundle requires premium membership. Upgrade to access ${bundle.title}.`);
              setTimeout(() => handlePageChange('premium', 'Become Premium User'), 1500);
            } else {
              showError('Please sign in to access premium bundles.');
            }
          } else {
            showInfo(`Purchase ${bundle.title} for ₹${bundle.price} to get lifetime access.`);
          }
        };
        
        return (
          <div className="space-y-8">
            {/* Study Bundles Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-3 h-3 bg-white/80 rounded"></div>
                    <div className="w-3 h-3 bg-white/60 rounded"></div>
                    <div className="w-3 h-3 bg-white/60 rounded"></div>
                    <div className="w-3 h-3 bg-white/80 rounded"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Study Bundles 📦</h2>
                <p className="text-purple-100 text-lg mb-4">
                  Curated collections of notes for comprehensive learning
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="font-semibold">{studyBundles.length}</span> bundles available
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="font-semibold">{studyBundles.filter(b => b.access === 'free').length}</span> free bundles
                  </div>
                  <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="font-semibold">{studyBundles.reduce((sum, b) => sum + b.notesCount, 0)}</span> total notes
                  </div>
                </div>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'Free', 'Premium', 'Purchase', 'Computer Science', 'Electronics', 'Mechanical', 'Civil'].map((filter) => (
                <button
                  key={filter}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50"
                >
                  {filter}
                </button>
              ))}
            </div>
            
            {/* Bundles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {studyBundles.map((bundle) => (
                <div key={bundle.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden hover:border-purple-500/30 transition-all duration-300 group shadow-lg hover:shadow-xl cursor-pointer" onClick={() => handleBundlePreview(bundle)}>
                  {/* Bundle Header */}
                  <div className="relative">
                    {/* Thumbnail Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <div className="text-6xl opacity-50">
                        {bundle.category === 'Computer Science' ? '💻' :
                         bundle.category === 'Electronics' ? '⚡' :
                         bundle.category === 'Mechanical' ? '⚙️' : '🏗️'}
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4">
                      {getAccessBadge(bundle.access, bundle.price)}
                    </div>
                    
                    {bundle.isPopular && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-400/30">
                          🔥 POPULAR
                        </span>
                      </div>
                    )}
                    
                    {bundle.discount > 0 && (
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-400/30">
                          {bundle.discount}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Bundle Content */}
                  <div className="p-6">
                    {/* Title & Category */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                          {bundle.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                            {bundle.category}
                          </span>
                          <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                            {bundle.level}
                          </span>
                          <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                            {bundle.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                      {bundle.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
                      <div className="bg-blue-500/10 rounded-lg p-2">
                        <div className="text-base sm:text-lg font-bold text-white">{bundle.notesCount}</div>
                        <div className="text-xs text-slate-400">Notes</div>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg p-2">
                        <div className="text-base sm:text-lg font-bold text-white">{bundle.videosCount || 0}</div>
                        <div className="text-xs text-slate-400">Videos</div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <div className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          {bundle.rating}
                        </div>
                        <div className="text-xs text-slate-400">Rating</div>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-2">
                        <div className="text-base sm:text-lg font-bold text-white">{bundle.reviews}</div>
                        <div className="text-xs text-slate-400">Reviews</div>
                      </div>
                    </div>
                    
                    {/* Instructor */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {bundle.instructor.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{bundle.instructor}</div>
                        <div className="text-xs text-slate-400">Course Instructor</div>
                      </div>
                    </div>
                    
                    {/* Sample Content */}
                    <div className="mb-6 space-y-4">
                      {/* Sample Notes */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          Sample Notes ({Math.min(bundle.notes.length, 2)} of {bundle.notesCount})
                        </h4>
                        <div className="space-y-2">
                          {bundle.notes.slice(0, 2).map((note, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-red-400">PDF</span>
                                </div>
                                <span className="text-sm text-slate-300 truncate">{note.title}</span>
                              </div>
                              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{note.size}</span>
                            </div>
                          ))}
                          {bundle.notesCount > 2 && (
                            <div className="text-center">
                              <span className="text-xs text-slate-400">+ {bundle.notesCount - 2} more notes</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Sample Videos */}
                      {bundle.videos && bundle.videos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
                              <span className="text-xs font-bold text-white">▶</span>
                            </div>
                            Sample Videos ({Math.min(bundle.videos.length, 2)} of {bundle.videosCount || bundle.videos.length})
                          </h4>
                          <div className="space-y-2">
                            {bundle.videos.slice(0, 2).map((video, index) => (
                              <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-6 h-6 bg-red-600/20 rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-red-400">YT</span>
                                  </div>
                                  <span className="text-sm text-slate-300 truncate">{video.title}</span>
                                </div>
                                <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{video.duration}</span>
                              </div>
                            ))}
                            {(bundle.videosCount || bundle.videos.length) > 2 && (
                              <div className="text-center">
                                <span className="text-xs text-slate-400">+ {(bundle.videosCount || bundle.videos.length) - 2} more videos</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {bundle.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Price & Action */}
                    <div className="pt-4 border-t border-slate-700/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {bundle.price > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl sm:text-2xl font-bold text-white">₹{bundle.price}</span>
                              {bundle.originalPrice > bundle.price && (
                                <span className="text-sm text-slate-400 line-through">₹{bundle.originalPrice}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xl sm:text-2xl font-bold text-green-400">FREE</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBundlePreview(bundle);
                            }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBundleAction(bundle);
                            }}
                            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base ${
                              bundle.access === 'free' ? 'bg-green-600 hover:bg-green-700 text-white' :
                              bundle.access === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' :
                              'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {bundle.access === 'free' ? 'Start' :
                             bundle.access === 'premium' ? 'Upgrade' : 'Purchase'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-4">Want to Create Your Own Bundle?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Have expertise in a subject? Create curated note bundles and share your knowledge with fellow students. 
                Earn points and recognition in the community!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upload Your Notes
                </button>
                <button 
                  onClick={() => handlePageChange('join-team', 'Join Team')}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-200"
                >
                  Join Content Team
                </button>
              </div>
            </div>
          </div>
        );
        
      // Admin Bundle Management Page
      case 'admin-bundle-management':
        
        // Bundle Management Functions
        const handleCreateBundle = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsCreatingBundle(true);
          setBundleCreationError('');
          
          try {
            // Validate required fields
            if (!newBundle.title || !newBundle.category || !newBundle.description) {
              throw new Error('Please fill in all required fields');
            }
            
            // Simulate API call to create bundle
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Create new bundle without the id from newBundle
            const { id: _, ...bundleWithoutId } = newBundle;
            const createdBundle = {
              ...bundleWithoutId,
              id: `bundle_${Date.now()}`,
              notesCount: 0,
              totalSales: 0,
              revenue: 0,
              status: 'draft',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setStudyBundles((prev: typeof studyBundles) => [createdBundle, ...prev]);
            
            // Reset form
            setNewBundle({
              id: '',
              title: '',
              description: '',
              category: '',
              price: 0,
              access: 'free',
              notes: [],
              videos: [],
              instructor: '',
              tags: '',
              status: 'draft',
              notesCount: 0
            });
            
            // Reset note and video forms
            setNewNote({ title: '', description: '', size: '', fileUrl: '', type: 'pdf' });
            setNewVideo({ title: '', description: '', duration: '', url: '', type: 'youtube' });
            setShowAddNoteForm(false);
            setShowAddVideoForm(false);
            
            setShowCreateForm(false);
            showSuccess('Bundle created successfully!');
            
          } catch (error) {
            setBundleCreationError(error instanceof Error ? error.message : 'Failed to create bundle');
            showError('Failed to create bundle. Please try again.');
          } finally {
            setIsCreatingBundle(false);
          }
        };
        
        const handleEditBundle = (bundle: any) => {
          setEditingBundle(bundle);
          setNewBundle({
            id: bundle.id || '',
            title: bundle.title,
            description: bundle.description || '',
            category: bundle.category,
            price: bundle.price,
            access: bundle.access,
            notes: bundle.notes || [],
            videos: bundle.videos || [],
            instructor: bundle.instructor || '',
            tags: bundle.tags || '',
            status: bundle.status || 'draft',
            notesCount: bundle.notesCount || 0
          });
          setShowEditForm(true);
        };
        
        const handleUpdateBundle = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!editingBundle) return;
          
          setIsCreatingBundle(true);
          setBundleCreationError('');
          
          try {
            // Validate required fields
            if (!newBundle.title || !newBundle.category || !newBundle.description) {
              throw new Error('Please fill in all required fields');
            }
            
            // Simulate API call to update bundle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const updateFunction = currentPage === 'admin-bundle-management' 
              ? updateAdminBundle 
              : updatePublishedBundle;
            
            await updateFunction(editingBundle.id, {
              ...newBundle,
              updatedAt: new Date().toISOString()
            });
            
            // Reset form
            setNewBundle({
              id: '',
              title: '',
              description: '',
              category: '',
              price: 0,
              access: 'free',
              notes: [],
              videos: [],
              instructor: '',
              tags: '',
              status: 'draft',
              notesCount: 0
            });
            
            setEditingBundle(null);
            setShowEditForm(false);
            showSuccess('Bundle updated successfully!');
            
          } catch (error) {
            setBundleCreationError(error instanceof Error ? error.message : 'Failed to update bundle');
            showError('Failed to update bundle. Please try again.');
          } finally {
            setIsCreatingBundle(false);
          }
        };
        
        const handleDeleteBundle = (bundleId: string) => {
          setShowDeleteConfirm(bundleId);
        };
        
        const confirmDeleteBundle = async () => {
          if (!showDeleteConfirm) return;
          
          try {
            // Simulate API call to delete bundle
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const deleteFunction = currentPage === 'admin-bundle-management' 
              ? deleteAdminBundle 
              : deletePublishedBundle;
            
            await deleteFunction(showDeleteConfirm);
            setShowDeleteConfirm(null);
            showSuccess('Bundle deleted successfully!');
            
          } catch (error) {
            showError('Failed to delete bundle. Please try again.');
          }
        };
        
        const handleViewBundle = (bundle: any) => {
          // Set the bundle for preview and navigate to bundle preview page
          setPreviewBundle(bundle);
          handlePageChange('bundle-preview', `Preview: ${bundle.title}`);
        };
        
        const handleToggleBundleStatus = async (bundleId: string, newStatus: string) => {
          try {
            // Simulate API call to update status
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const updateFunction = currentPage === 'admin-bundle-management' 
              ? updateAdminBundle 
              : updatePublishedBundle;
            
            await updateFunction(bundleId, {
              status: newStatus,
              updatedAt: new Date().toISOString()
            });
            
            showSuccess(`Bundle ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
            
          } catch (error) {
            showError('Failed to update bundle status.');
          }
        };
        
        const handleDuplicateBundle = async (bundle: any) => {
          try {
            // Simulate API call to duplicate bundle
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { id: _, ...bundleWithoutId } = bundle;
            const duplicatedBundle = {
              ...bundleWithoutId,
              id: `bundle_${Date.now()}`,
              title: `${bundle.title} (Copy)`,
              status: 'draft',
              totalSales: 0,
              revenue: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setBundles(prev => [duplicatedBundle, ...prev]);
            showSuccess('Bundle duplicated successfully!');
            
          } catch (error) {
            showError('Failed to duplicate bundle.');
          }
        };
        
        const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
        
        const handleBulkDelete = async () => {
          if (selectedBundles.length === 0) {
            showWarning('Please select bundles to delete.');
            return;
          }
          showConfirmation(
            `Are you sure you want to delete ${selectedBundles.length} selected bundle(s)? This action cannot be undone.`,
            async () => {
              try {
                // Simulate API call to bulk delete
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                setBundles(prev => prev.filter(bundle => !selectedBundles.includes(bundle.id)));
                setSelectedBundles([]);
                showSuccess(`${selectedBundles.length} bundle(s) deleted successfully!`);
                
              } catch (error) {
                showError('Failed to delete selected bundles.');
              }
            }
          );
        };
        
        const handleSelectBundle = (bundleId: string) => {
          setSelectedBundles(prev => 
            prev.includes(bundleId)
              ? prev.filter(id => id !== bundleId)
              : [...prev, bundleId]
          );
        };
        
        const handleSelectAllBundles = () => {
          if (selectedBundles.length === bundles.length) {
            setSelectedBundles([]);
          } else {
            setSelectedBundles(bundles.map(bundle => bundle.id));
          }
        };
        
        // Note Management Functions
        const handleAddNote = () => {
          if (!newNote.title.trim() || !newNote.fileUrl.trim()) {
            showError('Please fill in note title and file URL');
            return;
          }
          
          const note = {
            id: `note_${Date.now()}`,
            ...newNote,
            size: newNote.size || '1.5 MB'
          };
          
          setNewBundle(prev => ({
            ...prev,
            notes: [...prev.notes, note]
          }));
          
          setNewNote({ title: '', description: '', size: '', fileUrl: '', type: 'pdf' });
          setShowAddNoteForm(false);
          showSuccess('Note added to bundle!');
        };
        
        const handleRemoveNote = (noteId: string) => {
          setNewBundle(prev => ({
            ...prev,
            notes: prev.notes.filter(note => note.id !== noteId)
          }));
          showSuccess('Note removed from bundle!');
        };
        
        // Video Management Functions
        const handleAddVideo = () => {
          if (!newVideo.title.trim() || !newVideo.url.trim()) {
            showError('Please fill in video title and URL');
            return;
          }
          
          const video = {
            id: `video_${Date.now()}`,
            ...newVideo,
            duration: newVideo.duration || '15:00'
          };
          
          setNewBundle(prev => ({
            ...prev,
            videos: [...prev.videos, video]
          }));
          
          setNewVideo({ title: '', description: '', duration: '', url: '', type: 'youtube' });
          setShowAddVideoForm(false);
          showSuccess('Video added to bundle!');
        };
        
        const handleRemoveVideo = (videoId: string) => {
          setNewBundle(prev => ({
            ...prev,
            videos: prev.videos.filter(video => video.id !== videoId)
          }));
          showSuccess('Video removed from bundle!');
        };

        return (
          <div className="space-y-8">
            {/* Bundle Management Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-4 h-4 bg-white/80 rounded"></div>
                    <div className="w-4 h-4 bg-white/60 rounded"></div>
                    <div className="w-4 h-4 bg-white/60 rounded"></div>
                    <div className="w-4 h-4 bg-white/80 rounded"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Bundle Management 📦</h2>
                <p className="text-purple-100 text-lg">
                  Create and manage study bundles for organized learning
                </p>
              </div>
            </div>
            
            {/* Management Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Grid3X3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{bundles.length}</div>
                </div>
                <h3 className="font-semibold text-white">Total Bundles</h3>
                <p className="text-slate-400 text-sm">Active collections</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ₹{bundles.reduce((sum, b) => sum + (b.revenue ?? 0), 0).toLocaleString()}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Total Revenue</h3>
                <p className="text-slate-400 text-sm">From all bundles</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Download className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {bundles.reduce((sum, b) => sum + (b.totalSales ?? 0), 0)}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Total Sales</h3>
                <p className="text-slate-400 text-sm">Bundle purchases</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <BookOpen className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {bundles.reduce((sum, b) => sum + b.notesCount, 0)}
                  </div>
                </div>
                <h3 className="font-semibold text-white">Total Notes</h3>
                <p className="text-slate-400 text-sm">In all bundles</p>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold text-white">Manage Bundles</h3>
                {selectedBundles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                      {selectedBundles.length} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setEditingBundle(null);
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset Forms
                </button>
                
                <button
                  onClick={() => {
                    setShowCreateForm(!showCreateForm);
                    setShowEditForm(false);
                    setEditingBundle(null);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="h-5 w-5" />
                  {showCreateForm ? 'Cancel' : 'Create New Bundle'}
                </button>
              </div>
            </div>
            
            {/* Bundle Creation/Edit Error */}
            {bundleCreationError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 font-medium">{bundleCreationError}</span>
                </div>
              </div>
            )}
            
            {/* Create Bundle Form */}
            {showCreateForm && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h4 className="text-lg font-semibold text-white mb-6">Create New Bundle</h4>
                <form className="space-y-6" onSubmit={handleCreateBundle}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Bundle Title *</label>
                      <input
                        type="text"
                        value={newBundle.title}
                        onChange={(e) => setNewBundle({...newBundle, title: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Enter bundle title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={newBundle.category}
                        onChange={(e) => setNewBundle({...newBundle, category: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="">Select Category</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      rows={4}
                      value={newBundle.description}
                      onChange={(e) => setNewBundle({...newBundle, description: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      placeholder="Describe what this bundle covers..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Access Type *</label>
                      <select
                        value={newBundle.access}
                        onChange={(e) => setNewBundle({...newBundle, access: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium Only</option>
                        <option value="purchase">One-time Purchase</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={newBundle.price}
                        onChange={(e) => setNewBundle({...newBundle, price: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="0"
                        disabled={newBundle.access === 'free'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Instructor</label>
                      <input
                        type="text"
                        value={newBundle.instructor}
                        onChange={(e) => setNewBundle({...newBundle, instructor: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Instructor name"
                      />
                    </div>
                  </div>
                  
                  {/* Sales Tracking Section */}
                  <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4">
                    <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      Sales & Marketing Settings
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Sales</label>
                        <input
                          type="number"
                          value={newBundle.targetSales || 0}
                          onChange={(e) => setNewBundle({...newBundle, targetSales: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500/50 text-sm"
                          placeholder="100"
                          min="0"
                        />
                        <p className="text-xs text-slate-400 mt-1">Expected number of sales</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Discount (%)</label>
                        <input
                          type="number"
                          value={newBundle.discount || 0}
                          onChange={(e) => setNewBundle({...newBundle, discount: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500/50 text-sm"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-slate-400 mt-1">Promotional discount (0-100%)</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Original Price (₹)</label>
                        <input
                          type="number"
                          value={newBundle.originalPrice || newBundle.price}
                          onChange={(e) => setNewBundle({...newBundle, originalPrice: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500/50 text-sm"
                          placeholder={newBundle.price?.toString() || "0"}
                          min="0"
                          disabled={newBundle.access === 'free'}
                        />
                        <p className="text-xs text-slate-400 mt-1">Price before discount</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Featured Bundle</label>
                          <p className="text-xs text-slate-400">Show in featured section</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newBundle.isFeatured || false}
                            onChange={(e) => setNewBundle({...newBundle, isFeatured: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-slate-300">Popular Badge</label>
                          <p className="text-xs text-slate-400">Show "Popular" badge</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newBundle.isPopular || false}
                            onChange={(e) => setNewBundle({...newBundle, isPopular: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Sales Preview */}
                    {(newBundle.price > 0 || newBundle.originalPrice > 0) && (
                      <div className="mt-4 p-3 bg-slate-600/30 rounded-lg border border-slate-500/30">
                        <h6 className="text-sm font-semibold text-white mb-2">Pricing Preview</h6>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Final Price:</span>
                            <span className="text-xl font-bold text-green-400">₹{newBundle.price || 0}</span>
                          </div>
                          {newBundle.originalPrice > newBundle.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Original:</span>
                              <span className="text-slate-400 line-through">₹{newBundle.originalPrice}</span>
                            </div>
                          )}
                          {newBundle.discount > 0 && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-bold border border-green-400/30">
                              {newBundle.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={newBundle.tags}
                      onChange={(e) => setNewBundle({...newBundle, tags: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  
                  {/* Bundle Notes Section */}
                  <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        Bundle Notes ({newBundle.notes.length})
                      </h5>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddNoteForm(true)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors text-sm border border-blue-400/30"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Note
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBrowseNotesModal(true)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-colors text-sm border border-green-400/30"
                        >
                          <Search className="h-4 w-4" />
                          Browse Existing
                        </button>
                      </div>
                    </div>
                    
                    {/* Add Note Form */}
                    {showAddNoteForm && (
                      <div className="bg-slate-600/30 rounded-lg p-4 mb-4 border border-slate-500/30">
                        <h6 className="text-md font-semibold text-white mb-3">Add New Note</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Note Title *</label>
                            <input
                              type="text"
                              value={newNote.title}
                              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                              placeholder="Enter note title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">File Size</label>
                            <input
                              type="text"
                              value={newNote.size}
                              onChange={(e) => setNewNote({...newNote, size: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                              placeholder="e.g., 2.4 MB"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-300 mb-2">File URL *</label>
                          <input
                            type="url"
                            value={newNote.fileUrl}
                            onChange={(e) => setNewNote({...newNote, fileUrl: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                            placeholder="https://github.com/user/repo/raw/main/file.pdf"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                          <textarea
                            rows={2}
                            value={newNote.description}
                            onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                            placeholder="Brief description of the note content"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddNoteForm(false);
                              setNewNote({ title: '', description: '', size: '', fileUrl: '', type: 'pdf' });
                            }}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddNote}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Notes List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {newBundle.notes.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notes added yet. Click "Add Note" to start.</p>
                        </div>
                      ) : (
                        newBundle.notes.map((note, index) => (
                          <div key={note.id || index} className="flex items-center justify-between bg-slate-600/20 rounded-lg p-3 border border-slate-500/30">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-red-400">PDF</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-white text-sm truncate">{note.title}</h6>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>{note.size || '1.5 MB'}</span>
                                  {note.description && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{note.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveNote(note.id || index.toString())}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                              title="Remove note"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Bundle Videos Section */}
                  <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-400" />
                        Bundle Videos ({newBundle.videos.length})
                      </h5>
                      <button
                        type="button"
                        onClick={() => setShowAddVideoForm(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm border border-red-400/30"
                      >
                        <Video className="h-4 w-4" />
                        Add Video
                      </button>
                    </div>
                    
                    {/* Add Video Form */}
                    {showAddVideoForm && (
                      <div className="bg-slate-600/30 rounded-lg p-4 mb-4 border border-slate-500/30">
                        <h6 className="text-md font-semibold text-white mb-3">Add New Video</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Video Title *</label>
                            <input
                              type="text"
                              value={newVideo.title}
                              onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                              placeholder="Enter video title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                            <input
                              type="text"
                              value={newVideo.duration}
                              onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                              placeholder="e.g., 25:30"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Video URL *</label>
                          <input
                            type="url"
                            value={newVideo.url}
                            onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                          <textarea
                            rows={2}
                            value={newVideo.description}
                            onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                            placeholder="Brief description of the video content"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddVideoForm(false);
                              setNewVideo({ title: '', description: '', duration: '', url: '', type: 'youtube' });
                            }}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddVideo}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Add Video
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Videos List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {newBundle.videos.length === 0 ? (
                        <div className="text-center py-6 text-slate-400">
                          <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No videos added yet. Click "Add Video" to start.</p>
                        </div>
                      ) : (
                        newBundle.videos.map((video, index) => (
                          <div key={video.id || index} className="flex items-center justify-between bg-slate-600/20 rounded-lg p-3 border border-slate-500/30">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Play className="h-4 w-4 text-red-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h6 className="font-medium text-white text-sm truncate">{video.title}</h6>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <span>{video.duration || '15:00'}</span>
                                  {video.description && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate">{video.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(video.id || index.toString())}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                              title="Remove video"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setBundleCreationError('');
                      }}
                      disabled={isCreatingBundle}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingBundle}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      {isCreatingBundle ? (
                        <>
                          <LoadingSpinner size="small" color="text-white" />
                          Creating...
                        </>
                      ) : (
                        'Create Bundle'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Edit Bundle Form */}
            {showEditForm && editingBundle && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h4 className="text-lg font-semibold text-white mb-6">Edit Bundle: {editingBundle.title}</h4>
                <form className="space-y-6" onSubmit={handleUpdateBundle}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Bundle Title *</label>
                      <input
                        type="text"
                        value={newBundle.title}
                        onChange={(e) => setNewBundle({...newBundle, title: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Enter bundle title"
                        disabled={isCreatingBundle}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                      <select
                        value={newBundle.category}
                        onChange={(e) => setNewBundle({...newBundle, category: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        disabled={isCreatingBundle}
                      >
                        <option value="">Select Category</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      rows={4}
                      value={newBundle.description}
                      onChange={(e) => setNewBundle({...newBundle, description: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                      placeholder="Describe what this bundle covers..."
                      disabled={isCreatingBundle}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Access Type *</label>
                      <select
                        value={newBundle.access}
                        onChange={(e) => setNewBundle({...newBundle, access: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        disabled={isCreatingBundle}
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium Only</option>
                        <option value="purchase">One-time Purchase</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={newBundle.price}
                        onChange={(e) => setNewBundle({...newBundle, price: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="0"
                        disabled={newBundle.access === 'free' || isCreatingBundle}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Instructor</label>
                      <input
                        type="text"
                        value={newBundle.instructor}
                        onChange={(e) => setNewBundle({...newBundle, instructor: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="Instructor name"
                        disabled={isCreatingBundle}
                      />
                    </div>
                  </div>
                  
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={newBundle.tags}
                        onChange={(e) => setNewBundle({...newBundle, tags: e.target.value})}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                        placeholder="tag1, tag2, tag3"
                        disabled={isCreatingBundle}
                      />
                    </div>
                    
                    {/* Edit Bundle Notes Section */}
                    <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                          Bundle Notes ({newBundle.notes.length})
                        </h5>
                        <button
                          type="button"
                          onClick={() => setShowAddNoteForm(true)}
                          disabled={isCreatingBundle}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-colors text-sm border border-blue-400/30 disabled:opacity-50"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Note
                        </button>
                      </div>
                      
                      {/* Add Note Form */}
                      {showAddNoteForm && (
                        <div className="bg-slate-600/30 rounded-lg p-4 mb-4 border border-slate-500/30">
                          <h6 className="text-md font-semibold text-white mb-3">Add New Note</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Note Title *</label>
                              <input
                                type="text"
                                value={newNote.title}
                                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                                placeholder="Enter note title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">File Size</label>
                              <input
                                type="text"
                                value={newNote.size}
                                onChange={(e) => setNewNote({...newNote, size: e.target.value})}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                                placeholder="e.g., 2.4 MB"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">File URL *</label>
                            <input
                              type="url"
                              value={newNote.fileUrl}
                              onChange={(e) => setNewNote({...newNote, fileUrl: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                              placeholder="https://github.com/user/repo/raw/main/file.pdf"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                              rows={2}
                              value={newNote.description}
                              onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 text-sm"
                              placeholder="Brief description of the note content"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddNoteForm(false);
                                setNewNote({ title: '', description: '', size: '', fileUrl: '', type: 'pdf' });
                              }}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddNote}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Notes List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {newBundle.notes.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notes added yet. Click "Add Note" to start.</p>
                          </div>
                        ) : (
                          newBundle.notes.map((note, index) => (
                            <div key={note.id || index} className="flex items-center justify-between bg-slate-600/20 rounded-lg p-3 border border-slate-500/30">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-red-400">PDF</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-medium text-white text-sm truncate">{note.title}</h6>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{note.size || '1.5 MB'}</span>
                                    {note.description && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{note.description}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveNote(note.id || index.toString())}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                                title="Remove note"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Edit Bundle Videos Section */}
                    <div className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Video className="h-5 w-5 text-red-400" />
                          Bundle Videos ({newBundle.videos.length})
                        </h5>
                        <button
                          type="button"
                          onClick={() => setShowAddVideoForm(true)}
                          disabled={isCreatingBundle}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm border border-red-400/30 disabled:opacity-50"
                        >
                          <Video className="h-4 w-4" />
                          Add Video
                        </button>
                      </div>
                      
                      {/* Add Video Form */}
                      {showAddVideoForm && (
                        <div className="bg-slate-600/30 rounded-lg p-4 mb-4 border border-slate-500/30">
                          <h6 className="text-md font-semibold text-white mb-3">Add New Video</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Video Title *</label>
                              <input
                                type="text"
                                value={newVideo.title}
                                onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                                placeholder="Enter video title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                              <input
                                type="text"
                                value={newVideo.duration}
                                onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                                placeholder="e.g., 25:30"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Video URL *</label>
                            <input
                              type="url"
                              value={newVideo.url}
                              onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                              rows={2}
                              value={newVideo.description}
                              onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-red-500/50 text-sm"
                              placeholder="Brief description of the video content"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddVideoForm(false);
                                setNewVideo({ title: '', description: '', duration: '', url: '', type: 'youtube' });
                              }}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddVideo}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Add Video
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Videos List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {newBundle.videos.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <Video className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No videos added yet. Click "Add Video" to start.</p>
                          </div>
                        ) : (
                          newBundle.videos.map((video, index) => (
                            <div key={video.id || index} className="flex items-center justify-between bg-slate-600/20 rounded-lg p-3 border border-slate-500/30">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Play className="h-4 w-4 text-red-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h6 className="font-medium text-white text-sm truncate">{video.title}</h6>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{video.duration || '15:00'}</span>
                                    {video.description && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{video.description}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(video.id || index.toString())}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                                title="Remove video"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingBundle(null);
                        setBundleCreationError('');
                      }}
                      disabled={isCreatingBundle}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingBundle}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      {isCreatingBundle ? (
                        <>
                          <LoadingSpinner size="small" color="text-white" />
                          Updating...
                        </>
                      ) : (
                        'Update Bundle'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Existing Bundles Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <h4 className="text-lg font-semibold text-white">Existing Bundles</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedBundles.length === bundles.length && bundles.length > 0}
                            onChange={handleSelectAllBundles}
                            className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                          />
                          Bundle
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {bundles.map((bundle) => (
                      <tr key={bundle.id} className={`hover:bg-slate-700/20 ${selectedBundles.includes(bundle.id) ? 'bg-purple-500/10' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedBundles.includes(bundle.id)}
                              onChange={() => handleSelectBundle(bundle.id)}
                              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{bundle.title}</div>
                              <div className="text-xs text-slate-400">ID: {bundle.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-300">{bundle.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white">{bundle.notesCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">₹{bundle.price}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              bundle.access === 'free' ? 'bg-green-500/20 text-green-300' :
                              bundle.access === 'premium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {bundle.access}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white">{bundle.totalSales}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-green-400">₹{bundle.revenue?.toLocaleString() || '0'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bundle.status === 'published' ? 'bg-green-500/20 text-green-300' :
                            bundle.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {bundle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditBundle(bundle)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Edit Bundle"
                            >
                              <PenTool className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleViewBundle(bundle)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="View Bundle"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleBundleStatus(bundle.id, bundle.status === 'published' ? 'draft' : 'published')}
                              className={`p-2 rounded-lg transition-colors ${
                                bundle.status === 'published'
                                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                                  : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                              }`}
                              title={bundle.status === 'published' ? 'Unpublish Bundle' : 'Publish Bundle'}
                            >
                              {bundle.status === 'published' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button 
                              onClick={() => handleDuplicateBundle(bundle)}
                              className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
                              title="Duplicate Bundle"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBundle(bundle.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete Bundle"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Bundle Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Bundle Performance</h4>
                <div className="space-y-4">
                  {bundles.map((bundle) => (
                    <div key={bundle.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-white">{bundle.title}</div>
                        <div className="text-xs text-slate-400">{bundle.totalSales} sales</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-400">₹{bundle.revenue?.toLocaleString() ?? '0'}</div>
                        <div className="text-xs text-slate-400">revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all">
                    <BarChart3 className="h-5 w-5" />
                    <span>View Detailed Analytics</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-all">
                    <Gift className="h-5 w-5" />
                    <span>Create Promotional Bundle</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all">
                    <Upload className="h-5 w-5" />
                    <span>Bulk Import Notes to Bundle</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
                  </div>
                  
                  <p className="text-slate-300 mb-6">
                    Are you sure you want to delete this bundle? This action cannot be undone and will affect any users who have purchased this bundle.
                  </p>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteBundle}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Delete Bundle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      // Community Rules Page
      case 'community-rules':
        return (
          <div className="space-y-8">
            {/* Community Rules Header */}
            <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-red-200" />
                <h2 className="text-3xl font-bold mb-2">Community Guidelines 📜</h2>
                <p className="text-red-100 text-lg">
                  Rules and guidelines to keep our community safe and welcoming
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                  Do's
                </h3>
                <div className="space-y-4 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Be respectful and kind to all community members</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Share high-quality, relevant educational content</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Help others with their academic questions</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Give proper credit when sharing others' work</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Report inappropriate content to moderators</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <p>Use appropriate titles and descriptions</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <X className="h-6 w-6 text-red-400 mr-3" />
                  Don'ts
                </h3>
                <div className="space-y-4 text-slate-300">
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Post spam, promotional content, or unrelated material</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Share copyrighted material without permission</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Use offensive language or engage in harassment</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Create multiple accounts or impersonate others</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Share personal information or contact details</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-red-400 font-bold">✗</span>
                    <p>Attempt to cheat or help others cheat on exams</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Consequences</h3>
                  <p className="text-yellow-200 leading-relaxed">
                    Violation of these guidelines may result in warnings, temporary suspensions, or permanent bans from the platform. 
                    We believe in giving second chances, but repeated violations will not be tolerated.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Info className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Need Help?</h3>
                  <p className="text-blue-200 leading-relaxed mb-4">
                    If you have questions about these guidelines or need to report an issue, please contact our moderation team. 
                    We're here to help maintain a positive learning environment for everyone.
                  </p>
                  <button 
                    onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                  >
                    Back to Community
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        );
      
      case 'ai-chat':
        return (
          <AIChatComponent 
            messages={messages}
            setMessages={setMessages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isAiLoading={isAiLoading}
            setIsAiLoading={setIsAiLoading}
          />
        );
      
      // AI Knowledge Base Management Page
      case 'ai-knowledge-base':
        const handleKnowledgeSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsUploadingKnowledge(true);
          
          try {
            console.log('Adding knowledge entry:', newKnowledgeEntry);
            
            const response = await fetch('/api/ai-knowledge', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...newKnowledgeEntry,
                createdBy: user?.name || 'Anonymous',
                userEmail: user?.email || ''
              }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              throw new Error(data.error || 'Failed to create knowledge entry');
            }
            
            // Refresh knowledge entries from database
            await loadKnowledgeEntries();
            
            // Reset form
            setNewKnowledgeEntry({
              title: '',
              content: '',
              category: 'general',
              rules: '',
              isActive: true,
              tags: ''
            });
            
            showSuccess('Knowledge entry added successfully! The AI will now use this information to help users.');
            
          } catch (error) {
            console.error('Error adding knowledge entry:', error);
            showError(error instanceof Error ? error.message : 'Failed to add knowledge entry');
          } finally {
            setIsUploadingKnowledge(false);
          }
        };
        
        const handleDeleteEntry = (id: string) => {
          showConfirmation('Are you sure you want to delete this knowledge entry?', async () => {
            try {
              const response = await fetch(`/api/ai-knowledge?id=${id}`, {
                method: 'DELETE',
              });
              
              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Failed to delete knowledge entry');
              }
              
              setAiKnowledgeEntries((prev: any[]) => prev.filter((e: any) => e.id !== id));
              showSuccess('Knowledge entry deleted successfully!');
            } catch (error) {
              console.error('Error deleting knowledge entry:', error);
              showError(error instanceof Error ? error.message : 'Failed to delete knowledge entry');
            }
          });
        };
        
        return (
          <div className="space-y-8">
            {/* AI Knowledge Base Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-purple-200" />
                <h2 className="text-3xl font-bold mb-2">AI Knowledge Base Management 🧠</h2>
                <p className="text-purple-100 text-lg">
                  Manage AI training data, rules, and knowledge entries
                </p>
              </div>
            </div>
            
            {/* Add New Knowledge Entry */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Add Knowledge Entry</h3>
                  <p className="text-slate-400 text-sm">Create new training data for the AI mentor</p>
                </div>
              </div>
              
              <form className="space-y-6" onSubmit={handleKnowledgeSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={newKnowledgeEntry.title}
                      onChange={(e) => setNewKnowledgeEntry({ ...newKnowledgeEntry, title: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter knowledge entry title"
                      disabled={isUploadingKnowledge}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                    <select
                      required
                      value={newKnowledgeEntry.category}
                      onChange={(e) => setNewKnowledgeEntry({ ...newKnowledgeEntry, category: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      disabled={isUploadingKnowledge}
                    >
                      <option value="general">General Knowledge</option>
                      <option value="engineering">Engineering Concepts</option>
                      <option value="diploma">Diploma Studies</option>
                      <option value="career">Career Guidance</option>
                      <option value="platform">JEHUB Platform</option>
                      <option value="academic">Academic Support</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content *</label>
                  <textarea
                    required
                    rows={8}
                    value={newKnowledgeEntry.content}
                    onChange={(e) => setNewKnowledgeEntry({ ...newKnowledgeEntry, content: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter the knowledge content that the AI should learn..."
                    disabled={isUploadingKnowledge}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Response Rules (Optional)</label>
                  <textarea
                    rows={4}
                    value={newKnowledgeEntry.rules}
                    onChange={(e) => setNewKnowledgeEntry({ ...newKnowledgeEntry, rules: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter specific rules for how the AI should respond to this topic..."
                    disabled={isUploadingKnowledge}
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newKnowledgeEntry.isActive}
                    onChange={(e) => setNewKnowledgeEntry({ ...newKnowledgeEntry, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isUploadingKnowledge}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                    Active (AI will use this knowledge)
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={isUploadingKnowledge}
                  className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isUploadingKnowledge
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  }`}
                >
                  {isUploadingKnowledge ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" color="text-white" className="mr-2" />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    'Add Knowledge Entry'
                  )}
                </button>
              </form>
            </div>
            
            {/* Existing Knowledge Entries */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Existing Knowledge Entries</h3>
                <span className="text-sm bg-slate-700/50 text-slate-300 px-2 py-1 rounded-full">
                  Total: {aiKnowledgeEntries.length}
                </span>
              </div>
              
              {aiKnowledgeEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">No Knowledge Entries Yet</h4>
                  <p className="text-slate-400">Add your first AI knowledge entry to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiKnowledgeEntries.map((entry: any) => (
                    <div key={entry.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{entry.title || 'Untitled'}</h4>
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                              {entry.category || 'general'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${entry.isActive ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'}`}>
                              {entry.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mb-3">
                            Added on {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {entry.content}
                          </p>
                          {entry.rules && (
                            <div className="mt-3">
                              <p className="text-xs text-slate-400 mb-1">Rules</p>
                              <p className="text-sm text-slate-300 whitespace-pre-wrap">{entry.rules}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="px-3 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Knowledge Base Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Database className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{aiKnowledgeEntries.length}</div>
                </div>
                <h4 className="font-semibold text-white">Total Entries</h4>
                <p className="text-slate-400 text-sm">Knowledge base size</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{aiKnowledgeEntries.filter((e: any) => e.isActive).length}</div>
                </div>
                <h4 className="font-semibold text-white">Active</h4>
                <p className="text-slate-400 text-sm">Currently used by AI</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Grid3X3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{Array.from(new Set(aiKnowledgeEntries.map((e: any) => e.category))).length}</div>
                </div>
                <h4 className="font-semibold text-white">Categories</h4>
                <p className="text-slate-400 text-sm">Knowledge domains</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">Ready</div>
                </div>
                <h4 className="font-semibold text-white">AI Status</h4>
                <p className="text-slate-400 text-sm">System operational</p>
              </div>
            </div>
          </div>
        );
        
      // AI Settings Page
      case 'ai-settings':
        
        const handleSettingChange = (key: string, value: any) => {
          setAiSettings(prev => ({ ...prev, [key]: value }));
          setSettingsChanged(true);
        };
        
        const handleSaveSettings = async () => {
          setIsUpdating(true);
          try {
            const result = await aiSettingsService.saveSettings(aiSettings);
            if (result.success) {
              setSettingsChanged(false);
              showSuccess('AI settings updated successfully!');
            } else {
              throw new Error(result.error || 'Failed to save settings');
            }
          } catch (error) {
            console.error('Error saving AI settings:', error);
            showError('Failed to update settings. Please try again.');
          } finally {
            setIsUpdating(false);
          }
        };
        
        const handleResetSettings = () => {
          showConfirmation('Are you sure you want to reset all AI settings to default values?', () => {
            const defaultSettings = aiSettingsService.getDefaultSettings();
            setAiSettings(defaultSettings);
            setSettingsChanged(true);
            showSuccess('Settings reset to defaults!');
          });
        };
        
        return (
          <div className="space-y-8">
            {/* AI Settings Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Zap className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
                <h2 className="text-3xl font-bold mb-2">AI Settings ⚡</h2>
                <p className="text-indigo-100 text-lg">
                  Configure AI behavior, parameters, and system settings
                </p>
              </div>
            </div>
            
            {/* Settings Changed Banner */}
            {settingsChanged && (
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-300 font-medium">You have unsaved changes</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSettingsChanged(false);
                        window.location.reload();
                      }}
                      className="text-amber-300 hover:text-amber-200 text-sm font-medium"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      disabled={isUpdating}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">Online</div>
                  </div>
                </div>
                <h3 className="font-semibold text-white">AI Status</h3>
                <p className="text-slate-400 text-sm">System operational</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">247</div>
                  </div>
                </div>
                <h3 className="font-semibold text-white">Conversations</h3>
                <p className="text-slate-400 text-sm">This month</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">1.2s</div>
                  </div>
                </div>
                <h3 className="font-semibold text-white">Avg Response</h3>
                <p className="text-slate-400 text-sm">Time</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">4.8</div>
                  </div>
                </div>
                <h3 className="font-semibold text-white">Satisfaction</h3>
                <p className="text-slate-400 text-sm">User rating</p>
              </div>
            </div>
            
            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Response Parameters */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Brain className="h-6 w-6 mr-3 text-blue-400" />
                  Response Parameters
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Tokens: {aiSettings.maxTokens}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={aiSettings.maxTokens}
                      onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>100</span>
                      <span>2000</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Temperature: {aiSettings.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Top P: {aiSettings.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.topP}
                      onChange={(e) => handleSettingChange('topP', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Response Style</label>
                      <select
                        value={aiSettings.responseStyle}
                        onChange={(e) => handleSettingChange('responseStyle', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="friendly">Friendly</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="academic">Academic</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                      <select
                        value={aiSettings.languagePreference}
                        onChange={(e) => handleSettingChange('languagePreference', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Safety & Moderation */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <ShieldCheck className="h-6 w-6 mr-3 text-green-400" />
                  Safety & Moderation
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Content Filter</label>
                      <p className="text-xs text-slate-400">Filter inappropriate content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiSettings.contentFilter}
                        onChange={(e) => handleSettingChange('contentFilter', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Moderation Level</label>
                    <select
                      value={aiSettings.moderationLevel}
                      onChange={(e) => handleSettingChange('moderationLevel', e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="strict">Strict</option>
                      <option value="medium">Medium</option>
                      <option value="relaxed">Relaxed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Allow Personal Info</label>
                      <p className="text-xs text-slate-400">Allow sharing personal information</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiSettings.allowPersonalInfo}
                        onChange={(e) => handleSettingChange('allowPersonalInfo', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rate Limit/User</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={aiSettings.rateLimitPerUser}
                        onChange={(e) => handleSettingChange('rateLimitPerUser', parseInt(e.target.value))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rate Limit/Hour</label>
                      <input
                        type="number"
                        min="50"
                        max="1000"
                        value={aiSettings.rateLimitPerHour}
                        onChange={(e) => handleSettingChange('rateLimitPerHour', parseInt(e.target.value))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* System Prompt Configuration */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Code className="h-6 w-6 mr-3 text-purple-400" />
                System Prompt Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">System Prompt</label>
                  <textarea
                    rows={6}
                    value={aiSettings.systemPrompt}
                    onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    placeholder="Enter the system prompt that defines AI behavior..."
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    This prompt defines how the AI should behave and respond to users. Be specific about the AI's role, knowledge area, and response style.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Response Time Limit</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={aiSettings.responseTimeLimit}
                        onChange={(e) => handleSettingChange('responseTimeLimit', parseInt(e.target.value))}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <span className="text-slate-400 text-sm">sec</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Conversation Length</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={aiSettings.maxConversationLength}
                      onChange={(e) => handleSettingChange('maxConversationLength', parseInt(e.target.value))}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Enable Caching</label>
                      <p className="text-xs text-slate-400">Cache responses for better performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiSettings.cacheEnabled}
                        onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* API Configuration */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Database className="h-6 w-6 mr-3 text-orange-400" />
                API Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">API Provider</label>
                  <select
                    value={aiSettings.apiProvider}
                    onChange={(e) => handleSettingChange('apiProvider', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="google-gemini">Google Gemini</option>
                    <option value="openai-gpt">OpenAI GPT</option>
                    <option value="anthropic-claude">Anthropic Claude</option>
                    <option value="cohere">Cohere</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">API Key Status</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      aiSettings.apiKeyStatus === 'connected' ? 'bg-green-500' :
                      aiSettings.apiKeyStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      aiSettings.apiKeyStatus === 'connected' ? 'text-green-400' :
                      aiSettings.apiKeyStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {aiSettings.apiKeyStatus === 'connected' ? 'Connected' :
                       aiSettings.apiKeyStatus === 'error' ? 'Error' : 'Pending'}
                    </span>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium ml-4">
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium mb-2">API Key Management</p>
                    <p className="text-blue-200 text-sm leading-relaxed">
                      API keys are securely stored and encrypted. Only administrators can view or modify API keys. 
                      Monitor your API usage and costs in the provider's dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={!settingsChanged || isUpdating}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    !settingsChanged || isUpdating
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </button>
                
                <button
                  onClick={handleResetSettings}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handlePageChange('ai-knowledge-base', 'Knowledge Base')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Manage Knowledge Base
                </button>
                
                <button
                  onClick={() => handlePageChange('ai-training-data', 'Training Data')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        );
        
      // AI Training Data Page
      case 'ai-training-data':
        return (
          <div className="space-y-8">
            {/* AI Training Data Header */}
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">Training Data 📊</h2>
                <p className="text-green-100 text-lg">
                  View and manage AI training data and conversation logs
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Brain className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Training Data Analytics Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This section will include:<br/>
                • Conversation analytics<br/>
                • User interaction patterns<br/>
                • AI response quality metrics<br/>
                • Training data export/import
              </p>
              <button 
                onClick={() => handlePageChange('ai-knowledge-base', 'Knowledge Base')}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Manage Knowledge Base
              </button>
            </div>
          </div>
        );
        
      // Admin Analytics Dashboard
      case 'admin-analytics':
        return (
          <div className="space-y-8">
            {/* Analytics Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                <h2 className="text-3xl font-bold mb-2">Analytics Dashboard 📊</h2>
                <p className="text-blue-100 text-lg">
                  Comprehensive analytics and insights for platform management
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <BarChart3 className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Analytics Dashboard Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This dashboard will feature:<br/>
                • User engagement metrics<br/>
                • Notes download analytics<br/>
                • Platform usage statistics<br/>
                • Performance monitoring
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Admin User Management
      case 'admin-users':
        return (
          <div className="space-y-8">
            {/* User Management Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">User Management 👥</h2>
                <p className="text-green-100 text-lg">
                  Manage users, permissions, and account settings
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Users className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">User Management Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This section will include:<br/>
                • User account management<br/>
                • Role and permission settings<br/>
                • Account verification tools<br/>
                • Bulk user operations
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Admin Content Moderation  
      case 'admin-moderation':
        return (
          <div className="space-y-8">
            {/* Moderation Header */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <FileBarChart className="h-16 w-16 mx-auto mb-4 text-orange-200" />
                <h2 className="text-3xl font-bold mb-2">Content Moderation 🛡️</h2>
                <p className="text-orange-100 text-lg">
                  Monitor and moderate user-generated content
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <FileBarChart className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Content Moderation Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This tool will provide:<br/>
                • Content review queue<br/>
                • Automated flagging system<br/>
                • Report management<br/>
                • Moderation actions log
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Admin System Health Monitor
      case 'admin-system-health':
        return (
          <div className="space-y-8">
            {/* System Health Header */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Activity className="h-16 w-16 mx-auto mb-4 text-green-200" />
                <h2 className="text-3xl font-bold mb-2">System Health Monitor 💊</h2>
                <p className="text-green-100 text-lg">
                  Monitor system performance, uptime, and resource usage
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Activity className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">System Health Monitoring Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This dashboard will monitor:<br/>
                • Server uptime and performance metrics<br/>
                • Database connection status<br/>
                • API response times<br/>
                • Resource usage and alerts
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Admin Server Management
      case 'admin-server':
        return (
          <div className="space-y-8">
            {/* Server Management Header */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Server className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                <h2 className="text-3xl font-bold mb-2">Server Management ⚙️</h2>
                <p className="text-slate-100 text-lg">
                  Manage server configurations, deployments, and maintenance
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Server className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Server Management Panel Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This panel will include:<br/>
                • Server configuration management<br/>
                • Deployment controls<br/>
                • Backup and restore operations<br/>
                • SSL certificate management
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Admin Database Administration
      case 'admin-database':
        return (
          <div className="space-y-8">
            {/* Database Admin Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-indigo-200" />
                <h2 className="text-3xl font-bold mb-2">Database Administration 🗃️</h2>
                <p className="text-indigo-100 text-lg">
                  Manage database operations, backups, and optimization
                </p>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <Database className="h-24 w-24 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Database Admin Panel Coming Soon!</h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                This panel will provide:<br/>
                • Database performance monitoring<br/>
                • Query optimization tools<br/>
                • Backup and restore utilities<br/>
                • Data migration assistance
              </p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
        
      // Bundle Preview Page
      case 'bundle-preview':
        if (!previewBundle) {
          return (
            <div className="text-center py-20">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-16 max-w-2xl mx-auto">
                <AlertTriangle className="h-24 w-24 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Bundle Selected</h3>
                <p className="text-slate-400 mb-8">Please select a bundle to preview from the bundles list.</p>
                <button 
                  onClick={() => handlePageChange('study-bundles', 'Study Bundles')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Bundles
                </button>
              </div>
            </div>
          );
        }

        const getBundleAccessBadge = (access: string, price: number) => {
          if (access === 'free') {
            return <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold">🆓 FREE</span>;
          } else if (access === 'premium') {
            return <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">⭐ PREMIUM</span>;
          } else {
            return <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">₹{price}</span>;
          }
        };


        const handleBundleNoteAction = (note: any, action: 'download' | 'preview') => {
          if (previewBundle.access === 'free') {
            if (action === 'download') {
              // Simulate download for bundle note
              showSuccess(`Downloaded: ${note.title}`);
            } else {
              // Simulate preview for bundle note
              showInfo(`Opening preview for: ${note.title}`);
            }
          } else if (previewBundle.access === 'premium') {
            if (user) {
              showInfo('This bundle requires premium membership to access notes.');
              setTimeout(() => handlePageChange('premium', 'Become Premium User'), 1500);
            } else {
              showError('Please sign in to access premium bundle notes.');
            }
          } else {
            showInfo(`Purchase this bundle for ₹${previewBundle.price} to access all notes.`);
          }
        };

        const handleBundleVideoAction = (video: any) => {
          if (previewBundle.access === 'free') {
            // Open video in modal or new tab
            if (video.url) {
              setCurrentVideo(video);
              setVideoModalOpen(true);
            } else {
              showError('Video URL not available');
            }
          } else if (previewBundle.access === 'premium') {
            if (user) {
              showInfo('This bundle requires premium membership to watch videos.');
              setTimeout(() => handlePageChange('premium', 'Become Premium User'), 1500);
            } else {
              showError('Please sign in to access premium bundle videos.');
            }
          } else {
            showInfo(`Purchase this bundle for ₹${previewBundle.price} to access all videos.`);
          }
        };

        return (
          <div className="space-y-8">
            {/* Bundle Preview Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl overflow-hidden shadow-xl">
              <div className="p-6">
                {/* Back Button + Title Section */}
                <div className="flex items-start gap-4 mb-6">
                  <button
                    onClick={() => {
                      setPreviewBundle(null);
                      handlePageChange('study-bundles', 'Study Bundles');
                    }}
                    className="flex-shrink-0 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    title="Back to Bundles"
                  >
                    <ArrowRight className="h-5 w-5 text-white rotate-180" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-white">
                        {previewBundle.title}
                      </h1>
                      {getBundleAccessBadge(previewBundle.access, previewBundle.price)}
                      {previewBundle.isPopular && (
                        <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-400/30">
                          🔥 POPULAR
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                        <GraduationCap className="h-4 w-4" />
                        <span className="font-semibold">{previewBundle.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                        <Target className="h-4 w-4" />
                        <span className="font-semibold">{previewBundle.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">{previewBundle.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-purple-100 text-lg leading-relaxed mb-6">
                      {previewBundle.description}
                    </p>
                    
                    {/* Bundle Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">{previewBundle.notesCount}</div>
                        <div className="text-purple-100 text-xs sm:text-sm">Notes</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">{previewBundle.videosCount || 0}</div>
                        <div className="text-purple-100 text-xs sm:text-sm">Videos</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl font-bold text-white">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                          {previewBundle.rating}
                        </div>
                        <div className="text-purple-100 text-xs sm:text-sm">Rating</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">{previewBundle.reviews}</div>
                        <div className="text-purple-100 text-xs sm:text-sm">Reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bundle Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - Notes List */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">Bundle Contents</h3>
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold">
                        {previewBundle.notesCount} Notes
                      </span>
                    </div>
                  </div>
                  
                  {/* Generate full notes list based on bundle */}
                  <div className="space-y-4">
                    {/* Sample notes from bundle + generated additional notes */}
                    {[
                      ...previewBundle.notes,
                      // Add more generated notes to reach the notesCount
                      ...(previewBundle.notesCount > previewBundle.notes.length ? 
                        Array.from({ length: previewBundle.notesCount - previewBundle.notes.length }, (_, i) => ({
                          title: `${previewBundle.category} Advanced Topic ${i + 1}`,
                          type: 'pdf',
                          size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
                          description: `Advanced concepts and practical examples for ${previewBundle.category.toLowerCase()}`
                        })) : [])
                    ].map((note, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4 hover:border-slate-500/50 transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-red-400">PDF</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                {note.title}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Download className="h-3 w-3" />
                                  {note.size}
                                </span>
                                {note.description && (
                                  <span className="flex items-center gap-1 truncate">
                                    <Info className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{note.description}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-end ml-4">
                            <button
                              onClick={() => handleBundleNoteAction(note, 'preview')}
                              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all duration-200 text-sm font-medium border border-blue-400/30 min-w-0 whitespace-nowrap"
                              title="Preview note"
                            >
                              <ExternalLink className="h-4 w-4 flex-shrink-0" />
                              <span className="hidden sm:inline">Preview</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Videos Section */}
                    {previewBundle.videos && previewBundle.videos.length > 0 && (
                      <>
                        <div className="pt-8 border-t border-slate-700/50">
                          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                            Videos ({previewBundle.videosCount || previewBundle.videos.length})
                          </h4>
                        </div>
                        
                        {/* Generate full videos list based on bundle */}
                        {[
                          ...previewBundle.videos,
                          // Add more generated videos to reach the videosCount
                          ...((previewBundle.videosCount || 0) > previewBundle.videos.length ? 
                            Array.from({ length: (previewBundle.videosCount || 0) - previewBundle.videos.length }, (_, i) => ({
                              title: `${previewBundle.category} Tutorial ${i + 1}`,
                              type: 'youtube',
                              url: `https://www.youtube.com/watch?v=example${i + previewBundle.videos.length}`,
                              duration: `${Math.floor(Math.random() * 40 + 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                              description: `Step-by-step tutorial for ${previewBundle.category.toLowerCase()} concepts`
                            })) : [])
                        ].map((video, idx) => (
                          <div key={idx} className="bg-slate-700/30 rounded-lg border border-slate-600/30 p-4 hover:border-slate-500/50 transition-all duration-200 group cursor-pointer"
                            onClick={() => handleBundleVideoAction(video)}
                            title={video.title}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Play className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="flex flex-col truncate">
                                  <h4 className="font-semibold text-white truncate transition-colors group-hover:text-purple-400">
                                    {video.title}
                                  </h4>
                                  {video.description && (
                                    <p className="text-sm text-slate-400 truncate max-w-full mt-1">
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-xs bg-red-600/20 text-red-300 px-2 py-1 rounded">
                                  {video.duration || '15:30'}
                                </div>
                                {previewBundle.access === 'free' && (
                                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <Play className="h-4 w-4 text-green-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sidebar - Bundle Info & Actions */}
              <div className="space-y-6">
                {/* Pricing & Actions */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bundle Access</h3>
                  
                  {/* Price Display */}
                  <div className="text-center mb-6">
                    {previewBundle.price > 0 ? (
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-3xl font-bold text-white">₹{previewBundle.price}</span>
                          {previewBundle.originalPrice > previewBundle.price && (
                            <span className="text-lg text-slate-400 line-through">₹{previewBundle.originalPrice}</span>
                          )}
                        </div>
                        {previewBundle.discount > 0 && (
                          <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-400/30 inline-block">
                            {previewBundle.discount}% OFF
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-green-400 mb-2">FREE</div>
                    )}
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => handleBundleAction(previewBundle)}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl mb-4 ${
                      previewBundle.access === 'free' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      previewBundle.access === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white' :
                      'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {previewBundle.access === 'free' ? '🆓 Start Learning Now' :
                     previewBundle.access === 'premium' ? '⭐ Upgrade to Premium' : '💳 Purchase Bundle'}
                  </button>
                  
                  {/* Access Info */}
                  <div className="text-center text-sm text-slate-400">
                    {previewBundle.access === 'free' ? 'Full access to all notes' :
                     previewBundle.access === 'premium' ? 'Requires premium membership' :
                     'One-time purchase, lifetime access'}
                  </div>
                </div>
                
                {/* Instructor Info */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Instructor</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {previewBundle.instructor.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{previewBundle.instructor}</div>
                      <div className="text-sm text-slate-400">Course Instructor</div>
                    </div>
                  </div>
                  
                  {/* Instructor Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <div className="font-bold text-white">4.9</div>
                      <div className="text-slate-400">Rating</div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                      <div className="font-bold text-white">12K+</div>
                      <div className="text-slate-400">Students</div>
                    </div>
                  </div>
                </div>
                
                {/* Bundle Tags */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {(previewBundle.tags as string[]).map((tag: string, index: number) => (
                      <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-400/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* What You'll Learn */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">What You'll Learn</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      `Master ${previewBundle.category.toLowerCase()} fundamentals`,
                      'Practical implementation techniques',
                      'Real-world problem solving',
                      'Industry best practices',
                      'Advanced concepts and applications'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Share Bundle */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Share Bundle</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        const shareText = `Check out this amazing study bundle: ${previewBundle.title}\n\nGet comprehensive notes for ${previewBundle.category} - ${previewBundle.notesCount} notes included!\n\nJoin JEHUB: https://jehub.vercel.app`;
                        navigator.clipboard.writeText(shareText);
                        showSuccess('Bundle link copied!');
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all duration-200 text-sm border border-blue-400/30"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button 
                      onClick={() => {
                        const shareText = `${previewBundle.title} - Study Bundle\n\n${previewBundle.description}\n\n🎓 ${previewBundle.notesCount} comprehensive notes\n⭐ ${previewBundle.rating} rating\n👨‍🏫 By ${previewBundle.instructor}\n\nJoin JEHUB for more: https://jehub.vercel.app`;
                        if (navigator.share) {
                          navigator.share({
                            title: previewBundle.title,
                            text: shareText
                          });
                        } else {
                          navigator.clipboard.writeText(shareText);
                          showSuccess('Bundle info copied!');
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg transition-all duration-200 text-sm border border-green-400/30"
                    >
                      <Share className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      // Note Preview Page (Full Page)
      case 'note-preview':
        if (!previewNote) {
          return (
            <div className="text-center py-20">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-16 max-w-2xl mx-auto">
                <AlertTriangle className="h-24 w-24 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">No Note Selected</h3>
                <p className="text-slate-400 mb-8">Please select a note to preview from the notes list.</p>
                <button 
                  onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Notes
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Preview Header - Mobile Optimized */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-5 lg:p-6">
                {/* Back Button + Title Section */}
                <div className="flex items-start gap-3 mb-4">
                  <button
                    onClick={handleClosePreview}
                    className="flex-shrink-0 p-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 rounded-xl transition-all duration-200 backdrop-blur-sm active:scale-95 shadow-lg"
                    title="Back to Notes"
                  >
                    <ArrowRight className="h-5 w-5 text-white rotate-180" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white break-words mb-2">
                      {previewNote.title}
                    </h1>
                    
                    {/* Enhanced metadata pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white transition-all duration-200 hover:bg-white/25 shadow-sm">
                        <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-semibold truncate max-w-[120px] sm:max-w-none">
                          {previewNote.branch}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white transition-all duration-200 hover:bg-white/25 shadow-sm">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-semibold whitespace-nowrap">{previewNote.semester} Sem</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white transition-all duration-200 hover:bg-white/25 shadow-sm">
                        <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-semibold truncate max-w-[100px] sm:max-w-none">
                          {previewNote.subject}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Mobile First Design */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4">
                  <button
                    onClick={() => handleShare(previewNote)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm rounded-xl transition-all duration-200 text-white font-semibold text-sm touch-manipulation active:scale-95 shadow-lg"
                    title="Share this note"
                  >
                    <Send className="h-4 w-4 flex-shrink-0" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => handleDownload(previewNote.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-xl transition-all duration-200 text-white font-bold text-sm touch-manipulation active:scale-95 shadow-xl hover:shadow-2xl"
                    title="Download this note"
                  >
                    <Download className="h-4 w-4 flex-shrink-0" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleLike(previewNote.id)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm touch-manipulation active:scale-95 shadow-lg ${
                      likedNotes.has(previewNote.id)
                        ? 'bg-red-500/30 hover:bg-red-500/40 active:bg-red-500/50 text-red-200 border border-red-400/30'
                        : 'bg-white/20 hover:bg-white/30 active:bg-white/40 text-white backdrop-blur-sm'
                    }`}
                    title={likedNotes.has(previewNote.id) ? 'Unlike this note' : 'Like this note'}
                  >
                    <Heart className={`h-4 w-4 flex-shrink-0 ${likedNotes.has(previewNote.id) ? 'fill-current' : ''}`} />
                    <span>{likedNotes.has(previewNote.id) ? 'Liked' : 'Like'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Viewer - Enhanced Mobile Design */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
              {/* Enhanced PDF Viewer Header */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-800 dark:to-slate-750 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        PDF Preview
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                      {previewNote.fileName || 'document.pdf'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewNote.fileSize && (
                      <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        {formatFileSize(previewNote.fileSize)}
                      </span>
                    )}
                    <button
                      onClick={() => window.open(previewNote.githubUrl, '_blank')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 active:scale-95 shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Full Screen</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* PDF Viewer Container - Improved mobile design */}
              <div className="relative bg-gray-50 dark:bg-slate-900">
                <div className="h-[400px] xs:h-[450px] sm:h-[550px] md:h-[600px] lg:h-[700px] xl:h-[800px] w-full">
                  <GoogleDocsPDFViewer 
                    fileUrl={previewNote.githubUrl}
                    className="w-full h-full border-none rounded-b-xl"
                  />
                </div>
                
                {/* Enhanced Loading overlay */}
                <div className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none" id="pdf-loading">
                  <div className="text-center bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Loading PDF...</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Please wait</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Note Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Content - Description & Tags */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 sm:p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Description</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed mb-6 text-sm sm:text-base">
                    {previewNote.description || 'No description available for this note.'}
                  </p>
                  
                  {/* Enhanced Tags */}
                  {previewNote.tags && previewNote.tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                        <h4 className="text-base font-semibold text-white">Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {previewNote.tags.slice(0, 8).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 rounded-full text-xs sm:text-sm border border-blue-400/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200"
                          >
                            <span className="text-blue-400">#</span>
                            {tag.trim()}
                          </span>
                        ))}
                        {previewNote.tags.length > 8 && (
                          <span className="inline-flex items-center px-3 py-1.5 bg-slate-600/30 text-slate-300 rounded-full text-xs border border-slate-500/30 backdrop-blur-sm">
                            +{previewNote.tags.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Sidebar Info */}
              <div className="space-y-4 order-1 lg:order-2">
                {/* Enhanced Statistics Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-white">Statistics</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-3">
                    <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-3 border border-blue-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Download className="h-4 w-4 text-blue-400" />
                          </div>
                          <span className="text-slate-200 text-sm font-medium">Downloads</span>
                        </div>
                        <span className="font-bold text-white text-lg">{previewNote.downloads}</span>
                      </div>
                    </div>
                    
                    <div className="bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <Heart className="h-4 w-4 text-red-400" />
                          </div>
                          <span className="text-slate-200 text-sm font-medium">Likes</span>
                        </div>
                        <span className="font-bold text-white text-lg">{previewNote.likes}</span>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-400" />
                          </div>
                          <span className="text-slate-200 text-sm font-medium">Points</span>
                        </div>
                        <span className="font-bold text-white text-lg">{previewNote.points}</span>
                      </div>
                    </div>
                    
                    {previewNote.fileSize && (
                      <div className="bg-green-500/10 backdrop-blur-sm rounded-lg p-3 border border-green-500/20 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Info className="h-4 w-4 text-green-400" />
                            </div>
                            <span className="text-slate-200 text-sm font-medium">Size</span>
                          </div>
                          <span className="font-bold text-white text-lg">{formatFileSize(previewNote.fileSize)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Combined Details & Actions for Mobile */}
                <div className="lg:hidden bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Upload Info - Mobile Compact */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Details</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Author:</span>
                          <span className="text-white font-medium truncate ml-2">{previewNote.uploader}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date:</span>
                          <span className="text-white ml-2">{new Date(previewNote.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Degree:</span>
                          <span className="text-white ml-2">{previewNote.degree}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Type:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            previewNote.noteType === 'free' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {previewNote.noteType === 'free' ? '🆓 FREE' : '⭐ PREMIUM'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Actions - Mobile */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleLike(previewNote.id)}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm touch-manipulation ${
                            likedNotes.has(previewNote.id)
                              ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${likedNotes.has(previewNote.id) ? 'fill-current' : ''}`} />
                          {likedNotes.has(previewNote.id) ? 'Liked' : 'Like'}
                        </button>
                        
                        <button
                          onClick={() => handleShare(previewNote)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 text-sm touch-manipulation"
                        >
                          <Send className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Only - Separate Sections */}
                <div className="hidden lg:block space-y-6">
                  {/* Upload Info */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-400">Uploaded by:</span>
                        <span className="text-white ml-2 font-medium">{previewNote.uploader}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Upload date:</span>
                        <span className="text-white ml-2">{new Date(previewNote.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Degree:</span>
                        <span className="text-white ml-2">{previewNote.degree}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          previewNote.noteType === 'free' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {previewNote.noteType === 'free' ? '🆓 FREE' : '⭐ PREMIUM'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleLike(previewNote.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                          likedNotes.has(previewNote.id)
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedNotes.has(previewNote.id) ? 'fill-current' : ''}`} />
                        {likedNotes.has(previewNote.id) ? 'Liked' : 'Like'}
                      </button>
                      
                      <button
                        onClick={() => handleShare(previewNote)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-300 border border-blue-400/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200"
                      >
                        <Send className="h-4 w-4" />
                        Share Note
                      </button>
                      
                      <button
                        onClick={() => handleDownload(previewNote.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-20">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-16 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">{pageTitle}</h3>
              <p className="text-slate-400 mb-8">This page is under development.</p>
              <button 
                onClick={() => handlePageChange('notes-download', 'Engineering Notes')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Notes
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Top Header - KnowledgeGate Style */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo and Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-300"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <Link href="/" className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/images/whitelogo.svg" 
                    alt="JEHub Logo" 
                    className="h-8 w-auto"
                  />
                </div>
              </Link>
            </div>

            {/* Center - Stats Bar */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">D</span>
                </div>
                <span className="text-purple-400 font-semibold">{notes.length}</span>
                <span className="text-gray-600 dark:text-slate-400 transition-colors duration-300">Notes Available</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">L</span>
                </div>
                <span className="text-green-400 font-semibold">{likedNotes.size}</span>
                <span className="text-gray-600 dark:text-slate-400 transition-colors duration-300">Liked Notes</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">U</span>
                </div>
                <span className="text-blue-400 font-semibold">{user ? '1' : '0'}</span>
                <span className="text-gray-600 dark:text-slate-400 transition-colors duration-300">Active Users</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">E</span>
                </div>
                <span className="text-orange-400 font-semibold">{branches.length}</span>
                <span className="text-gray-600 dark:text-slate-400 transition-colors duration-300">Engineering Branches</span>
              </div>
            </div>

            {/* Right Side - User Profile */}
            <div className="flex items-center space-x-4">
              
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* Points Display */}
                  <div className="hidden sm:flex items-center space-x-2 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">
                      {pointsLoading ? '...' : userPoints.availablePoints}
                    </span>
                  </div>
                  
                  {/* User Avatar with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-gray-900 dark:text-white transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg"
                      data-user-menu-button
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium">
                        {user.name || 'Student'}
                      </span>
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50" data-user-menu>
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Student'}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                          </div>
                          <div className="py-1">
                            <button 
                              onClick={() => {
                                handlePageChange('dashboard', 'Dashboard');
                                setUserMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <User className="h-4 w-4 mr-3" />
                              Dashboard
                            </button>
                            <button 
                              onClick={() => {
                                handlePageChange('wishlist', 'My Wishlist');
                                setUserMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Heart className="h-4 w-4 mr-3" />
                              My Wishlist
                            </button>
                            <button 
                              onClick={() => {
                                handlePageChange('notes-upload', 'Upload Notes');
                                setUserMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Upload className="h-4 w-4 mr-3" />
                              Upload Notes
                            </button>
                            <div className="border-t border-gray-200 dark:border-slate-700 my-1"></div>
                            <button 
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                                showSuccess('Successfully logged out!');
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <ArrowRight className="h-4 w-4 mr-3 transform rotate-180" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-screen relative">
        {/* Sidebar - Basic Navigation */}
        <nav className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Navigation</h2>
            <div className="space-y-2">
              <button
                onClick={() => {
                  handlePageChange('notes-download', 'Engineering Notes');
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'notes-download' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📚 Engineering Notes
              </button>
              <button
                onClick={() => {
                  handlePageChange('notes-upload', 'Upload Notes');
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'notes-upload' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📤 Upload Notes
              </button>
              <button
                onClick={() => {
                  handlePageChange('dashboard', 'Dashboard');
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => {
                  handlePageChange('study-bundles', 'Study Bundles');
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'study-bundles' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                📦 Study Bundles
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{pageTitle}</h1>
                  <p className="text-gray-600 dark:text-slate-400 transition-colors duration-300">
                    {currentPage === 'notes-download' ? 'Download notes for your engineering studies' :
                     currentPage === 'notes-upload' ? 'Share your knowledge with the community' :
                     `Access ${pageTitle.toLowerCase()} and manage your account`}
                  </p>
                </div>
                {currentPage === 'notes-download' && (
                  <div className="mt-4 sm:mt-0">
                    <button 
                      onClick={() => handlePageChange('notes-upload', 'Upload Notes')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                    >
                      Upload Notes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Page Content */}
            {renderPageContent()}
          </div>
        </main>
      </div>


      {/* Browse Existing Notes Modal */}
      {showBrowseNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 transform animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Browse Existing Notes</h3>
              <button
                onClick={() => {
                  setShowBrowseNotesModal(false);
                  setSelectedNotesForBundle([]);
                  setBrowseNotesSearch('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={browseNotesSearch}
                onChange={(e) => setBrowseNotesSearch(e.target.value)}
                placeholder="Search notes by title, subject, or description"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Content */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-0 overflow-hidden">
              {browseNotesLoading ? (
                <div className="p-8 text-center">
                  <LoadingSpinner />
                  <p className="mt-2 text-slate-300">Loading notes...</p>
                </div>
              ) : browseNotesError ? (
                <div className="p-6 text-center text-red-400">{browseNotesError}</div>
              ) : (
                <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-700/50">
                  {browseNotesData
                    .filter(n => {
                      const q = browseNotesSearch.toLowerCase();
                      if (!q) return true;
                      return (
                        n.title.toLowerCase().includes(q) ||
                        n.subject.toLowerCase().includes(q) ||
                        n.description.toLowerCase().includes(q)
                      );
                    })
                    .map(n => (
                      <label key={n.id} className="flex items-start gap-3 p-3 hover:bg-slate-700/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNotesForBundle.includes(n.id)}
                          onChange={(e) => {
                            setSelectedNotesForBundle(prev => (
                              e.target.checked ? [...prev, n.id] : prev.filter(id => id !== n.id)
                            ));
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-white font-medium truncate">{n.title}</h4>
                            <span className="text-xs text-slate-400 shrink-0">{n.semester} • {n.branch}</span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2">{n.description}</p>
                          <div className="mt-1 text-xs text-slate-400 flex items-center gap-3">
                            <span>Subject: {n.subject}</span>
                            <span>Points: {n.points || 0}</span>
                            <span>Downloads: {n.downloads}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  {browseNotesData.length === 0 && (
                    <div className="p-6 text-center text-slate-300">No notes available.</div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-300">
                Selected: <span className="font-semibold">{selectedNotesForBundle.length}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBrowseNotesModal(false);
                    setSelectedNotesForBundle([]);
                    setBrowseNotesSearch('');
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedNotesForBundle.length === 0) {
                      showWarning('Please select at least one note.');
                      return;
                    }
                    // Map selected notes into bundle note objects
                    const selected = browseNotesData.filter(n => selectedNotesForBundle.includes(n.id));
                    const mapped = selected.map(n => ({
                      id: n.id,
                      title: n.title,
                      description: n.description,
                      size: n.fileSize ? formatFileSize(n.fileSize) : 'Unknown',
                      fileUrl: convertToDownloadUrl(n.githubUrl),
                      type: 'pdf' as const
                    }));

                    setNewBundle(prev => {
                      // Avoid duplicates based on id
                      const existingIds = new Set((prev.notes as any[]).map((x: any) => x.id));
                      const deduped = mapped.filter(m => !existingIds.has(m.id));
                      return {
                        ...prev,
                        notes: [...prev.notes, ...deduped]
                      } as any;
                    });

                    showSuccess(`${selectedNotesForBundle.length} note(s) added to bundle!`);
                    setShowBrowseNotesModal(false);
                    setSelectedNotesForBundle([]);
                    setBrowseNotesSearch('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Download Popup */}
      {downloadPopup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {downloadPopup.status === 'downloading' ? 'Downloading...' :
                  downloadPopup.status === 'success' ? 'Download Complete!' : 'Download Failed'}
              </h3>
              <button
                onClick={closePopup}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center mb-4">
              {downloadPopup.status === 'downloading' && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              )}
              {downloadPopup.status === 'success' && (
                <CheckCircle className="h-8 w-8 text-green-500 mr-3 animate-bounce" />
              )}
              {downloadPopup.status === 'error' && (
                <X className="h-8 w-8 text-red-500 mr-3" />
              )}
              <div>
                <p className="text-sm text-slate-300 mb-1">
                  {downloadPopup.status === 'downloading' ? 'Preparing your download...' :
                    downloadPopup.status === 'success' ? 'Your file is ready!' :
                      'Something went wrong. Please try again.'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {downloadPopup.noteTitle}
                </p>
              </div>
            </div>

            {downloadPopup.status === 'downloading' && (
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
              </div>
            )}

            {downloadPopup.status === 'success' && (
              <div className="flex justify-end">
                <button
                  onClick={closePopup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 transform animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{currentVideo.title}</h3>
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  setCurrentVideo(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Video Content */}
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              {currentVideo.url.includes('youtube.com') || currentVideo.url.includes('youtu.be') ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={currentVideo.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={currentVideo.title}
                    className="w-full h-64 sm:h-80 md:h-96 rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
              ) : (
                <div className="text-center p-8">
                  <Play className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-4">Click to open video in new tab</p>
                  <button
                    onClick={() => window.open(currentVideo.url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Open Video
                  </button>
                </div>
              )}
            </div>
            
            {/* Video Description */}
            {currentVideo.description && (
              <div className="text-slate-300 text-sm mb-4">
                <p>{currentVideo.description}</p>
              </div>
            )}
            
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  setCurrentVideo(null);
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
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
