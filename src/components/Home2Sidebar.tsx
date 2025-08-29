import React from 'react';
import { 
  Home, 
  BookOpen, 
  Download, 
  Upload, 
  Users, 
  Bell, 
  Calendar, 
  MessageCircle, 
  Trophy, 
  Gift,
  Star,
  Settings,
  User,
  Crown,
  Briefcase,
  Shield,
  FileText,
  Brain,
  BarChart3
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  isActive?: boolean;
}

interface Home2SidebarProps {
  currentPage: string;
  onPageChange: (pageId: string) => void;
  className?: string;
}

const Home2Sidebar: React.FC<Home2SidebarProps> = ({ 
  currentPage, 
  onPageChange, 
  className = '' 
}) => {
  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'notes-download', label: 'Download Notes', icon: Download },
    { id: 'notes-upload', label: 'Upload Notes', icon: Upload },
    { id: 'ai-chat', label: 'AI Chat', icon: Brain },
    { id: 'counselling-updates', label: 'Counselling Updates', icon: Bell },
    { id: 'exam-updates', label: 'Exam Updates', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'join-team', label: 'Join Team', icon: Users },
    { id: 'internships', label: 'Internships', icon: Briefcase },
    { id: 'community-rules', label: 'Community Rules', icon: Shield },
    { id: 'notes-request', label: 'Notes Request', icon: MessageCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'wishlist', label: 'Wishlist', icon: Star },
    { id: 'study-bundles', label: 'Study Bundles', icon: BookOpen },
    { id: 'referral', label: 'Referral', icon: Gift },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'notes-status-check', label: 'Notes Status Check', icon: BarChart3 },
    { id: 'notes-category', label: 'Notes Category', icon: BookOpen }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Navigation
        </h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                ${currentPage === item.id
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Home2Sidebar;
