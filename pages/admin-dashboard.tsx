import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import DashboardLayout from '../src/components/dashboard/DashboardLayout';
import { useAuth } from '../src/contexts/AuthContext';

// Admin Components
import PageManagement from '../src/components/admin/PageManagement';
import UserAccountManager from '../src/components/admin/UserAccountManager';
import TeamMemberManager from '../src/components/admin/TeamMemberManager';
import NotesCenter from '../src/components/admin/NotesCenter';
import SystemSettings from '../src/components/admin/SystemSettings';
import NotificationsManager from '../src/components/admin/NotificationsManager';
import BroadcastSection from '../src/components/admin/BroadcastSection';
import LeaderboardControl from '../src/components/admin/LeaderboardControl';
import NotesDownloadManager from '../src/components/admin/NotesDownloadManager';

import {
    BarChart3,
    Users,
    Bell,
    Settings,
    FileText,
    Shield,
    Database,
    Globe,
    MessageSquare,
    Activity,
    UserCheck,
    LayoutDashboard,
    User,
    LogOut,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Server,
    Monitor,
    Eye,
    UserPlus,
    FileEdit,
    Menu,
    Zap,
    Lock,
    Unlock,
    Trash2,
    Edit,
    MoreVertical,
    PieChart,
    LineChart
} from 'lucide-react';

