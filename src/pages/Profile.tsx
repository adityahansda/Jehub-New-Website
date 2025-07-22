import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { User, Edit2, Download, Upload, MessageSquare, Trophy, Star, Calendar, Mail, GraduationCap, AlertCircle, Palette, RefreshCw, Save, Camera, X } from 'lucide-react';
import MobileProfilePage from '../components/mobile/MobileProfilePage';


const Profile = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    college: 'MIT',
    branch: 'Computer Science',
    semester: '6th',
    bio: 'Passionate about data structures and algorithms. Love helping fellow students with programming concepts.',
    joinDate: '2023-08-15',
    avatarSeed: 'Alex Johnson',
    avatarStyle: 'avataaars',
    avatarOptions: {
      backgroundColor: 'b6e3f4',
      clothesColor: '3f82f6',
      eyebrowType: 'Default',
      eyeType: 'Default',
      mouthType: 'Default',
      skinColor: 'fdbcb4',
      hairColor: '724133',
      clothingType: 'Shirt'
    }
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

  // Show demo profile data
  useEffect(() => {
    if (isClient) {
      setProfile(prev => ({
        ...prev,
        name: 'Demo User',
        email: 'demo@example.com',
        joinDate: new Date().toLocaleDateString()
      }));
    }
  }, [isClient]);

  // Load saved avatar
  useEffect(() => {
    if (isClient) {
      const savedAvatar = localStorage.getItem('userAvatar');
      if (savedAvatar) {
        try {
          const avatarData = JSON.parse(savedAvatar);
          setProfile(prev => ({
            ...prev,
            avatarSeed: avatarData.seed,
            avatarStyle: avatarData.style,
            avatarOptions: avatarData.options
          }));
        } catch (error) {
          console.error('Error loading saved avatar:', error);
        }
      }
    }
  }, [isClient]);

  // Show loading state while client-side rendering
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
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
    id: '1',
    name: profile.name,
    email: profile.email,
    avatar: undefined,
    phone: undefined,
    location: undefined,
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

  const handleDemoLogout = () => {
    alert('This is a demo profile. Authentication system has been removed.');
  };

  // Avatar customization options
  const avatarStyles = ['avataaars', 'personas', 'lorelei', 'notionists', 'adventurer', 'fun-emoji'];
  const backgroundColors = [
    { name: 'Sky Blue', value: 'b6e3f4' },
    { name: 'Pink', value: 'fce7f3' },
    { name: 'Green', value: 'd1fae5' },
    { name: 'Purple', value: 'e9d5ff' },
    { name: 'Yellow', value: 'fef3c7' },
    { name: 'Orange', value: 'fed7aa' }
  ];

  const skinColors = [
    { name: 'Light', value: 'fdbcb4' },
    { name: 'Medium', value: 'f8d25c' },
    { name: 'Dark', value: 'd08b5b' },
    { name: 'Pale', value: 'ffd5dc' },
    { name: 'Tan', value: 'edb98a' }
  ];

  const hairColors = [
    { name: 'Brown', value: '724133' },
    { name: 'Black', value: '2c1b18' },
    { name: 'Blonde', value: 'b58143' },
    { name: 'Red', value: 'a55728' },
    { name: 'Gray', value: '4a5568' }
  ];

  const eyeTypes = ['Default', 'Close', 'Cry', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink'];
  const mouthTypes = ['Default', 'Concerned', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue'];
  const clothingTypes = ['Shirt', 'Hoodie', 'Overall', 'BlazerShirt', 'GraphicShirt'];

  // Generate DiceBear avatar URL
  const generateAvatarUrl = () => {
    const baseUrl = `https://api.dicebear.com/7.x/${profile.avatarStyle}/svg`;
    const params = new URLSearchParams({
      seed: profile.avatarSeed,
      backgroundColor: profile.avatarOptions.backgroundColor,
      size: '150'
    });

    // Add style-specific options for avataaars
    if (profile.avatarStyle === 'avataaars') {
      params.append('clothesColor', profile.avatarOptions.clothesColor);
      params.append('eyebrowType', profile.avatarOptions.eyebrowType);
      params.append('eyeType', profile.avatarOptions.eyeType);
      params.append('mouthType', profile.avatarOptions.mouthType);
      params.append('skinColor', profile.avatarOptions.skinColor);
      params.append('hairColor', profile.avatarOptions.hairColor);
      params.append('clothingType', profile.avatarOptions.clothingType);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  // Randomize avatar
  const randomizeAvatar = () => {
    setProfile(prev => ({
      ...prev,
      avatarSeed: Math.random().toString(36).substring(7),
      avatarOptions: {
        ...prev.avatarOptions,
        backgroundColor: backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value,
        clothesColor: ['3f82f6', 'ef4444', '10b981', 'f59e0b', '8b5cf6'][Math.floor(Math.random() * 5)],
        eyebrowType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)],
        eyeType: eyeTypes[Math.floor(Math.random() * eyeTypes.length)],
        mouthType: mouthTypes[Math.floor(Math.random() * mouthTypes.length)],
        skinColor: skinColors[Math.floor(Math.random() * skinColors.length)].value,
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
        clothingType: clothingTypes[Math.floor(Math.random() * clothingTypes.length)]
      }
    }));
  };

  // Save avatar to local storage
  const saveAvatar = () => {
    localStorage.setItem('userAvatar', JSON.stringify({
      seed: profile.avatarSeed,
      style: profile.avatarStyle,
      options: profile.avatarOptions
    }));
    alert('Avatar saved successfully!');
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
                <div className="relative group">
                  <Image
                    src={generateAvatarUrl()}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={() => setShowAvatarCustomizer(true)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Palette className="h-6 w-6 text-white" />
                  </button>
                </div>
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

            {/* Demo Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span className="text-sm text-yellow-700">This is a demo profile. Authentication system has been removed.</span>
              </div>
            </div>
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

      {/* Avatar Customization Modal */}
      {showAvatarCustomizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Customize Your Avatar</h2>
                <button
                  onClick={() => setShowAvatarCustomizer(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preview */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Preview</h3>
                    <div className="flex justify-center mb-4">
                      <Image
                        src={generateAvatarUrl()}
                        alt="Avatar Preview"
                        width={200}
                        height={200}
                        className="rounded-full border-4 border-gray-200"
                      />
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={randomizeAvatar}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Randomize
                      </button>
                      <button
                        onClick={saveAvatar}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Avatar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Avatar Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Avatar Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {avatarStyles.map((style) => (
                        <button
                          key={style}
                          onClick={() => setProfile(prev => ({ ...prev, avatarStyle: style }))}
                          className={`p-2 text-sm rounded-lg transition-colors capitalize ${
                            profile.avatarStyle === style
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name/Seed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Seed</label>
                    <input
                      type="text"
                      value={profile.avatarSeed}
                      onChange={(e) => setProfile(prev => ({ ...prev, avatarSeed: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter name or text to generate avatar"
                    />
                  </div>

                  {/* Background Colors */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Background Color</label>
                    <div className="grid grid-cols-6 gap-3">
                      {backgroundColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setProfile(prev => ({
                            ...prev,
                            avatarOptions: { ...prev.avatarOptions, backgroundColor: color.value }
                          }))}
                          className={`w-12 h-12 rounded-lg border-2 transition-all ${
                            profile.avatarOptions.backgroundColor === color.value
                              ? 'border-blue-500 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: `#${color.value}` }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Avataaars specific options */}
                  {profile.avatarStyle === 'avataaars' && (
                    <>
                      {/* Skin Colors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Skin Color</label>
                        <div className="grid grid-cols-5 gap-3">
                          {skinColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setProfile(prev => ({
                                ...prev,
                                avatarOptions: { ...prev.avatarOptions, skinColor: color.value }
                              }))}
                              className={`w-12 h-12 rounded-full border-2 transition-all ${
                                profile.avatarOptions.skinColor === color.value
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: `#${color.value}` }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Hair Colors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Hair Color</label>
                        <div className="grid grid-cols-5 gap-3">
                          {hairColors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setProfile(prev => ({
                                ...prev,
                                avatarOptions: { ...prev.avatarOptions, hairColor: color.value }
                              }))}
                              className={`w-12 h-12 rounded-full border-2 transition-all ${
                                profile.avatarOptions.hairColor === color.value
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: `#${color.value}` }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Dropdowns for features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Eyes</label>
                          <select
                            value={profile.avatarOptions.eyeType}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              avatarOptions: { ...prev.avatarOptions, eyeType: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {eyeTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mouth</label>
                          <select
                            value={profile.avatarOptions.mouthType}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              avatarOptions: { ...prev.avatarOptions, mouthType: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {mouthTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Clothing</label>
                          <select
                            value={profile.avatarOptions.clothingType}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              avatarOptions: { ...prev.avatarOptions, clothingType: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {clothingTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
