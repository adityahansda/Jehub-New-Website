import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
import { useRoleVerification } from '../src/hooks/useRoleVerification';
import RoleGuard from '../src/components/auth/RoleGuard';
import DashboardLayout from '../src/components/dashboard/DashboardLayout';
import {
  Shield,
  Users,
  Settings,
  FileText,
  MessageSquare,
  BarChart3,
  Bell,
  Database,
  Search,
  Globe,
  Share2,
  Menu,
  X,
  Home,
  Eye,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Save,
  Edit3,
  Plus,
  Trash2,
  Check,
  Ban,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  Filter,
  MoreVertical,
  Award,
  Activity,
  Lock,
  Zap,
  LayoutDashboard,
  User,
  HelpCircle,
  LogOut,
  BookOpen,
  Bookmark,
  GraduationCap,
  Calendar,
  Clock,
  Target,
  Cpu,
  Server,
  Monitor,
  Wifi,
  HardDrive,
  PieChart,
  LineChart,
  BarChart,
  MapPin,
  Star,
  Heart,
  Flag,
  Tag,
  Image,
  Video,
  Mail,
  Phone,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Link2
} from 'lucide-react';

// Import admin components
import NotificationsManager from '../src/components/admin/NotificationsManager';
import AdminPdfValidation from '../src/pages/admin-pdf-validation';
import UserEditModal from '../src/components/UserEditModal';

