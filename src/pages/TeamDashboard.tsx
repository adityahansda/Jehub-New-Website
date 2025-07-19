import React, { useState } from 'react';
import { 
  User, 
  BarChart3, 
  Calendar, 
  CheckSquare, 
  Trophy, 
  Upload, 
  MessageSquare, 
  FolderOpen,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

// Import team dashboard components
import ProfileSection from '../components/team/ProfileSection';
import PerformanceMetrics from '../components/team/PerformanceMetrics';
import TaskManagement from '../components/team/TaskManagement';
import LeaveRequest from '../components/team/LeaveRequest';
import TeamLeaderboard from '../components/team/TeamLeaderboard';
import NotesUploadZone from '../components/team/NotesUploadZone';
import ResourcesLibrary from '../components/team/ResourcesLibrary';

const TeamDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data (would come from auth context)
  const currentUser = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@jehub.com',
    phone: '+1234567890',
    designation: 'Content Manager',
    position: 'Senior Content Creator',
    status: 'Active',
    joinDate: '2023-08-15',
    college: 'MIT',
    avatar: 'SJ',
    department: 'Content',
    rank: 2,
    xp: 2450
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'leave', label: 'Leave Request', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'notes', label: 'Notes Upload', icon: Upload },
    { id: 'resources', label: 'Resources', icon: FolderOpen },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <PerformanceMetrics user={currentUser} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskManagement isOverview={true} />
            </div>
          </div>
        );
      case 'profile':
        return <ProfileSection user={currentUser} />;
      case 'tasks':
        return <TaskManagement />;
      case 'leave':
        return <LeaveRequest />;
      case 'leaderboard':
        return <TeamLeaderboard currentUser={currentUser} />;
      case 'notes':
        return <NotesUploadZone />;
      case 'resources':
        return <ResourcesLibrary />;
      default:
        return <PerformanceMetrics user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.avatar}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Team Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {currentUser.name}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Rank #{currentUser.rank}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{currentUser.xp} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentUser.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentUser.status}
                </span>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
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
                {tabs.map((tab) => {
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

export default TeamDashboard;
