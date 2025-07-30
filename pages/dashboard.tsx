import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../src/components/dashboard/DashboardLayout';
import TopNavbar from '../src/components/common/TopNavbar';
import UserProfileSection from '../src/components/dashboard/UserProfileSection';
import DashboardAnalytics from '../src/components/dashboard/DashboardAnalytics';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
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
    Lock
} from 'lucide-react';

// Enhanced Mock data with detailed point system - replace with real API calls
const mockStats = {
    totalNotes: 24,
    downloadsReceived: 156,
    pointsEarned: 1250,
    currentRank: 15,
    notesUploaded: 8,
    weeklyGrowth: 12,
    completedAchievements: 6,
    totalAchievements: 12,
    // Enhanced point system
    pointsPerNote: 50,
    pointsPerDownload: 5,
    bonusPoints: 200,
    weeklyPoints: 185,
    monthlyPoints: 750,
    level: 5,
    pointsToNextLevel: 250,
    // Additional tracking
    notesRequested: 23,
    requestsFulfilled: 18,
    helpedStudents: 134,
    weeklyDownloads: 42,
    monthlyDownloads: 156,
    totalViews: 2134,
    likesReceived: 89
};

const mockRecentNotes = [
    {
        id: 1,
        title: "Data Structures and Algorithms - Complete Notes",
        subject: "Computer Science",
        semester: "4th Semester",
        downloads: 45,
        likes: 12,
        uploadDate: "2025-01-25",
        thumbnail: "/images/note-thumb-1.jpg"
    },
    {
        id: 2,
        title: "Engineering Mathematics III - Unit 1-5",
        subject: "Mathematics",
        semester: "3rd Semester",
        downloads: 38,
        likes: 9,
        uploadDate: "2025-01-23",
        thumbnail: "/images/note-thumb-2.jpg"
    },
    {
        id: 3,
        title: "Digital Electronics - Lab Manual",
        subject: "Electronics",
        semester: "2nd Semester",
        downloads: 29,
        likes: 7,
        uploadDate: "2025-01-20",
        thumbnail: "/images/note-thumb-3.jpg"
    }
];

const mockUpcomingEvents = [
    {
        id: 1,
        title: "JEE Advanced Mock Test",
        date: "2025-02-05",
        time: "10:00 AM",
        type: "exam",
        participants: 150
    },
    {
        id: 2,
        title: "Technical Workshop - React.js",
        date: "2025-02-08",
        time: "2:00 PM",
        type: "workshop",
        participants: 75
    },
    {
        id: 3,
        title: "Study Group - GATE Preparation",
        date: "2025-02-10",
        time: "6:00 PM",
        type: "study",
        participants: 25
    }
];

const mockNotifications = [
    {
        id: 1,
        message: "Your note 'Data Structures' received 5 new downloads",
        time: "2 hours ago",
        type: "success",
        read: false
    },
    {
        id: 2,
        message: "New counselling update for engineering admissions",
        time: "4 hours ago",
        type: "info",
        read: false
    },
    {
        id: 3,
        message: "You've earned 50 points for active participation",
        time: "1 day ago",
        type: "achievement",
        read: true
    }
];


export default function StudentDashboard() {
    const { user, userProfile, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userStats, setUserStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Logout handler
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    // Fetch user stats
    useEffect(() => {
        const fetchUserStats = async () => {
            if (user?.email) {
                try {
                    setLoading(true);
                    const stats = await userService.getUserStatsWithComparison(user.email);
                    setUserStats(stats);
                } catch (error) {
                    console.error('Error fetching user stats:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserStats();
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


                        {/* User Info & Stats */}
                        <div className="text-center lg:text-left flex-1">
                            <h2 className="text-3xl font-bold mb-2">{userProfile?.name || user?.name}</h2>
                            <p className="text-white/90 text-lg mb-4">
                                {userProfile?.branch ? `${userProfile.branch}` : 'Student'}
                                {userProfile?.semester && ` • ${userProfile.semester} Semester`}
                            </p>

                            {/* Rank and Points */}
                            <div className="flex items-center justify-center lg:justify-start space-x-6 mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{userStats?.currentRank || 'N/A'}</p>
                                    <p className="text-xs text-white/80">Rank</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{userStats?.pointsEarned || 'N/A'}</p>
                                    <p className="text-xs text-white/80">Points</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span>Level {userStats?.level || 'N/A'}</span>
                                    <span>{userStats?.pointsToNextLevel ? `${userStats.pointsToNextLevel} to next level` : ''}</span>
                                </div>
                                <div className="w-full bg-white/30 rounded-full h-2.5">
                                    <div className="bg-white h-2.5 rounded-full" style={{ width: `${(userStats?.pointsEarned / (userStats?.pointsEarned + userStats?.pointsToNextLevel)) * 100 || 0}%` }}></div>
                                </div>
                            </div>
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
            </div>



            {/* Modern Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Notes Uploaded</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.notesUploaded || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Notes Downloaded</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.downloadsReceived || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Points Earned</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats?.pointsEarned || 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Completed Achievements</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{`${userStats?.completedAchievements || 0}/${userStats?.totalAchievements || 0}`}</p>
                    </div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Requests Fulfilled</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.requestsFulfilled}/{mockStats.notesRequested}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                        <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.totalViews}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Likes Received</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.likesReceived}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Students Helped</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.helpedStudents}</p>
                    </div>
                </div>
            </div>

            {/* Activity Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Activity Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Weekly Activity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{mockStats.weeklyDownloads} downloads</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mockStats.weeklyPoints} points earned</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Monthly Activity</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{mockStats.monthlyDownloads} downloads</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mockStats.monthlyPoints} points earned</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Growth Rate</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">+{mockStats.weeklyGrowth}% this week</p>
                        <p className="text-sm text-green-600 dark:text-green-400">↗ Trending up</p>
                    </div>
                </div>
            </div>

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
                return <DashboardAnalytics userStats={userStats} loading={loading} />;
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
                {mockRecentNotes.map((note) => (
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
                                            {mockStats.pointsPerNote + (note.downloads * mockStats.pointsPerDownload)} points
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Share2 className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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
                                    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                        userRole === 'admin' 
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
                                        alert('Contact admin functionality would be implemented here');
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
                <div className="flex">
                    {/* Enhanced Sidebar - Fixed */}
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
                                                        onClick={() => setActiveSection(item.key)}
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
                                                        onClick={() => setActiveSection(item.key)}
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

                    {/* Main Content Area - Properly aligned */}
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