const UnifiedAdminDashboard: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { userRole, isAdmin } = useRoleVerification();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    totalNotes: number;
    totalDownloads: number;
    totalShares: number;
    recentActivity: Array<{
      type: string;
      message: string;
      time: string;
    }>;
  }>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalNotes: 0,
    totalDownloads: 0,
    totalShares: 0,
    recentActivity: []
  });

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Template Management State
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<any | null>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // PDF Validation State
  const [pdfValidationResults, setPdfValidationResults] = useState<any[]>([]);

  // User Management State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchDashboardStats(),
        fetchTemplates(),
        fetchSettings()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersList = await userService.listAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Mock stats - replace with actual API calls
      setDashboardStats({
        totalUsers: users.length || 0,
        activeUsers: users.filter(u => u.status === 'active').length || 0,
        bannedUsers: users.filter(u => u.status === 'banned').length || 0,
        totalNotes: 1247,
        totalDownloads: 8956,
        totalShares: 234,
        recentActivity: [
          { type: 'user_registered', message: 'New user registered', time: '2 hours ago' },
          { type: 'note_uploaded', message: 'Note uploaded: Data Structures', time: '4 hours ago' },
          { type: 'setting_updated', message: 'Share template updated', time: '6 hours ago' }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };




  // Render dashboard overview
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your platform with comprehensive tools</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchAllData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Stats</span>
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalUsers}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Notes Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalNotes}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </div>
            </div>
            <div className="text-green-600 dark:text-green-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Downloads Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalDownloads}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +23% from last month
                </p>
              </div>
            </div>
            <div className="text-purple-600 dark:text-purple-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Shares Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.totalShares}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +5% from last month
                </p>
              </div>
            </div>
            <div className="text-orange-600 dark:text-orange-400">
              <Globe className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity & System Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
                <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Monitor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Health</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
          <div className="space-y-4">
            {/* Server Status */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Server Status</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Uptime: 99.9%</p>
                </div>
              </div>
              <div className="text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Response: 12ms</p>
                </div>
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

            {/* API Status */}
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">API Services</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Load: 23%</p>
                </div>
              </div>
              <div className="text-purple-600 dark:text-purple-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render user management section
  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.$id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'student' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'banned' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.$id);
                            setEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      <UserEditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={selectedUserId}
        onUserUpdated={(updatedUser) => {
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.$id === updatedUser.$id ? updatedUser : user
            )
          );
        }} 
      />
    </div>
  );

  // Render templates section
  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Template Management</h2>
        <button
          onClick={() => setNewTemplate({
            id: '',
            name: '',
            description: '',
            content: '',
            isActive: false,
            isDefault: false
          })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Template
        </button>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-lg border p-6 ${
              template.isActive ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {template.name}
                  {template.isActive && (
                    <span className="text-sm text-white bg-blue-600 rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-gray-600">{template.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingTemplateId(template.id);
                    setNewTemplate({ ...template });
                  }}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                  Edit
                </button>
                <button className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {template.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render settings section
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Message Template */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Share Message Template</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Share Message
              </label>
              <textarea
                value={settings['share_message_template']?.value || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  'share_message_template': { ...prev['share_message_template'], value: e.target.value }
                }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your custom share message template..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {'{title}'}, {'{subject}'}, {'{branch}'}, {'{semester}'}, {'{uploader}'}, {'{url}'}
              </p>
            </div>

            <button
              onClick={() => {
                // Save template logic here
                setSuccess('Template saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
              }}
              disabled={saving === 'share_message_template'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving === 'share_message_template' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Template
            </button>
          </div>
        </div>

        {/* Social Media Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Social Media Sharing</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: 'share_whatsapp_enabled', label: 'WhatsApp', icon: '💬' },
              { key: 'share_telegram_enabled', label: 'Telegram', icon: '📱' },
              { key: 'share_twitter_enabled', label: 'Twitter', icon: '🐦' },
              { key: 'share_facebook_enabled', label: 'Facebook', icon: '📘' }
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key]?.value === 'true'}
                    onChange={(e) => {
                      const newValue = e.target.checked ? 'true' : 'false';
                      setSettings(prev => ({
                        ...prev,
                        [key]: { ...prev[key], value: newValue }
                      }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render PDF validation section
  const renderPdfValidation = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">PDF Validation</h2>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <AdminPdfValidation />
      </div>
    </div>
  );

  // Render notifications section
  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Notifications Manager</h2>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <NotificationsManager />
      </div>
    </div>
  );

  // Render content management section
  const renderContentManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes Management</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span>Total Notes</span>
              <span className="font-semibold">{dashboardStats.totalNotes}</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span>Pending Review</span>
              <span className="font-semibold text-yellow-600">12</span>
            </div>
            <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span>Approved</span>
              <span className="font-semibold text-green-600">1,235</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Review Pending Notes
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Bulk Operations
            </button>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Content Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render analytics section
const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Engagement</h3>
          <p className="text-gray-600 dark:text-gray-400">Active users, session duration, and more...</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h3>
          <p className="text-gray-600 dark:text-gray-400">Load times, server response, API calls...</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Daily Active Users</span>
              <span className="font-semibold text-blue-600">1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Monthly Downloads</span>
              <span className="font-semibold text-green-600">{dashboardStats.totalDownloads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>User Growth</span>
              <span className="font-semibold text-purple-600">+15.3%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Content</h3>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="font-medium">Data Structures & Algorithms</p>
              <p className="text-sm text-gray-600">Downloaded 456 times</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="font-medium">Computer Networks</p>
              <p className="text-sm text-gray-600">Downloaded 392 times</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="font-medium">Database Management</p>
              <p className="text-sm text-gray-600">Downloaded 334 times</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render SEO indexing section
  const renderIndexing = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">SEO Indexing Management</h2>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indexing Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-gray-900">63</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Indexed Pages</p>
              <p className="text-2xl font-bold text-green-600">58</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Not Indexed</p>
              <p className="text-2xl font-bold text-red-600">5</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Manage Page Indexing
          </button>
          <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Generate Sitemap
          </button>
          <button className="ml-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Submit to Search Engines
          </button>
        </div>
      </div>
    </div>
  );

  // Render reports section
  const renderReports = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive platform insights and reporting</p>
      </div>
      
      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly user registration trends</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">+245</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">187</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploads and downloads tracking</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Uploads</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">1,247</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform performance metrics</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">245ms</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Reports Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detailed Activity Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Event Type</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Details</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-01-15', type: 'User Registration', user: 'john.doe@email.com', details: 'New user signup', status: 'Completed' },
                { date: '2024-01-15', type: 'Content Upload', user: 'jane.smith@email.com', details: 'Data Structures Notes', status: 'Approved' },
                { date: '2024-01-14', type: 'Content Report', user: 'admin@jehub.com', details: 'Spam content flagged', status: 'Under Review' },
                { date: '2024-01-14', type: 'System Update', user: 'system', details: 'Database optimization', status: 'Completed' },
                { date: '2024-01-13', type: 'User Verification', user: 'student@college.edu', details: 'Email verification', status: 'Completed' }
              ].map((report, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{report.date}</td>
                  <td className="px-6 py-4">{report.type}</td>
                  <td className="px-6 py-4">{report.user}</td>
                  <td className="px-6 py-4">{report.details}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      report.status === 'Approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render main content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'content':
        return renderContentManagement();
      case 'templates':
        return renderTemplates();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      case 'pdf-validation':
        return renderPdfValidation();
      case 'notifications':
        return renderNotifications();
      case 'analytics':
        return renderAnalytics();
      case 'indexing':
        return renderIndexing();
      default:
        return renderDashboard();
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <DashboardLayout>
        <Head>
<title>Unified Admin Dashboard - Jharkhand Engineer's Hub</title>
<meta name="description" content="Comprehensive admin dashboard for managing users, content, and system settings" />
<meta name="robots" content="noindex, nofollow" />
</Head>
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
  {/* Mobile Sidebar Toggle */}
  <button
    className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
  </button>
  <div className={`fixed lg:relative left-0 top-0 h-full lg:h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0`}
  >
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Admin
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              Dashboard
            </p>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-6 space-y-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Management
            </h3>
            <div className="space-y-1">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { key: 'users', label: 'User Management', icon: Users },
                { key: 'content', label: 'Content Management', icon: FileText },
                { key: 'templates', label: 'Templates', icon: MessageSquare },
                { key: 'reports', label: 'Reports', icon: BookOpen }
              ].map((item) => {
                const IconComponent = item.icon;
                const active = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              System
            </h3>
            <div className="space-y-1">
              {[
                { key: 'settings', label: 'Settings', icon: Settings },
                { key: 'pdf-validation', label: 'PDF Validation', icon: FileText },
                { key: 'notifications', label: 'Notifications', icon: Bell },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((item) => {
                const IconComponent = item.icon;
                const active = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <button
            onClick={() => {
              console.log('Back to Home');
            }}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200 w-full"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={() => {
              console.log('Help & Support');
            }}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200 w-full"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help & Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div className="flex-1 flex flex-col overflow-hidden">
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {renderMainContent()}
      </div>
    </main>
  </div>
</div>
      </DashboardLayout>
    </RoleGuard>
  );
};

export default UnifiedAdminDashboard;
