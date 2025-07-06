import React from 'react';
import { 
  Users, 
  FileText, 
  Download, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Star,
  Eye,
  MessageSquare
} from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    { 
      title: 'Total Users', 
      value: '2,847', 
      change: '+12%', 
      icon: Users, 
      color: 'blue',
      trend: 'up'
    },
    { 
      title: 'Notes Uploaded', 
      value: '1,523', 
      change: '+8%', 
      icon: FileText, 
      color: 'green',
      trend: 'up'
    },
    { 
      title: 'Total Downloads', 
      value: '45,678', 
      change: '+24%', 
      icon: Download, 
      color: 'purple',
      trend: 'up'
    },
    { 
      title: 'Team Members', 
      value: '28', 
      change: '+2', 
      icon: Star, 
      color: 'orange',
      trend: 'up'
    },
  ];

  const recentActivity = [
    { id: 1, type: 'note_upload', user: 'Sarah Johnson', action: 'uploaded new notes', item: 'Linear Algebra Chapter 5', time: '2 minutes ago', status: 'pending' },
    { id: 2, type: 'team_request', user: 'Mike Chen', action: 'requested to join team', item: 'Developer Role', time: '15 minutes ago', status: 'pending' },
    { id: 3, type: 'note_approved', user: 'Admin', action: 'approved notes', item: 'Physics Mechanics', time: '1 hour ago', status: 'approved' },
    { id: 4, type: 'user_signup', user: 'Emily Davis', action: 'signed up', item: 'New Account', time: '2 hours ago', status: 'completed' },
    { id: 5, type: 'note_download', user: 'Alex Wilson', action: 'downloaded notes', item: 'Chemistry Basics', time: '3 hours ago', status: 'completed' },
  ];

  const pendingActions = [
    { id: 1, type: 'Notes Approval', count: 12, priority: 'high' },
    { id: 2, type: 'Team Requests', count: 5, priority: 'medium' },
    { id: 3, type: 'User Reports', count: 3, priority: 'high' },
    { id: 4, type: 'System Updates', count: 1, priority: 'low' },
  ];

  const topPerformers = [
    { id: 1, name: 'Sarah Johnson', role: 'Content Creator', points: 2450, uploads: 45, downloads: 1230 },
    { id: 2, name: 'Mike Chen', role: 'Developer', points: 1980, uploads: 32, downloads: 890 },
    { id: 3, name: 'Emily Davis', role: 'Manager', points: 1750, uploads: 28, downloads: 750 },
    { id: 4, name: 'Alex Wilson', role: 'Moderator', points: 1520, uploads: 25, downloads: 650 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.item}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pending Actions</h3>
          <div className="space-y-4">
            {pendingActions.map((action) => (
              <div key={action.id} className={`p-4 rounded-lg border-2 ${getPriorityColor(action.priority)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{action.type}</p>
                    <p className="text-xs opacity-75 mt-1">Priority: {action.priority}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{action.count}</span>
                    <p className="text-xs">items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers This Month</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View Leaderboard
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500">{performer.role}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-medium">{performer.points}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uploads:</span>
                  <span className="font-medium">{performer.uploads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{performer.downloads}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
