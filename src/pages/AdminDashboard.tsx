import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  Users, 
  FileText, 
  Trophy, 
  Shield, 
  Settings, 
  BarChart3, 
  Bell, 
  Calendar,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Mail,
  MessageSquare,
  Globe,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react';

// Import admin components
import TeamMemberManager from '../components/admin/TeamMemberManager';
import NotesCenter from '../components/admin/NotesCenter';
import LeaderboardControl from '../components/admin/LeaderboardControl';
import UserAccountManager from '../components/admin/UserAccountManager';
import PageManagement from '../components/admin/PageManagement';
import FormDataViewer from '../components/admin/FormDataViewer';
import SystemSettings from '../components/admin/SystemSettings';
import BroadcastSection from '../components/admin/BroadcastSection';
import DashboardStats from '../components/admin/DashboardStats';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { userRole } = useAuth();
  
  const currentUserRole = userRole?.role || 'user';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'team', label: 'Team Management', icon: Users, roles: ['admin', 'manager'] },
    { id: 'notes', label: 'Notes Center', icon: FileText, roles: ['admin', 'manager', 'intern'] },
    { id: 'leaderboard', label: 'Leaderboard Control', icon: Trophy, roles: ['admin', 'manager'] },
    { id: 'users', label: 'User Accounts', icon: Shield, roles: ['admin'] },
    { id: 'pages', label: 'Page Management', icon: Globe, roles: ['admin'] },
    { id: 'forms', label: 'Form Data', icon: Database, roles: ['admin', 'manager'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['admin'] },
    { id: 'broadcast', label: 'Broadcast', icon: Bell, roles: ['admin', 'manager'] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(currentUserRole));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats />;
      case 'team':
        return <TeamMemberManager userRole={currentUserRole} />;
      case 'notes':
        return <NotesCenter userRole={currentUserRole} />;
      case 'leaderboard':
        return <LeaderboardControl userRole={currentUserRole} />;
      case 'users':
        return <UserAccountManager />;
      case 'pages':
        return <PageManagement />;
      case 'forms':
        return <FormDataViewer userRole={currentUserRole} />;
      case 'settings':
        return <SystemSettings />;
      case 'broadcast':
        return <BroadcastSection userRole={currentUserRole} />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {currentUserRole}
              </div>
              <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
