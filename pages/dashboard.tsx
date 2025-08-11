import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { showInfo, showSuccess, showError, showWarning } from '../src/utils/toast';
import DashboardLayout from '../src/components/dashboard/DashboardLayout';
import UserProfileSection from '../src/components/dashboard/UserProfileSection';
import DashboardAnalytics from '../src/components/dashboard/DashboardAnalytics';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
import { dashboardService, DashboardStats } from '../src/services/dashboardService';
import { hasRequiredRole } from '../src/utils/dashboardRouter';
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
    CheckCircle,
    AlertCircle,
    Wifi,
    WifiOff,
    X,
    Lock,
    Menu
} from 'lucide-react';

// Real data will be fetched from Appwrite

// Real data will be fetched from Appwrite


function StudentDashboard() {
    const { user, userProfile, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Logout handler
    const handleLogout = async () => {
        try {
            showInfo('Logging out...');
            await logout();
            showSuccess('Successfully logged out!');
        } catch (error) {
            console.error('Logout error:', error);
            showError('Failed to logout. Please try again.');
        }
    };

    // Fetch dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (user?.email) {
                try {
                    setLoading(true);
                    console.log('Fetching dashboard stats for user:', user.email);
                    const stats = await dashboardService.getDashboardStats(user.email);
                    console.log('Dashboard stats received:', stats);
                    setDashboardStats(stats);
                    showSuccess('Dashboard data loaded successfully!');
                } catch (error) {
                    console.error('Error fetching dashboard stats:', error);
                    showError('Failed to load dashboard data. Using offline data.');
                    // Set fallback data even on error
                    setDashboardStats({
                        notesUploaded: 0,
                        notesDownloaded: 0,
                        requestsFulfilled: 0,
                        currentRank: 0,
                        level: 1,
                        pointsToNextLevel: 250,
                        weeklyDownloads: 0,
                        monthlyDownloads: 0,
                        weeklyPoints: 0,
                        monthlyPoints: 0,
                        weeklyGrowth: 0,
                        totalViews: 0,
                        likesReceived: 0,
                        helpedStudents: 0,
                        notesRequested: 0,
                        completedAchievements: 0,
                        totalAchievements: 12,
                        recentNotes: [],
                        notifications: []
                    });
                } finally {
                    setLoading(false);
                }
            } else {
                // Set empty stats if no user
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [user?.email]);

    // Upload form state
    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        branch: '',
        semester: '',
        subject: '',
        description: '',
        tags: '',
        authorName: '',
        degree: '',
        noteType: 'free' as 'free' | 'premium',
        file: null as File | null
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [githubUrl, setGithubUrl] = useState('');
    const [showPremiumPopup, setShowPremiumPopup] = useState(false);

    // Mock user role - replace with actual user role from authentication
    const [userRole] = useState<'student' | 'admin'>('student');

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    );

    const StatCardSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 animate-pulse">
            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
            </div>
        </div>
    );

    // Dashboard main content
    const renderDashboardContent = () => (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">Welcome to your student portal</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern User Profile Banner */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8 space-y-6 lg:space-y-0">
                        {/* Avatar */}
                        <div className="relative">
                            {userProfile?.profileImageUrl && (
                              userProfile.profileImageUrl.includes('googleusercontent.com') ||
                              userProfile.profileImageUrl.includes('googleapis.com') ||
                              userProfile.profileImageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                            ) ? (
                                <Image
                                    src={userProfile.profileImageUrl}
                                    alt="Profile"
                                    width={96}
                                    height={96}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/30 object-cover"
                                    onError={(e) => {
                                        // Show initials fallback if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
                                    <span className="text-xl sm:text-2xl font-bold">
                                        {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>

                        {/* User Info & Stats */}
                        <div className="text-center lg:text-left flex-1 w-full">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{userProfile?.name || user?.name}</h2>
                            <p className="text-white/90 text-base sm:text-lg mb-4">
                                {userProfile?.branch ? `${userProfile.branch}` : 'Student'}
                                {userProfile?.semester && ` • ${userProfile.semester} Semester`}
                            </p>

                            {/* Rank and Points */}
                            {loading ? (
                                <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 mb-4">
                                    <div className="text-center animate-pulse">
                                        <div className="h-6 bg-white/20 rounded w-8 mb-1"></div>
                                        <p className="text-xs text-white/80">Rank</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 mb-4">
                                    <div className="text-center">
                                        <p className="text-xl sm:text-2xl font-bold">{dashboardStats?.currentRank ? `#${dashboardStats.currentRank}` : 'Unranked'}</p>
                                        <p className="text-xs text-white/80">Rank</p>
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {loading ? (
                                <div className="animate-pulse">
                                    <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                                        <div className="h-3 bg-white/20 rounded w-16"></div>
                                        <div className="h-3 bg-white/20 rounded w-20 hidden sm:block"></div>
                                    </div>
                                    <div className="w-full bg-white/30 rounded-full h-2 sm:h-2.5">
                                        <div className="bg-white/20 h-2 sm:h-2.5 rounded-full w-1/3"></div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                                        <span>Level {dashboardStats?.level ?? 1}</span>
                                        <span className="hidden sm:inline">{dashboardStats?.pointsToNextLevel ? `${dashboardStats.pointsToNextLevel} to next level` : '250 to next level'}</span>
                                    </div>
                                    <div className="w-full bg-white/30 rounded-full h-2 sm:h-2.5">
                                        <div className="bg-white h-2 sm:h-2.5 rounded-full" style={{ width: `${dashboardStats?.pointsToNextLevel ? ((250 - dashboardStats.pointsToNextLevel) / 250) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Link href="/notes/upload" className="w-full sm:w-auto">
                                <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
                                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span>Upload</span>
                                </button>
                            </Link>
                            <Link href="/notes/download" className="w-full sm:w-auto">
                                <button className="w-full bg-white hover:bg-gray-100 text-purple-600 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2">
                                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <span>Browse</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Notes Uploaded</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.notesUploaded ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Notes Downloaded</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.notesDownloaded ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Achievements</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{`${dashboardStats?.completedAchievements ?? 0}/${dashboardStats?.totalAchievements ?? 12}`}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Requests Fulfilled</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.requestsFulfilled ?? 0}/{dashboardStats?.notesRequested ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Total Views</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.totalViews ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Likes Received</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.likesReceived ?? 0}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate">Students Helped</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats?.helpedStudents ?? 0}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Activity Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Activity Overview</h3>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 w-20"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1 w-16"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-20"></div>
                        </div>
                        <div className="text-center animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 w-20"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1 w-16"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-20"></div>
                        </div>
                        <div className="text-center animate-pulse">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 w-20"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-1 w-16"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-20"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Weekly Activity</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{dashboardStats?.weeklyDownloads ?? 0} downloads</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{dashboardStats?.weeklyPoints ?? 0} points earned</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Monthly Activity</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">{dashboardStats?.monthlyDownloads ?? 0} downloads</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{dashboardStats?.monthlyPoints ?? 0} points earned</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base">Growth Rate</h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">+{dashboardStats?.weeklyGrowth ?? 0}% this week</p>
                            <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">↗ Trending up</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Upload, label: "Upload Notes", color: "blue", action: () => showInfo('Redirecting to upload page...') },
                        { icon: Download, label: "Browse Notes", color: "green", action: () => showInfo('Opening notes browser...') },
                        { icon: Users, label: "Study Groups", color: "purple", action: () => showInfo('Study groups feature coming soon!') },
                        { icon: Calendar, label: "Schedule", color: "orange", action: () => showWarning('Schedule feature is under development') }
                    ].map((actionItem, index) => (
                        <button 
                            key={index} 
                            onClick={actionItem.action}
                            className={`p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-${actionItem.color}-300 hover:bg-${actionItem.color}-50 dark:hover:bg-${actionItem.color}-900/20 transition-all duration-300 group`}
                        >
                            <actionItem.icon className={`h-8 w-8 text-gray-400 group-hover:text-${actionItem.color}-600 dark:group-hover:text-${actionItem.color}-400 mx-auto mb-2`} />
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                                {actionItem.label}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Function to render content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboardContent();
            case 'my-notes':
                return renderMyNotesContent();
            case 'bookmarks':
                return renderBookmarksContent();
            case 'upload':
                return renderUploadContent();
            case 'achievements':
                return renderAchievementsContent();
            case 'analytics':
                return <DashboardAnalytics userStats={dashboardStats} />;
            case 'profile':
                return <UserProfileSection />;
            default:
                return renderDashboardContent();
        }
    };


    // My Notes content
    const renderMyNotesContent = () => (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Notes</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all your uploaded notes</p>
            </div>
            <div className="space-y-4">
                {dashboardStats?.recentNotes?.map((note) => (
                    <div key={note.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{note.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{note.subject} • {note.semester}</p>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                            <Eye className="h-3 w-3 mr-1" />
                                            {note.downloads} downloads
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                            <Heart className="h-3 w-3 mr-1" />
                                            {note.likes} likes
                                        </span>
                                        <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                                            <Star className="h-3 w-3 mr-1" />
                                            {50 + (note.downloads * 5)} points
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => showInfo('Opening note preview...')}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => showSuccess('Note link copied to clipboard!')}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => showInfo('More options...')}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) || (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Notes Yet</h3>
                            <p className="text-gray-600 dark:text-gray-400">Start uploading notes to see them here</p>
                        </div>
                    )}
            </div>
        </div>
    );

    // Bookmarks content
    const renderBookmarksContent = () => (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bookmarks</h1>
                <p className="text-gray-600 dark:text-gray-400">Your saved notes and resources</p>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>This feature is available only for verified students.</span>
                    </p>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Bookmarks Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Start bookmarking notes to see them here</p>
            </div>
        </div>
    );

    // Achievements content
    const renderAchievementsContent = () => (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
                <p className="text-gray-600 dark:text-gray-400">Your badges and milestones</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Top Contributor</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Upload 50 notes</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">24/50 progress</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Helper</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Help 100 students</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">✓ Completed!</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rising Star</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Earn 2000 points</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">1250/2000 progress</p>
                </div>
            </div>
        </div>
    );



    const renderUploadContent = () => {

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    // validateFile(file); // Validation can be added here if needed
                    setUploadFormData({ ...uploadFormData, file });
                    setUploadError('');
                } catch (err: any) {
                    setUploadError(err.message);
                    e.target.value = ''; // Reset file input
                }
            }
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!uploadFormData.file) {
                setUploadError('Please select a file to upload');
                return;
            }

            setIsUploading(true);
            setUploadError('');
            setUploadSuccess(false);
            setUploadProgress(0);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            try {
                // Replace with your actual upload logic
                await new Promise(resolve => setTimeout(resolve, 2000));

                clearInterval(progressInterval);
                setUploadProgress(100);
                setUploadSuccess(true);
                setGithubUrl('https://github.com/your-repo/notes/blob/main/path/to/note.pdf'); // Replace with actual URL
                // Reset form after successful upload
                setUploadFormData({
                    title: '',
                    branch: '',
                    semester: '',
                    subject: '',
                    description: '',
                    tags: '',
                    authorName: '',
                    degree: '',
                    noteType: 'free',
                    file: null
                });
            } catch (err) {
                setUploadError('Upload failed. Please try again.');
                clearInterval(progressInterval);
            } finally {
                setIsUploading(false);
            }
        };

        return (
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Notes</h1>
                    <p className="text-gray-600 dark:text-gray-400">Share your knowledge with the community</p>
                </div>

                {uploadSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800">
                            Notes uploaded successfully! You can view it at <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="underline">{githubUrl}</a>
                        </p>
                    </div>
                )}

                {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="text-red-800">{uploadError}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={uploadFormData.title}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter a descriptive title"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                                <input
                                    type="text"
                                    id="subject"
                                    required
                                    value={uploadFormData.subject}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., Data Structures"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch *</label>
                                <select
                                    id="branch"
                                    required
                                    value={uploadFormData.branch}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, branch: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Branch</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester *</label>
                                <select
                                    id="semester"
                                    required
                                    value={uploadFormData.semester}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, semester: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1st">1st</option>
                                    <option value="2nd">2nd</option>
                                    <option value="3rd">3rd</option>
                                    <option value="4th">4th</option>
                                    <option value="5th">5th</option>
                                    <option value="6th">6th</option>
                                    <option value="7th">7th</option>
                                    <option value="8th">8th</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Degree *</label>
                                <select
                                    id="degree"
                                    required
                                    value={uploadFormData.degree}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, degree: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Degree</option>
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="Diploma">Diploma</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                            <textarea
                                id="description"
                                required
                                rows={4}
                                value={uploadFormData.description}
                                onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="Describe what your notes cover, key topics, and any special features"
                            />
                        </div>

                        <div>
                            <label htmlFor="noteType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="noteType"
                                        value="free"
                                        checked={uploadFormData.noteType === 'free'}
                                        onChange={(e) => setUploadFormData({ ...uploadFormData, noteType: e.target.value as 'free' | 'premium' })}
                                        className="mr-2"
                                    />
                                    <span className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        🆓 FREE
                                    </span>
                                </label>
                                <label className={`flex items-center ${userRole !== 'admin' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                        type="radio"
                                        name="noteType"
                                        value="premium"
                                        checked={uploadFormData.noteType === 'premium'}
                                        onChange={(e) => {
                                            if (userRole === 'admin') {
                                                setUploadFormData({ ...uploadFormData, noteType: e.target.value as 'free' | 'premium' })
                                            } else {
                                                setShowPremiumPopup(true);
                                            }
                                        }}
                                        disabled={userRole !== 'admin'}
                                        className="mr-2"
                                        onClick={(e) => {
                                            if (userRole !== 'admin') {
                                                e.preventDefault();
                                                setShowPremiumPopup(true);
                                            }
                                        }}
                                    />
                                    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${userRole === 'admin'
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                        : 'bg-gray-300 text-gray-500 opacity-60'
                                        }`}>
                                        {userRole === 'admin' ? '⭐ PREMIUM' : '🔒 PREMIUM'}
                                    </span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {userRole === 'admin'
                                    ? 'Free notes are accessible to everyone. Premium notes may have additional features.'
                                    : 'Free notes are accessible to everyone. Premium features are only available for administrators.'
                                }
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Author Name *</label>
                                <input
                                    type="text"
                                    id="authorName"
                                    required
                                    value={uploadFormData.authorName}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, authorName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your name or nickname"
                                />
                            </div>
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (optional)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    value={uploadFormData.tags}
                                    onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., algorithms, programming, exam-prep (comma separated)"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload File *</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    id="file"
                                    required
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                                    className="hidden"
                                    disabled={isUploading}
                                />
                                <label htmlFor="file" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {uploadFormData.file ? uploadFormData.file.name : 'Click to upload your notes'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        PDF, DOC, DOCX, PPT, PPTX, TXT (Max 100MB)
                                    </p>
                                </label>
                            </div>
                        </div>

                        {isUploading && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading || !uploadFormData.file}
                            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${(isUploading || !uploadFormData.file) ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'}`}>
                            {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Notes'}
                        </button>
                    </form>
                </div>

                {/* Premium Restriction Popup */}
                {showPremiumPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 border border-gray-200 dark:border-gray-700 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                        <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Premium Feature Restricted</h3>
                                </div>
                                <button
                                    onClick={() => setShowPremiumPopup(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    The Premium note feature is currently restricted to administrators only. Regular students can only upload free notes.
                                </p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What you can do:</h4>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <li>• Upload notes as FREE for all students</li>
                                        <li>• Earn points for every upload and download</li>
                                        <li>• Help the community grow with quality content</li>
                                        <li>• Contact administrators for premium access</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowPremiumPopup(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Continue with Free
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPremiumPopup(false);
                                        // You can add contact admin functionality here
                                        showInfo('Contact admin functionality would be implemented here');
                                    }}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Contact Admin
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <Head>
                <title>Student Dashboard - JEHUB</title>
                <meta name="description" content="Your personalized student dashboard with notes, analytics, and academic progress tracking" />
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

                <div className="flex min-h-screen">
                    {/* Enhanced Sidebar - Responsive */}
                    <div className={`fixed lg:relative left-0 top-0 h-full lg:h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}>
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
                                                { key: 'my-notes', label: 'My Notes', icon: BookOpen },
                                                { key: 'upload', label: 'Upload', icon: Upload },
                                                { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
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
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active
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
                                                        onClick={() => {
                                                            setActiveSection(item.key);
                                                            setSidebarOpen(false);
                                                        }}
                                                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <IconComponent className={`h-5 w-5 transition-colors duration-200 ${active
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

                    {/* Main Content Area - Responsive */}
                    <div className="flex-1 w-full min-h-screen">
                        {/* Mobile Header */}
                        <div className="lg:hidden sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-30">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">JEHUB</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                {userProfile?.profileImageUrl ? (
                                    <Image 
                                        src={userProfile.profileImageUrl} 
                                        alt="Profile" 
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="h-full overflow-y-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Role-based access control wrapper
export default function ProtectedStudentDashboard() {
    const { user, userProfile } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            // Wait for user to load
            if (!user) {
                const nextUrl = router.asPath || '/dashboard';
                router.push({ pathname: '/login', query: { redirect: nextUrl } });
                return;
            }

            // If userProfile is still loading, wait a bit
            if (userProfile === undefined) {
                return;
            }

            // Only check if user is authenticated - no role restrictions for dashboard
            setHasAccess(true);
            setIsChecking(false);
        };

        checkAccess();
    }, [user, userProfile, router]);

    // Show loading while checking access
    if (isChecking || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Render dashboard if access is granted
    return hasAccess ? <StudentDashboard /> : null;
}
