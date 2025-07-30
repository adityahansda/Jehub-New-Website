import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../src/components/dashboard/DashboardLayout';
import TopNavbar from '../src/components/common/TopNavbar';
import DashboardAnalytics from '../src/components/dashboard/DashboardAnalytics';
import { useAuth } from '../src/contexts/AuthContext';
import { userService, UserProfile } from '../src/services/userService';
import { 
  BarChart3, 
  BookOpen, 
  Calendar, 
  Download, 
  Upload, 
  Trophy, 
  Users, 
  Bell, 
  Settings,
  TrendingUp,
  FileText,
  Star,
  Target,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Award,
  Activity,
  Zap,
  UserCheck,
  GraduationCap,
  BookMarked,
  Bookmark,
  LayoutDashboard,
  User,
  Home,
  HelpCircle,
  LogOut,
  Loader2
} from 'lucide-react';

export default function ModernDashboard() {
  const { user, userProfile, loading: authLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user?.email && !authLoading) {
        try {
          setLoading(true);
          const stats = await userService.getUserStatsWithComparison(user.email);
          setUserStats(stats);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !user) {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.email, authLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      // The redirect will be handled by the useAuth hook
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return (
      <DashboardLayout>
        <Head>
          <title>Loading Dashboard - JEHUB</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to login if not authenticated (handled by useAuth hook)
  if (!user) {
    return null;
  }

  // Modern Dashboard Content
  const renderDashboardContent = () => (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {userProfile?.name || user?.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Quick Action</span>
          </button>
        </div>
      </div>

      {/* Modern Profile Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8">
          {/* Avatar */}
          <div className="relative mb-6 lg:mb-0">
            {userProfile?.profileImageUrl ? (
              <img 
                src={userProfile.profileImageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-2xl border border-white/30 object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          {/* User Info */}
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-3xl font-bold mb-2">{userProfile?.name || user?.name}</h2>
            <p className="text-white/90 text-lg mb-4">
              {userProfile?.branch ? `${userProfile.branch}` : 'Student'}
              {userProfile?.semester && ` • ${userProfile.semester} Semester`}
            </p>
            
            {loading ? (
              <div className="flex items-center justify-center lg:justify-start">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading stats...</span>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <span>Rank #{userStats?.current?.rank || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4" />
                  </div>
                  <span>{userStats?.current?.totalPoints || 0} Points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span>{userStats?.current?.notesUploaded || 0} Notes</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
            <Link href="/notes/upload">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </button>
            </Link>
            <Link href="/notes/download">
              <button className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Browse</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          [
            {
              title: "Notes Uploaded",
              value: userStats?.current?.notesUploaded || 0,
              change: userStats?.percentageChanges?.notesUploadedPercent || '0%',
              icon: FileText,
              color: "bg-blue-50 dark:bg-blue-900/20",
              iconColor: "text-blue-600 dark:text-blue-400",
              gradient: "from-blue-400 to-blue-600"
            },
            {
              title: "Downloads Received", 
              value: userStats?.current?.notesDownloaded || 0,
              change: userStats?.percentageChanges?.notesDownloadedPercent || '0%',
              icon: Download,
              color: "bg-green-50 dark:bg-green-900/20",
              iconColor: "text-green-600 dark:text-green-400",
              gradient: "from-green-400 to-green-600"
            },
            {
              title: "Points Earned",
              value: userStats?.current?.totalPoints || 0,
              change: userStats?.percentageChanges?.totalPointsPercent || '0%',
              icon: Star,
              color: "bg-purple-50 dark:bg-purple-900/20", 
              iconColor: "text-purple-600 dark:text-purple-400",
              gradient: "from-purple-400 to-purple-600"
            },
            {
              title: "Current Rank",
              value: userStats?.current?.rank ? `#${userStats.current.rank}` : 'N/A',
              change: userStats?.percentageChanges?.rankChangeText || '0',
              icon: Trophy,
              color: "bg-orange-50 dark:bg-orange-900/20",
              iconColor: "text-orange-600 dark:text-orange-400", 
              gradient: "from-orange-400 to-orange-600"
            }
          ].map((stat, index) => (
          <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className={`px-2 py-1 bg-gradient-to-r ${stat.gradient} text-white text-xs font-medium rounded-full`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Upload, label: "Upload Notes", color: "blue" },
            { icon: Download, label: "Browse Notes", color: "green" },
            { icon: Users, label: "Study Groups", color: "purple" },
            { icon: Calendar, label: "Schedule", color: "orange" }
          ].map((action, index) => (
            <button key={index} className={`p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-${action.color}-300 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-300 group`}>
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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'analytics':
        return <DashboardAnalytics user={user} userProfile={userProfile || undefined} userStats={userStats} />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Modern Dashboard - JEHUB</title>
        <meta name="description" content="Modern student dashboard with enhanced UI/UX" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Modern Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30">
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">JEHUB</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Student Portal</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-6">
                <div className="px-6 space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Main</h3>
                    <div className="space-y-1">
                      {[
                        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { key: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { key: 'my-notes', label: 'My Notes', icon: BookOpen },
                        { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
                      ].map((item) => {
                        const IconComponent = item.icon;
                        const active = activeSection === item.key;
                        
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                              active 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                              active 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            }`} />
                            <span>{item.label}</span>
                            {active && (
                              <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Community</h3>
                    <div className="space-y-1">
                      {[
                        { key: 'achievements', label: 'Achievements', icon: Award },
                        { key: 'profile', label: 'Profile', icon: User },
                      ].map((item) => {
                        const IconComponent = item.icon;
                        const active = activeSection === item.key;
                        
                        return (
                          <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                              active 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            <IconComponent className={`h-5 w-5 transition-colors duration-200 ${
                              active 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            }`} />
                            <span>{item.label}</span>
                            {active && (
                              <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </nav>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Link href="/" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                    <Home className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Link>
                  
                  <Link href="/help" className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                  
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

          {/* Main Content Area */}
          <div className="flex-1 ml-64">
            <TopNavbar />
            <div className="overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
