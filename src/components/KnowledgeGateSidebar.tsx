import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  Heart, 
  Download, 
  Upload, 
  Users, 
  HelpCircle,
  User,
  Share2,
  Settings,
  ShoppingCart,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight,
  Star,
  Calendar,
  Trophy,
  MessageCircle,
  Briefcase,
  Eye,
  GraduationCap,
  Award,
  Target,
  Bell,
  Shield,
  Rss,
  UserCheck,
  Clock,
  BookMarked,
  LogIn,
  Scroll,
  UserPlus,
  ShieldCheck,
  Grid3X3,
  Send,
  CheckCircle,
  Database,
  Brain,
  Zap,
  BarChart3,
  UserCog,
  FileBarChart,
  Activity,
  Cog,
  Lock,
  AlertTriangle,
  Monitor,
  Server,
  HardDrive,
  Cpu,
  Globe,
  Mail,
  Key,
  Trash2,
  Edit3,
  Plus,
  Minus,
  RefreshCw,
  Download as DownloadIcon,
  Gift,
  Share,
  Crown,
  CreditCard,
  Coins
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activePage?: string;
  likedNotesCount?: number;
  courseFilters?: Array<{label: string, count: number, value: string}>;
  selectedFilters?: any;
  setSelectedFilters?: (filters: any) => void;
  semesters?: string[];
  degrees?: string[];
  className?: string;
  onPageChange?: (pageId: string, pageTitle: string) => void;
}

interface SidebarSection {
  title: string;
  icon: React.ElementType;
  items: SidebarItem[];
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  pageId?: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const KnowledgeGateSidebar: React.FC<SidebarProps> = ({ 
  isOpen = false,
  onClose,
  activePage = 'notes-download',
  likedNotesCount = 0,
  courseFilters = [],
  selectedFilters = {},
  setSelectedFilters,
  semesters = [],
  degrees = [],
  className = '',
  onPageChange
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const currentPath = (router?.pathname || '').toLowerCase();
  const normalize = (s?: string) => (s || '').toLowerCase();
  const isActivePath = (href?: string) => normalize(href) === currentPath;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    learning: true,
    study: false,
    community: false,
    premium: false,
    aimanagement: false,
    admincontrol: false,
    account: false
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarSections: SidebarSection[] = [
    // Dashboard Section (always visible)
    {
      title: 'Dashboard',
      icon: Home,
      items: [
        { 
          icon: Home, 
          label: 'Dashboard', 
          pageId: 'dashboard',
          isActive: activePage === 'dashboard'
        }
      ],
      isCollapsible: false
    },
    
    // Learning Section
    {
      title: 'LEARNING',
      icon: BookOpen,
      isCollapsible: true,
      defaultOpen: true,
      items: [
        { 
          icon: BookOpen, 
          label: 'My Courses', 
          pageId: 'courses',
          count: 0,
          isActive: activePage === 'courses'
        },
        { 
          icon: Download, 
          label: 'Notes Download', 
          pageId: 'notes-download',
          isActive: activePage === 'notes-download'
        },
        { 
          icon: Upload, 
          label: 'Upload Notes', 
          pageId: 'notes-upload',
          isActive: activePage === 'notes-upload'
        },
        { 
          icon: Grid3X3, 
          label: 'Notes Category', 
          pageId: 'notes-category',
          isActive: activePage === 'notes-category'
        },
        { 
          icon: Heart, 
          label: 'Wishlist', 
          pageId: 'wishlist',
          count: likedNotesCount,
          isActive: activePage === 'wishlist'
        },
        { 
          icon: Gift, 
          label: 'Refer & Earn', 
          pageId: 'referral',
          badge: '+50pts',
          badgeColor: 'green',
          isActive: activePage === 'referral'
        },
        { 
          icon: ShoppingCart, 
          label: 'Study Bundles', 
          pageId: 'study-bundles',
          badge: 'New',
          badgeColor: 'purple',
          isActive: activePage === 'study-bundles'
        }
      ]
    },
    
    // Study Tools Section
    {
      title: 'STUDY TOOLS',
      icon: Trophy,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        { 
          icon: Trophy, 
          label: 'Leaderboard', 
          pageId: 'leaderboard',
          isActive: activePage === 'leaderboard'
        },
        { 
          icon: Send, 
          label: 'Notes Request', 
          pageId: 'notes-request',
          isActive: activePage === 'notes-request'
        },
        { 
          icon: CheckCircle, 
          label: 'Notes Status Check', 
          pageId: 'notes-status-check',
          isActive: activePage === 'notes-status-check'
        },
        { 
          icon: Calendar, 
          label: 'Exam Updates', 
          pageId: 'exam-updates',
          isActive: activePage === 'exam-updates'
        },
        { 
          icon: BookOpen, 
          label: 'Counselling Updates', 
          pageId: 'counselling-updates',
          isActive: activePage === 'counselling-updates'
        },
        { 
          icon: Bell, 
          label: 'Notifications', 
          pageId: 'notifications',
          isActive: activePage === 'notifications'
        },
      ]
    },
    
    // Premium Section
    {
      title: 'PREMIUM',
      icon: Crown,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        { 
          icon: Crown, 
          label: 'Become Premium User', 
          pageId: 'premium',
          badge: 'Upgrade',
          badgeColor: 'purple',
          isActive: activePage === 'premium'
        }
      ]
    },
    
    // Community Section
    {
      title: 'COMMUNITY',
      icon: Users,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        { 
          icon: Users, 
          label: 'Groups', 
          pageId: 'groups',
          isActive: activePage === 'groups'
        },
        { 
          icon: MessageCircle, 
          label: 'Events', 
          pageId: 'events',
          isActive: activePage === 'events'
        },
        { 
          icon: Rss, 
          label: 'Blog', 
          pageId: 'blog',
          isActive: activePage === 'blog'
        },
        { 
          icon: Users, 
          label: 'Team', 
          pageId: 'team',
          isActive: activePage === 'team'
        },
        { 
          icon: Briefcase, 
          label: 'Join Team', 
          pageId: 'join-team',
          badge: 'Hiring',
          badgeColor: 'green',
          isActive: activePage === 'join-team'
        },
        { 
          icon: Briefcase, 
          label: 'Internships', 
          pageId: 'internships',
          isActive: activePage === 'internships'
        },
        { 
          icon: ShieldCheck, 
          label: 'Community Rules', 
          pageId: 'community-rules',
          isActive: activePage === 'community-rules'
        }
      ]
    },
    