function AdminDashboard() {
    const { user, userProfile, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Admin-specific statistics
    const [adminStats] = useState({
        totalUsers: 1245,
        activeUsers: 890,
        totalNotes: 3420,
        pendingApprovals: 23,
        systemUptime: '99.8%',
        monthlyGrowth: 12.5,
        storageUsed: '45.2GB',
        reportedIssues: 8,
        teamMembers: 15,
        maintenanceMode: false
    });

    // Recent admin activities
    const [recentActivities] = useState([
        { id: 1, user: 'John Doe', action: 'uploaded notes', time: '2 minutes ago', type: 'upload' },
        { id: 2, user: 'Sarah Wilson', action: 'joined platform', time: '5 minutes ago', type: 'user' },
        { id: 3, user: 'Admin', action: 'approved content', time: '10 minutes ago', type: 'approval' },
        { id: 4, user: 'Mike Johnson', action: 'reported issue', time: '15 minutes ago', type: 'report' }
    ]);

    const [loading] = useState(false);

    // Logout handler
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Admin Dashboard main content
    const renderDashboardContent = () => (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage and oversee the JEHUB platform</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Profile Banner */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
                        {/* Avatar */}
                        <div className="relative">
                            {userProfile?.profileImageUrl ? (
                                <Image
                                    src={userProfile.profileImageUrl}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/30 object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
                                    <span className="text-xl sm:text-2xl font-bold">
                                        {(userProfile?.name || user?.name || 'A').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>

                        {/* Admin Info */}
                        <div className="text-center lg:text-left flex-1 w-full">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{userProfile?.name || user?.name}</h2>
                            <p className="text-white/90 text-base sm:text-lg mb-4">
                                {userProfile?.role === 'admin' ? '🛡️ Administrator' : 
                                 userProfile?.role === 'manager' ? '👔 Manager' : 
                                 userProfile?.role === 'intern' ? '💼 Intern' : 'Admin User'}
                                {userProfile?.branch && ` • ${userProfile.branch}`}
                            </p>

                            {/* Admin Stats */}
                            <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 mb-4">
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold">{adminStats.totalUsers}</p>
                                    <p className="text-xs text-white/80">Total Users</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold">{adminStats.totalNotes}</p>
                                    <p className="text-xs text-white/80">Total Notes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl sm:text-2xl font-bold">{adminStats.systemUptime}</p>
                                    <p className="text-xs text-white/80">Uptime</p>
                                </div>
                            </div>

                            {/* Status Bar */}
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                                    <span>System Status</span>
                                    <span className="text-green-300">All systems operational</span>
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-2 sm:h-2.5">
                                    <div className="bg-green-400 h-2 sm:h-2.5 rounded-full" style={{ width: '98%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <button 
                                onClick={() => setActiveSection('system')}
                                className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Settings</span>
                            </button>
                            <button 
                                onClick={() => setActiveSection('users')}
                                className="w-full bg-white hover:bg-gray-100 text-orange-600 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span>Manage Users</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Total Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalUsers}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Active Users</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.activeUsers}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Total Notes</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.totalNotes}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Pending Approvals</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.pendingApprovals}</p>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Server className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">System Uptime</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.systemUptime}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Monthly Growth</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.monthlyGrowth}%</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Storage Used</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.storageUsed}</p>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Reported Issues</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{adminStats.reportedIssues}</p>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Recent Activities</h3>
                <div className="space-y-4">
                    {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-4">
                                {activity.type === 'upload' && <FileEdit className="h-6 w-6 text-blue-600" />}
                                {activity.type === 'user' && <UserPlus className="h-6 w-6 text-green-600" />}
                                {activity.type === 'approval' && <CheckCircle className="h-6 w-6 text-purple-600" />}
                                {activity.type === 'report' && <AlertTriangle className="h-6 w-6 text-red-600" />}
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.user}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-600">{activity.time}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Admin Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Users, label: "Manage Users", color: "blue", section: "users" },
                        { icon: FileText, label: "Notes Center", color: "green", section: "notes" },
                        { icon: Settings, label: "System Settings", color: "purple", section: "system" },
                        { icon: Bell, label: "Notifications", color: "orange", section: "notifications" }
                    ].map((action, index) => (
                        <button 
                            key={index} 
                            onClick={() => setActiveSection(action.section)}
                            className={`p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-${action.color}-300 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-300 group`}
                        >
                            <action.icon className={`h-8 w-8 text-gray-400 group-hover:text-${action.color}-600 dark:group-hover:text-${action.color}-400 mx-auto mb-2`} />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                {action.label}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Get user role from profile
    const userRole = userProfile?.role || 'admin';

    // Function to render content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboardContent();
case 'notes':
                return <NotesDownloadManager />;
            case 'users':
                return <UserAccountManager />;
            case 'team':
                return <TeamMemberManager userRole={userRole} />;
            case 'system':
                return <SystemSettings />;
            case 'notifications':
                return <NotificationsManager />;
            case 'broadcast':
                return <BroadcastSection userRole={userRole} />;
            case 'leaderboard':
                return <LeaderboardControl userRole={userRole} />;
            case 'pages':
                return <PageManagement />;
            default:
                return renderDashboardContent();
        }
    };

    return (
        <DashboardLayout>
            <Head>
                <title>Admin Dashboard - JEHUB</title>
                <meta name="description" content="Admin control panel for managing the JEHUB platform, users, and system settings" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                >
                    <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div className="flex">
                    {/* Admin Sidebar */}
                    <div className={`fixed lg:sticky left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
                        <div className="h-screen flex flex-col">
                            {/* Admin Logo */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                                        <Shield className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">JEHUB Admin</h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Control Panel</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 overflow-y-auto py-6">
                                <div className="px-6 space-y-8">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overview</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                                { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                                            ].map((item) => {
                                                const IconComponent = item.icon;
                                                const active = activeSection === item.key;

                                                return (
                                                    <button
                                                        key={item.key}
                                                        onClick={() => {
                                                            setActiveSection(item.key);
                                                            setSidebarOpen(false);
                                                        }}
                                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                                            }`} />
                                                        <span>{item.label}</span>
                                                        {active && (
                                                            <div className="ml-auto w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Management</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'users', label: 'User Management', icon: Users },
                                                { key: 'notes', label: 'Notes Center', icon: FileText },
                                                { key: 'team', label: 'Team Management', icon: UserCheck },
                                                { key: 'pages', label: 'Page Management', icon: Globe },
                                            ].map((item) => {
                                                const IconComponent = item.icon;
                                                const active = activeSection === item.key;

                                                return (
                                                    <button
                                                        key={item.key}
                                                        onClick={() => {
                                                            setActiveSection(item.key);
                                                            setSidebarOpen(false);
                                                        }}
                                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                                            }`} />
                                                        <span>{item.label}</span>
                                                        {active && (
                                                            <div className="ml-auto w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System</h3>
                                        <div className="space-y-1">
                                            {[
                                                { key: 'system', label: 'System Settings', icon: Settings },
                                                { key: 'notifications', label: 'Notifications', icon: Bell },
                                                { key: 'broadcast', label: 'Broadcast', icon: MessageSquare },
                                                { key: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
                                                { key: 'logout', label: 'Logout', icon: LogOut, isLogout: true },
                                            ].map((item) => {
                                                const IconComponent = item.icon;
                                                const active = activeSection === item.key;

                                                return (
                                                    <button
                                                        key={item.key}
                                                        onClick={() => {
                                                            if (item.isLogout) {
                                                                handleLogout();
                                                            } else {
                                                                setActiveSection(item.key);
                                                                setSidebarOpen(false);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                                            item.isLogout 
                                                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                : active
                                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                                                            item.isLogout
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : active
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                                                            }`} />
                                                        <span>{item.label}</span>
                                                        {active && !item.isLogout && (
                                                            <div className="ml-auto w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-h-screen lg:ml-0">
                        <div className="overflow-y-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Role-based access control wrapper
export default function ProtectedAdminDashboard() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for user and userProfile to load
            if (!user) {
                router.push('/login');
                return;
            }

            // If userProfile is still loading, wait a bit
            if (userProfile === undefined) {
                return;
            }

            // Check role-based access
            const userRole = userProfile?.role || 'user';
            
            // Only allow access for admin roles
            const allowedRoles = ['admin', 'manager', 'intern'];
            
            if (allowedRoles.includes(userRole)) {
                setHasAccess(true);
            } else {
                // Redirect students to student dashboard
                if (userRole === 'student' || userRole === 'user') {
                    router.push('/dashboard');
                } else {
                    router.push('/access-denied');
                }
                return;
            }
            
            setIsChecking(false);
        };

        checkAccess();
    }, [user, userProfile, router]);

    // Show loading while checking access
    if (isChecking || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    // Render admin dashboard if access is granted
    return hasAccess ? <AdminDashboard /> : null;
}
