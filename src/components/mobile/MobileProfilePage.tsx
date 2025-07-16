import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Star, 
  Trophy, 
  Download, 
  Upload, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  School, 
  Award, 
  BookOpen, 
  TrendingUp,
  Check,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  LogOut,
  ArrowLeft,
  Heart,
  Globe,
  CreditCard,
  Trash2,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfilePageProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
    location?: string;
    college?: string;
    course?: string;
    semester?: string;
    joinDate?: string;
    bio?: string;
  };
  stats: {
    rank: number;
    totalUsers: number;
    points: number;
    notesUploaded: number;
    notesDownloaded: number;
    requestsFulfilled: number;
    streakDays: number;
    badges: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'download' | 'request' | 'badge';
    description: string;
    timestamp: string;
    points?: number;
  }>;
}

const MobileProfilePage: React.FC<ProfilePageProps> = ({ 
  user: initialUser, 
  stats, 
  recentActivity 
}) => {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(initialUser);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsImageUploading(true);
      // Simulate upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newUser = { ...user, avatar: e.target?.result as string };
          setUser(newUser);
          setEditedUser(newUser);
          setIsImageUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    // Here you would normally save to database
    console.log('Saving user data:', editedUser);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Profile' : 'My Profile'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="text-green-600 font-semibold"
              >
                <Check className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-20 pb-20">
        {!isEditing ? (
          // Profile View
          <div className="bg-white px-6 py-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200">
                  <Camera className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-500 mb-6">@{user.name.toLowerCase().replace(' ', '')}</p>
              
              <button
                onClick={() => setIsEditing(true)}
                className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Menu Items */}
            <div className="mt-8 space-y-1">
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Favourites</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Downloads</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Language</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Location</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Subscription</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Clear cache</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Clear history</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">Log out</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        ) : (
          // Edit Profile View
          <div className="bg-white px-6 py-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                  {isImageUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Charlotte king"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@johnkinggraphics.gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User name</label>
                <input
                  type="text"
                  value={editedUser.name.toLowerCase().replace(' ', '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@johnkinggraphics"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value="••••••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                <div className="flex">
                  <select className="px-3 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50">
                    <option>+91</option>
                  </select>
                  <input
                    type="tel"
                    value={editedUser.phone || '6895312'}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="6895312"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileProfilePage;

