import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { User, Edit2, Download, Upload, MessageSquare, Trophy, Star, Calendar, Mail, GraduationCap, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MobileProfilePage from '../components/mobile/MobileProfilePage';


const Profile = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    college: 'MIT',
    branch: 'Computer Science',
    semester: '6th',
    bio: 'Passionate about data structures and algorithms. Love helping fellow students with programming concepts.',
    joinDate: '2023-08-15'
  });

  // Mobile detection and client-side rendering check
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update profile with user data when user is loaded
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || 'User',
        email: user.email || 'user@email.com',
        joinDate: user.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : '2023-08-15'
      }));
    } else if (isMobile && isClient) {
      // For mobile users without authentication, show default profile data
      setProfile(prev => ({
        ...prev,
        name: 'Guest User',
        email: 'guest@example.com',
        joinDate: new Date().toLocaleDateString()
      }));
    }
  }, [user, isMobile, isClient]);

  // Redirect to login if not authenticated (only for desktop)
  useEffect(() => {
    if (!isClient) return;
    
    // Only redirect to login for desktop users when not authenticated
    if (!loading && !user && !isMobile) {
      router.push('/login');
      return;
    }
  }, [user, loading, router, isMobile, isClient]);

  // Show loading state while checking authentication or client-side rendering
  if (!isClient || (loading && !isMobile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // For mobile users, always show profile (even without authentication)
  // For desktop users, only show if authenticated
  if (!user && !isMobile) {
    return null;
  }

  const stats = {
    totalPoints: 2450,
    notesUploaded: 15,
    notesDownloaded: 43,
    requestsFulfilled: 8,
    rank: 1
  };

  // Mobile profile data
  const mobileStats = {
    rank: stats.rank,
    totalUsers: 5000,
    points: stats.totalPoints,
    notesUploaded: stats.notesUploaded,
    notesDownloaded: stats.notesDownloaded,
    requestsFulfilled: stats.requestsFulfilled,
    streakDays: 7,
    badges: 6
  };

  const recentActivity = [
    {
      id: '1',
      type: 'upload' as const,
      description: 'Uploaded Data Structures Complete Notes',
      timestamp: '2 hours ago',
      points: 50
    },
    {
      id: '2',
      type: 'download' as const,
      description: 'Downloaded Machine Learning Basics',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'request' as const,
      description: 'Fulfilled request for Algorithm Notes',
      timestamp: '2 days ago',
      points: 30
    },
    {
      id: '4',
      type: 'badge' as const,
      description: 'Earned "Top Contributor" badge',
      timestamp: '3 days ago',
      points: 100
    }
  ];

  const mobileUserData = {
    id: user?.$id || '1',
    name: profile.name,
    email: profile.email,
    avatar: user?.avatar,
    phone: user?.phone,
    location: user?.location,
    college: profile.college,
    course: profile.branch,
    semester: profile.semester,
    joinDate: profile.joinDate,
    bio: profile.bio
  };

  // Return mobile profile if on mobile
  if (isMobile) {
    return (
      <MobileProfilePage 
        user={mobileUserData}
        stats={mobileStats}
        recentActivity={recentActivity}
      />
    );
  }

  const desktopRecentActivity = [
    { type: 'upload', title: 'Data Structures Complete Notes', points: 50, date: '2 days ago' },
    { type: 'request', title: 'Fulfilled: Machine Learning Basics', points: 30, date: '1 week ago' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between -mt-16">
              <div className="flex items-center">
                <Image
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
                <div className="ml-4 pt-16">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">{profile.college} • {profile.branch}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Rank #{stats.rank}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{stats.totalPoints} points</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-16">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Details</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="College"
                  />
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Bio"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile.college}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Joined {profile.joinDate}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">{profile.bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Notes Uploaded</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.notesUploaded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Notes Downloaded</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.notesDownloaded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Requests Fulfilled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.requestsFulfilled}</span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {desktopRecentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'request' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                      }`}>
                      {activity.type === 'upload' && <Upload className="h-5 w-5" />}
                      {activity.type === 'request' && <MessageSquare className="h-5 w-5" />}
                      {activity.type === 'post' && <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">+{activity.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;