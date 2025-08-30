import React from 'react';
import { 
  X,
  Home,
  Download,
  Upload,
  Grid3X3,
  Send,
  CheckCircle,
  Heart,
  Trophy,
  BookOpen,
  Calendar,
  Users,
  Bell,
  MessageCircle,
  Rss,
  UserPlus,
  Briefcase,
  Crown,
  Brain,
  Settings,
  ShieldCheck,
  BarChart3,
  Database,
  Server,
  Activity,
  User,
  FileBarChart
} from 'lucide-react';

interface CourseFilter {
  label: string;
  count: number;
  value: string;
}

interface SelectedFilters {
  branch: string;
  semester: string;
  subject: string;
  degree: string;
  noteType: string;
}

interface KnowledgeGateSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  likedNotesCount: number;
  courseFilters: CourseFilter[];
  selectedFilters: SelectedFilters;
  setSelectedFilters: React.Dispatch<React.SetStateAction<SelectedFilters>>;
  semesters: string[];
  degrees: string[];
  onPageChange: (pageId: string, title: string) => void;
}

const KnowledgeGateSidebar: React.FC<KnowledgeGateSidebarProps> = ({
  isOpen,
  onClose,
  activePage,
  likedNotesCount,
  courseFilters,
  selectedFilters,
  setSelectedFilters,
  semesters,
  degrees,
  onPageChange
}) => {

  const handlePageChangeAndClose = (pageId: string, title: string) => {
    onPageChange(pageId, title);
    onClose();
  };

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Your learning overview' },
    { id: 'notes-download', label: 'Browse Notes', icon: Download, description: 'Find and download notes' },
    { id: 'notes-upload', label: 'Upload Notes', icon: Upload, description: 'Share your knowledge' },
    { id: 'notes-category', label: 'Categories', icon: Grid3X3, description: 'Browse by subject' },
    { id: 'study-bundles', label: 'Study Bundles', icon: BookOpen, description: 'Curated note collections' },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart, description: `${likedNotesCount} liked notes` },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Top contributors' },
  ];

  const communityItems = [
    { id: 'groups', label: 'WhatsApp Groups', icon: Users, description: 'Join study groups' },
    { id: 'events', label: 'Events', icon: Calendar, description: 'Community events' },
    { id: 'blog', label: 'Blog', icon: Rss, description: 'Articles and tutorials' },
    { id: 'team', label: 'Our Team', icon: Users, description: 'Meet our contributors' },
  ];

  const platformItems = [
    { id: 'exam-updates', label: 'Exam Updates', icon: Calendar, description: 'Important exam info' },
    { id: 'counselling-updates', label: 'Counselling', icon: Bell, description: 'Admission updates' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Recent announcements' },
    { id: 'community-rules', label: 'Community Rules', icon: ShieldCheck, description: 'Platform guidelines' },
  ];

  const careerItems = [
    { id: 'internships', label: 'Internships', icon: Briefcase, description: 'Career opportunities' },
    { id: 'join-team', label: 'Join Team', icon: UserPlus, description: 'Work with us' },
    { id: 'premium', label: 'Go Premium', icon: Crown, description: 'Unlock premium features' },
    { id: 'referral', label: 'Refer & Earn', icon: Send, description: 'Earn points by referring' },
  ];

  const aiItems = [
    { id: 'ai-chat', label: 'AI Chat', icon: Brain, description: 'Get instant help' },
    { id: 'ai-knowledge-base', label: 'Knowledge Base', icon: Database, description: 'AI training data' },
    { id: 'ai-settings', label: 'AI Settings', icon: Settings, description: 'Configure AI behavior' },
  ];

  const adminItems = [
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3, description: 'Platform insights' },
    { id: 'admin-users', label: 'User Management', icon: User, description: 'Manage users' },
    { id: 'admin-moderation', label: 'Content Moderation', icon: FileBarChart, description: 'Review content' },
    { id: 'admin-bundle-management', label: 'Bundle Management', icon: Grid3X3, description: 'Manage study bundles' },
    { id: 'admin-system-health', label: 'System Health', icon: Activity, description: 'Monitor system' },
    { id: 'admin-server', label: 'Server Management', icon: Server, description: 'Server controls' },
    { id: 'admin-database', label: 'Database Admin', icon: Database, description: 'Database operations' },
  ];

  const renderNavSection = (title: string, items: any[]) => (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handlePageChangeAndClose(item.id, item.label)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                isActive 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300'
              }`} />
              <div className="flex-1 text-left">
                <div className="truncate">{item.label}</div>
                {item.description && (
                  <div className={`text-xs mt-0.5 truncate ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isOpen 
            ? 'bg-black/50 backdrop-blur-sm' 
            : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">JEHUB</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Knowledge Hub</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            {renderNavSection('Main', mainNavItems)}
            {renderNavSection('Community', communityItems)}
            {renderNavSection('Platform', platformItems)}
            {renderNavSection('Career', careerItems)}
            {renderNavSection('AI Tools', aiItems)}
            {renderNavSection('Admin', adminItems)}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-center text-xs text-gray-500 dark:text-slate-400">
              <p>&copy; 2024 JEHUB</p>
              <p>Engineering Knowledge Hub</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default KnowledgeGateSidebar;