    // AI Assistant Section
    {
      title: 'AI ASSISTANT',
      icon: Brain,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        { 
          icon: MessageCircle, 
          label: 'AI Chat Assistant', 
          pageId: 'ai-chat',
          isActive: activePage === 'ai-chat'
        }
      ]
    },
    
    // Admin Control Section (only for admins)
    {
      title: 'ADMIN CONTROL',
      icon: Shield,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        {
          icon: BarChart3,
          label: 'Analytics Dashboard',
          pageId: 'admin-analytics',
          badge: 'Admin',
          badgeColor: 'red',
          isActive: activePage === 'admin-analytics'
        },
        {
          icon: Users,
          label: 'User Management',
          pageId: 'admin-users',
          isActive: activePage === 'admin-users'
        },
        {
          icon: FileBarChart,
          label: 'Content Moderation',
          pageId: 'admin-moderation',
          isActive: activePage === 'admin-moderation'
        },
        {
          icon: Database,
          label: 'AI Knowledge Base',
          pageId: 'ai-knowledge-base',
          isActive: activePage === 'ai-knowledge-base'
        },
        {
          icon: Zap,
          label: 'AI Settings',
          pageId: 'ai-settings',
          isActive: activePage === 'ai-settings'
        },
        {
          icon: Brain,
          label: 'AI Training Data',
          pageId: 'ai-training-data',
          isActive: activePage === 'ai-training-data'
        },
        {
          icon: Activity,
          label: 'System Health',
          pageId: 'admin-system-health',
          isActive: activePage === 'admin-system-health'
        },
        {
          icon: Server,
          label: 'Server Management',
          pageId: 'admin-server',
          isActive: activePage === 'admin-server'
        },
        {
          icon: HardDrive,
          label: 'Database Admin',
          pageId: 'admin-database',
          isActive: activePage === 'admin-database'
        },
        {
          icon: Bell,
          label: 'Notification Center',
          pageId: 'admin-notifications',
          isActive: activePage === 'admin-notifications'
        },
        {
          icon: Mail,
          label: 'Email Management',
          pageId: 'admin-email',
          isActive: activePage === 'admin-email'
        },
        {
          icon: Lock,
          label: 'Security Settings',
          pageId: 'admin-security',
          isActive: activePage === 'admin-security'
        },
        {
          icon: Cog,
          label: 'System Settings',
          pageId: 'admin-settings',
          isActive: activePage === 'admin-settings'
        },
        {
          icon: FileText,
          label: 'Audit Logs',
          pageId: 'admin-audit-logs',
          isActive: activePage === 'admin-audit-logs'
        },
        {
          icon: AlertTriangle,
          label: 'Error Monitoring',
          pageId: 'admin-errors',
          isActive: activePage === 'admin-errors'
        },
        {
          icon: Globe,
          label: 'API Management',
          pageId: 'admin-api',
          isActive: activePage === 'admin-api'
        },
        {
          icon: ShoppingCart,
          label: 'Bundle Management',
          pageId: 'admin-bundle-management',
          badge: 'New',
          badgeColor: 'orange',
          isActive: activePage === 'admin-bundle-management'
        }
      ]
    },
    
    // Account Section
    {
      title: 'ACCOUNT',
      icon: User,
      isCollapsible: true,
      defaultOpen: false,
      items: [
        { 
          icon: User, 
          label: 'Profile', 
          href: '/profile',
          isActive: activePage === 'profile' || isActivePath('/profile')
        },
        { 
          icon: Settings, 
          label: 'Avatar Customizer', 
          href: '/AvatarCustomizer',
          isActive: activePage === 'avatar-customizer' || isActivePath('/avatarcustomizer') || isActivePath('/AvatarCustomizer')
        },
        { 
          icon: FileText, 
          label: 'About', 
          href: '/About',
          isActive: activePage === 'about' || isActivePath('/about') || isActivePath('/About')
        },
        { 
          icon: FileText, 
          label: 'Privacy Policy', 
          href: '/PrivacyPolicy',
          isActive: activePage === 'privacy-policy' || isActivePath('/privacy-policy') || isActivePath('/PrivacyPolicy')
        },
        { 
          icon: Scroll, 
          label: 'Terms of Service', 
          href: '/TermsOfService',
          isActive: activePage === 'terms-of-service' || isActivePath('/terms-of-service') || isActivePath('/TermsOfService')
        }
      ]
    }
  ];

  const renderBadge = (badge: string, color: string = 'blue') => {
    const colorClasses = {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-400/30 shadow-sm',
      green: 'bg-green-500/20 text-green-300 border-green-400/30 shadow-sm',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-400/30 shadow-sm',
      red: 'bg-red-500/20 text-red-300 border-red-400/30 shadow-sm',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-400/30 shadow-sm'
    };

    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
        {badge}
      </span>
    );
  };

  const renderSidebarItem = (item: SidebarItem) => {
    const baseClasses = `
      flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg 
      transition-all duration-300 hover:bg-slate-700/50 group relative overflow-hidden
    `;
    
    const activeClasses = item.isActive 
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 border border-blue-500/30' 
      : 'text-slate-300 hover:text-white hover:bg-slate-700/50';

    const content = (
      <div className={`${baseClasses} ${activeClasses}`}>
        {/* Active indicator - glowing left border */}
        {item.isActive && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none animate-pulse"></div>
          </>
        )}
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className={`p-1.5 rounded-lg transition-all duration-300 ${
            item.isActive 
              ? 'bg-white/20 shadow-lg backdrop-blur-sm' 
              : 'group-hover:bg-slate-600/50'
          }`}>
            <item.icon className={`h-4 w-4 transition-all duration-300 ${
              item.isActive 
                ? 'text-white drop-shadow-sm' 
                : 'text-slate-400 group-hover:text-slate-200'
            }`} />
          </div>
          <span className={`truncate font-medium transition-all duration-300 ${
            item.isActive ? 'text-white font-semibold' : ''
          }`}>
            {item.label}
          </span>
          {/* Active page indicator - just the dot */}
          {item.isActive && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          {item.count !== undefined && item.count > 0 && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 ${
              item.isActive 
                ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm border border-white/30' 
                : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white'
            }`}>
              {item.count}
            </span>
          )}
          {item.badge && (
            <div className={item.isActive ? 'animate-bounce' : ''}>
              {renderBadge(item.badge, item.badgeColor)}
            </div>
          )}
        </div>
      </div>
    );

    const handleClick = () => {
      if (item.pageId && onPageChange) {
        onPageChange(item.pageId, item.label);
        onClose?.(); // Close mobile sidebar after selection
      } else if (item.onClick) {
        item.onClick();
      } else if (item.href) {
        // Use Next.js router for internal navigation
        router.push(item.href);
        onClose?.(); // Close mobile sidebar after selection
      }
    };

    return (
      <button key={item.label} onClick={handleClick} className="w-full">
        {content}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-64 h-screen lg:h-auto 
        bg-slate-800/95 lg:bg-slate-800 backdrop-blur-xl border-r border-slate-700/50 
        transition-transform duration-300 ease-in-out lg:transition-none overflow-y-auto 
        shadow-2xl lg:shadow-none ${className}
      `}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-700">
          <span className="font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {sidebarSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-4">
            {/* Section Header */}
            {section.isCollapsible ? (
              <button
                onClick={() => toggleSection(section.title.toLowerCase().replace(/\s/g, ''))}
                className="flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-all duration-300 hover:bg-slate-700/30 rounded-lg group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-slate-700/50 group-hover:bg-slate-600/50 transition-all duration-300">
                    <section.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold">{section.title}</span>
                  {/* Active section indicator */}
                  {section.items.some(item => item.isActive) && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="transition-transform duration-300">
                  {expandedSections[section.title.toLowerCase().replace(/\s/g, '')] ? (
                    <ChevronDown className="h-4 w-4 transform rotate-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transform rotate-0" />
                  )}
                </div>
              </button>
            ) : (
              <div className="px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-md bg-slate-700/50">
                    <section.icon className="h-3.5 w-3.5" />
                  </div>
                  <span>{section.title}</span>
                  {/* Active section indicator */}
                  {section.items.some(item => item.isActive) && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            )}

            {/* Section Items */}
            {(!section.isCollapsible || expandedSections[section.title.toLowerCase().replace(/\s/g, '')]) && (
              <div className="mt-2 space-y-1">
                {section.items.map(renderSidebarItem)}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-800 p-4 space-y-2">

        {/* Logout */}
        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'L'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || 'Learner'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                @{user.email?.split('@')[0] || 'user'}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default KnowledgeGateSidebar;
