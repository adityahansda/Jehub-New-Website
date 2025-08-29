import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Coins,
  GraduationCap,
  Bell,
  BookOpen,
  Download,
  Users,
  Home,
  Upload
} from 'lucide-react';
import Home2Sidebar from './Home2Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Define PageType interface
interface PageType {
  id: string;
  title: string;
  component: React.ComponentType;
}

// Define the type for valid page IDs
type ValidPageId = 
  | 'dashboard'
  | 'notes-download'
  | 'notes-upload'
  | 'ai-chat'
  | 'counselling-updates'
  | 'exam-updates'
  | 'notifications'
  | 'events'
  | 'groups'
  | 'blog'
  | 'team'
  | 'join-team'
  | 'internships'
  | 'community-rules'
  | 'notes-request'
  | 'leaderboard'
  | 'notes-upload'
  | 'wishlist'
  | 'study-bundles'
  | 'referral'
  | 'courses'
  | 'notes-status-check'
  | 'notes-category';

// Sample components for different pages
const DashboardHome = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
    <p className="text-gray-600 dark:text-gray-400">Welcome to your dashboard</p>
  </div>
);

const NotesDownload = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Download Notes</h1>
    <p className="text-gray-600 dark:text-gray-400">Download study materials</p>
  </div>
);

const NotesUpload = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload Notes</h1>
    <p className="text-gray-600 dark:text-gray-400">Upload your study materials</p>
  </div>
);

const AIChat = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">AI Chat</h1>
    <p className="text-gray-600 dark:text-gray-400">Chat with AI assistant</p>
  </div>
);

const CounsellingUpdates = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Counselling Updates</h1>
    <p className="text-gray-600 dark:text-gray-400">Latest counselling information</p>
  </div>
);

const ExamUpdates = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Exam Updates</h1>
    <p className="text-gray-600 dark:text-gray-400">Latest exam information</p>
  </div>
);

const Notifications = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h1>
    <p className="text-gray-600 dark:text-gray-400">Your notifications</p>
  </div>
);

const Events = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Events</h1>
    <p className="text-gray-600 dark:text-gray-400">Upcoming events</p>
  </div>
);

const Groups = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Groups</h1>
    <p className="text-gray-600 dark:text-gray-400">Study groups</p>
  </div>
);

const Blog = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Blog</h1>
    <p className="text-gray-600 dark:text-gray-400">Read our blog</p>
  </div>
);

const Team = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Team</h1>
    <p className="text-gray-600 dark:text-gray-400">Meet our team</p>
  </div>
);

const JoinTeam = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Join Team</h1>
    <p className="text-gray-600 dark:text-gray-400">Join our team</p>
  </div>
);

const Internships = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Internships</h1>
    <p className="text-gray-600 dark:text-gray-400">Available internships</p>
  </div>
);

const CommunityRules = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community Rules</h1>
    <p className="text-gray-600 dark:text-gray-400">Community guidelines</p>
  </div>
);

const NotesRequest = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notes Request</h1>
    <p className="text-gray-600 dark:text-gray-400">Request specific notes</p>
  </div>
);

const Leaderboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h1>
    <p className="text-gray-600 dark:text-gray-400">Top contributors</p>
  </div>
);

const Wishlist = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Wishlist</h1>
    <p className="text-gray-600 dark:text-gray-400">Your wishlist</p>
  </div>
);

const StudyBundles = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Study Bundles</h1>
    <p className="text-gray-600 dark:text-gray-400">Study material bundles</p>
  </div>
);

const Referral = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Referral</h1>
    <p className="text-gray-600 dark:text-gray-400">Refer friends and earn</p>
  </div>
);

const Courses = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Courses</h1>
    <p className="text-gray-600 dark:text-gray-400">Available courses</p>
  </div>
);

const NotesStatusCheck = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notes Status Check</h1>
    <p className="text-gray-600 dark:text-gray-400">Check status of your notes</p>
  </div>
);

const NotesCategory = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Notes Category</h1>
    <p className="text-gray-600 dark:text-gray-400">Browse notes by category</p>
  </div>
);

const Home2 = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // State management - using ValidPageId type instead of PageType for currentPage
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState<ValidPageId>('notes-download'); // Fixed: Changed from PageType to ValidPageId
  const [searchTerm, setSearchTerm] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(true);

  // Available pages mapping
  const pages: Record<ValidPageId, PageType> = {
    // Main Dashboard
    dashboard: { id: 'dashboard', title: 'Dashboard', component: DashboardHome },
    
    // Learning Section
    courses: { id: 'courses', title: 'My Courses', component: Courses },
    'notes-download': { id: 'notes-download', title: 'Download Notes', component: NotesDownload },
    'notes-upload': { id: 'notes-upload', title: 'Upload Notes', component: NotesUpload },
    'notes-category': { id: 'notes-category', title: 'Notes Category', component: NotesCategory },
    wishlist: { id: 'wishlist', title: 'My Wishlist', component: Wishlist },
    referral: { id: 'referral', title: 'Refer & Earn', component: Referral },
    'study-bundles': { id: 'study-bundles', title: 'Study Bundles', component: StudyBundles },

    // Study Tools Section
    leaderboard: { id: 'leaderboard', title: 'Leaderboard', component: Leaderboard },
    'notes-request': { id: 'notes-request', title: 'Notes Request', component: NotesRequest },
    'notes-status-check': { id: 'notes-status-check', title: 'Notes Status Check', component: NotesStatusCheck },
    'exam-updates': { id: 'exam-updates', title: 'Exam Updates', component: ExamUpdates },
    'counselling-updates': { id: 'counselling-updates', title: 'Counselling Updates', component: CounsellingUpdates },
    notifications: { id: 'notifications', title: 'Notifications', component: Notifications },

    // Community Section
    groups: { id: 'groups', title: 'Study Groups', component: Groups },
    events: { id: 'events', title: 'Events', component: Events },
    blog: { id: 'blog', title: 'Blog', component: Blog },
    team: { id: 'team', title: 'Team', component: Team },
    'join-team': { id: 'join-team', title: 'Join Team', component: JoinTeam },
    internships: { id: 'internships', title: 'Internships', component: Internships },
    'community-rules': { id: 'community-rules', title: 'Community Rules', component: CommunityRules },

    // AI Assistant Section
    'ai-chat': { id: 'ai-chat', title: 'AI Chat Assistant', component: AIChat }
  };

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle page change with proper type safety
  const handlePageChange = (pageId: string) => {
    // Fixed: Type-safe page changing
    if (pageId in pages) {
      setCurrentPage(pageId as ValidPageId);
    }
  };

  // Render the current page content
  const renderCurrentPage = () => {
    const currentPageData = pages[currentPage];
    if (!currentPageData) {
      return <DashboardHome />;
    }
    
    const CurrentComponent = currentPageData.component;
    return <CurrentComponent />;
  };

  // Component content rendering logic with fixed comparisons
  const renderPageContent = () => {
    // Fixed: Removed problematic comparisons - each page should render its own content
    // Instead of comparing currentPage with different string literals (which caused the type errors),
    // we now use the pages mapping to render the appropriate component
    
    // The original error was caused by comparisons like:
    // if (currentPage === 'notes-download' && someOtherValue === 'ai-chat') { ... }
    // This creates impossible conditions that TypeScript correctly flags
    
    // These have been replaced with proper component rendering:
    return renderCurrentPage();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">JEHub</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>

              {user && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'J'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen`}>
          <Home2Sidebar
            currentPage={currentPage}
            onPageChange={handlePageChange}
            className="h-full"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1">
            {renderPageContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home2;
