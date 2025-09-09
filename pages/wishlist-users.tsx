import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/userService';
import { 
  Search, 
  Users, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Award,
  Star,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  List,
  Grid3X3,
  Link as LinkIcon,
  Shield,
  Settings,
  Edit,
  Save,
  X,
  UserCheck,
  UserX,
  AlertTriangle,
  Eye,
  Mail,
  User,
  MapPin
} from 'lucide-react';

interface WishlistUser {
  id?: string;
  name: string;
  email?: string;
  telegramId?: string;
  status?: string;
  isPremium?: boolean;
  collegeName?: string;
  branch?: string;
  degree?: string;
  yearsOfStudy?: string;
  createdAt?: string;
  hidden?: boolean;
}

interface CollegeSummary {
  collegeName: string;
  count: number;
  users: WishlistUser[];
}

const WishlistUsers: React.FC = () => {
  const [users, setUsers] = useState<WishlistUser[]>([]);
  const [collegeSummary, setCollegeSummary] = useState<CollegeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'users' | 'colleges'>('users');
  const [expandedCollege, setExpandedCollege] = useState<string | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [showReferralSection, setShowReferralSection] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<WishlistUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchWishlistData();
    checkAdminRole();
  }, []);

  // Check if user has admin role
  const checkAdminRole = async () => {
    if (user?.email) {
      try {
        const profile = await userService.getUserProfile(user.email);
        console.log('User profile:', profile);
        setUserProfile(profile);
        const adminRoles = ['admin', 'manager', 'intern'];
        const hasAdminRole = adminRoles.includes(profile?.role?.toLowerCase() || '');
        console.log('Admin role check:', {
          userEmail: user.email,
          userRole: profile?.role,
          hasAdminRole,
          adminRoles
        });
        
        setIsAdmin(hasAdminRole);
        
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      }
    } else {
      console.log('No authenticated user - admin access denied');
      setIsAdmin(false);
    }
  };

  // Fetch user's referral code if logged in
  useEffect(() => {
    const fetchUserReferralCode = async () => {
      if (user?.email) {
        try {
          const referralCode = await userService.getUserReferralCodeByEmail(user.email);
          if (referralCode) {
            setUserReferralCode(referralCode);
            setShowReferralSection(true);
          }
        } catch (error) {
          console.error('Error fetching user referral code:', error);
        }
      }
    };

    fetchUserReferralCode();
  }, [user]);

  // Generate referral link for beta-wishlist
  const getReferralLink = () => {
    if (!user?.email || !userReferralCode) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/beta-wishlist?ref=${userReferralCode}`;
  };

  // Copy referral link to clipboard
  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        setReferralMessage('Referral link copied to clipboard!');
        setTimeout(() => setReferralMessage(''), 3000);
      } catch (err) {
        console.error('Failed to copy referral link:', err);
        setReferralMessage('Failed to copy referral link');
        setTimeout(() => setReferralMessage(''), 3000);
      }
    }
  };

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use Appwrite API which is faster and more reliable
      const response = await axios.get('/api/beta-wishlist-appwrite', {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Wishlist data loaded:', {
        total: response.data.total,
        entries: response.data.entries?.length || 0,
        colleges: response.data.collegeSummary?.length || 0
      });
      
      setUsers(response.data.entries || []);
      setCollegeSummary(response.data.collegeSummary || []);
      setTotalCount(response.data.totalCount || response.data.total || 0);
    } catch (err: any) {
      console.error('Error fetching wishlist data:', err);
      const errorMessage = err.code === 'ECONNABORTED' 
        ? 'Request timed out. Please try again.' 
        : err.response?.data?.error || 'Failed to fetch wishlist data. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Admin function to update user status
  const updateUserStatus = async (user: WishlistUser, newStatus: string) => {
    if (!isAdmin || !user.id) {
      console.error('Unauthorized or invalid user. Admin:', isAdmin, 'User ID:', user.id);
      alert('Cannot update user: Missing user ID or insufficient permissions');
      return;
    }

    try {
      setIsUpdating(true);
      
      console.log(`Updating user ${user.name} (ID: ${user.id}) status to ${newStatus}`);
      
      const response = await axios.post('/api/admin/update-user-status', {
        userId: user.id,
        status: newStatus
      });

      if (response.data.success) {
        // Update the user in local state - use lowercase status for consistency
        const updatedStatus = newStatus.toLowerCase();
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, status: updatedStatus } : u
          )
        );
        
        // Update college summary as well
        setCollegeSummary(prevSummary => 
          prevSummary.map(college => ({
            ...college,
            users: college.users.map(u => 
              u.id === user.id ? { ...u, status: updatedStatus } : u
            )
          }))
        );
        
        console.log(`User ${user.name} status updated to ${newStatus}`);
        alert(`Successfully updated ${user.name}'s status to ${newStatus}`);
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      alert(`Error updating user status: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Admin function to view user details
  const viewUserDetails = (user: WishlistUser) => {
    if (!isAdmin) return;
    
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCollegeSummary = collegeSummary
    .map(college => ({
      ...college,
      users: college.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(college => college.users.length > 0)
    .map(college => ({
      ...college,
      count: college.users.length
    }));

  if (loading) {
    return (
      <>
        <Head>
          <title>Wishlist Users - JEHub</title>
          <meta name="description" content="View all users registered for JEHub Beta Program" />
        </Head>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div 
                className="inline-flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200/20 border-t-purple-400"></div>
                  <Users className="absolute inset-0 h-8 w-8 m-auto text-purple-400" />
                </div>
              </motion.div>
              <motion.p 
                className="text-white mt-6 text-lg font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Loading wishlist data...
              </motion.p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Wishlist Users - JEHub</title>
        </Head>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div 
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-2xl p-8">
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
                  <p className="text-red-400 mb-6">{error}</p>
                  <motion.button
                    onClick={fetchWishlistData}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Again
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Wishlist Users - JEHub Beta Program</title>
        <meta name="description" content="View all users registered for JEHub Beta Program with their college information" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          >
            {/* Enhanced Header */}
            <div className="relative bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-indigo-700/80 backdrop-blur-sm px-4 sm:px-8 py-6 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm" />
              <div className="relative">
                <motion.div 
                  className="flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-white/10 p-3 rounded-2xl mr-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                      JEHub Beta Community
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base font-medium">
                      Registered Users Dashboard
                    </p>
                  </div>
                </motion.div>
                
                {/* Stats Cards */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{totalCount}</div>
                    <div className="text-purple-100 text-sm">Total Users</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{users.filter(u => u.isPremium).length}</div>
                    <div className="text-purple-100 text-sm">Premium Users</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Building2 className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{collegeSummary.length}</div>
                    <div className="text-purple-100 text-sm">Colleges</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Referral Link Section - Only show for logged-in users */}
            {showReferralSection && user && (
              <motion.div 
                className="px-4 sm:px-8 py-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <LinkIcon className="h-5 w-5 mr-2 text-purple-400" />
                      Your Referral Link
                    </h3>
                    <span className="text-xs text-purple-300 bg-purple-900/50 px-2 py-1 rounded-full">
                      Earn 10 points per referral
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        readOnly
                        value={getReferralLink()}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 text-gray-200 rounded-lg text-sm font-mono"
                        placeholder="Your referral link will appear here..."
                      />
                    </div>
                    <button
                      onClick={copyReferralLink}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center min-w-[120px]"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                  
                  {referralMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-green-400 text-center"
                    >
                      {referralMessage}
                    </motion.div>
                  )}
                  
                  <p className="text-xs text-gray-400 text-center">
                    Share this link with friends to earn points when they join the beta program!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Enhanced Controls */}
            <div className="px-4 sm:px-8 py-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggle View Mode and Admin Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setViewMode('users')}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm focus:outline-none transition ${
                        viewMode === 'users' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <List className="h-4 w-4" />
                      <span>All Users</span>
                    </button>
                    <button
                      onClick={() => setViewMode('colleges')}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm focus:outline-none transition ${
                        viewMode === 'colleges' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span>Colleges</span>
                    </button>
                  </div>
                  
                  {/* Admin Menu Button - Only visible to admin users */}
                  {isAdmin && (
                    <div className="flex items-center border-l border-white/20 pl-4">
                      <div className="bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/30 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 text-red-300">
                          <Shield className="h-4 w-4" />
                          <span className="text-xs font-semibold">ADMIN PANEL</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-8 py-4 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                {viewMode === 'users' ? (
                  filteredUsers.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-4">😢</div>
                    <div className="text-sm sm:text-base">
                      {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 px-1">
                      Showing {filteredUsers.length} of {users.length} users in the system
                    </div>
                    <div className="grid gap-4 sm:gap-6">
                      <AnimatePresence>
                        {filteredUsers.map((user, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-4">
                              {/* User Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                                    {user.name}
                                  </h3>
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                                  user.status === 'Selected' || user.status === 'selected' 
                                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                    : user.status === 'Rejected' || user.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }`}>
                                  {user.status === 'Selected' || user.status === 'selected' ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : user.status === 'Rejected' || user.status === 'rejected' ? (
                                    <XCircle className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  <span>{user.status || 'Pending'}</span>
                                </div>
                              </div>
                              
                              {/* Premium Badge */}
                              {user.isPremium && (
                                <div className="flex justify-start">
                                  <div className="relative group">
                                    <motion.div 
                                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-yellow-400/50 cursor-help"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Crown className="h-3 w-3" />
                                      <span>PREMIUM</span>
                                      <Star className="h-3 w-3" />
                                    </motion.div>
                                    
                                    {/* Enhanced Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 border border-yellow-400/20">
                                      <div className="text-center">
                                        <div className="flex items-center justify-center space-x-1 font-semibold text-yellow-400 mb-1">
                                          <Crown className="h-3 w-3" />
                                          <span>Premium Member</span>
                                          <Star className="h-3 w-3" />
                                        </div>
                                        <div className="text-gray-300">Loyal community member for 1+ years</div>
                                        <div className="text-xs text-gray-400 mt-1">Early Telegram community member</div>
                                      </div>
                                      {/* Tooltip arrow */}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Admin Controls - Only visible to admin users */}
                              {isAdmin && (
                                <div className="border-t border-white/10 pt-4 mt-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-400 flex items-center space-x-2">
                                      <Shield className="h-3 w-3" />
                                      <span>Admin Actions</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {/* View Details Button */}
                                      <motion.button
                                        onClick={() => viewUserDetails(user)}
                                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-xs transition-colors duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isUpdating}
                                      >
                                        <Eye className="h-3 w-3" />
                                        <span>View</span>
                                      </motion.button>
                                      
                                      {/* Debug Info */}
                                      {isAdmin && (
                                        <div className="text-xs text-gray-500 mb-2">
                                          ID: {user.id || 'No ID'} | Status: {user.status || 'No status'}
                                        </div>
                                      )}
                                      
                                      {/* Approve Button - Only if not already selected */}
                                      {user.status?.toLowerCase() !== 'selected' && (
                                        <motion.button
                                          onClick={() => updateUserStatus(user, 'Selected')}
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 rounded-lg text-xs transition-colors duration-200"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          disabled={isUpdating}
                                        >
                                          <UserCheck className="h-3 w-3" />
                                          <span>Approve</span>
                                        </motion.button>
                                      )}
                                      
                                      {/* Reject Button - Only if not already rejected */}
                                      {user.status?.toLowerCase() !== 'rejected' && (
                                        <motion.button
                                          onClick={() => updateUserStatus(user, 'Rejected')}
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded-lg text-xs transition-colors duration-200"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          disabled={isUpdating}
                                        >
                                          <UserX className="h-3 w-3" />
                                          <span>Reject</span>
                                        </motion.button>
                                      )}
                                      
                                      {/* Reset to Pending Button - Only if already approved/rejected */}
                                      {(user.status?.toLowerCase() === 'selected' || user.status?.toLowerCase() === 'rejected') && (
                                        <motion.button
                                          onClick={() => updateUserStatus(user, 'Pending')}
                                          className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-xs transition-colors duration-200"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          disabled={isUpdating}
                                        >
                                          <Clock className="h-3 w-3" />
                                          <span>Reset</span>
                                        </motion.button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isUpdating && (
                                    <div className="mt-2 flex items-center justify-center">
                                      <div className="flex items-center space-x-2 text-xs text-blue-400">
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent"></div>
                                        <span>Updating...</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </>
                  )
                ) : (
                  filteredCollegeSummary.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-4">🏫</div>
                      <div className="text-sm sm:text-base">
                        {searchTerm ? 'No colleges found matching your search.' : 'No data available yet.'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 px-1">
                        Showing {filteredCollegeSummary.length} colleges
                      </div>
                      <div className="grid gap-4 sm:gap-6">
                        <AnimatePresence>
                          {filteredCollegeSummary.map((college, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.02 }}
                              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-blue-400 transition-all duration-300 shadow-lg"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                    <h3 className="text-lg sm:text-xl font-bold text-white">
                                      {college.collegeName}
                                    </h3>
                                  </div>
                                  <button
                                    onClick={() => setExpandedCollege(prev => prev === college.collegeName ? null : college.collegeName)}
                                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 focus:outline-none"
                                  >
                                    <span>{expandedCollege === college.collegeName ? 'Show Less' : 'Show More'}</span>
                                    {expandedCollege === college.collegeName ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                </div>
                                <div className="text-purple-200 text-sm sm:text-base">
                                  {college.count} User{college.count > 1 ? 's' : ''}
                                </div>
                                {expandedCollege === college.collegeName && (
                                  <ul className="space-y-2 ml-2">
                                    {college.users.map(user => (
                                      <li key={user.name} className="text-purple-200 text-sm pl-2 border-l-2 border-purple-500">
                                        {user.name} {user.isPremium && <Crown className="inline h-4 w-4 text-yellow-400 ml-2" />}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* User Details Modal - Only visible to admin users */}
      {showUserModal && selectedUser && isAdmin && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-900 to-purple-900/50 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-indigo-700/80 backdrop-blur-sm px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">User Details</h2>
                    <p className="text-purple-100 text-sm">Beta Program Application</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-400" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
                    <div className="text-white text-sm mt-1">{selectedUser.name}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                    <div className="text-white text-sm mt-1">{selectedUser.email || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram ID</label>
                    <div className="text-white text-sm mt-1">{selectedUser.telegramId || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration Date</label>
                    <div className="text-white text-sm mt-1">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Not available'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-400" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">College</label>
                    <div className="text-white text-sm mt-1">{selectedUser.collegeName || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</label>
                    <div className="text-white text-sm mt-1">{selectedUser.branch || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Degree</label>
                    <div className="text-white text-sm mt-1">{selectedUser.degree || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Years of Study</label>
                    <div className="text-white text-sm mt-1">{selectedUser.yearsOfStudy || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-400" />
                  Status & Actions
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          selectedUser.status === 'Selected' || selectedUser.status === 'selected' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : selectedUser.status === 'Rejected' || selectedUser.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        }`}>
                          {selectedUser.status === 'Selected' || selectedUser.status === 'selected' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : selectedUser.status === 'Rejected' || selectedUser.status === 'rejected' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>{selectedUser.status || 'Pending'}</span>
                        </div>
                        {selectedUser.isPremium && (
                          <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                            <Crown className="h-3 w-3" />
                            <span>Premium</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {selectedUser.status !== 'Selected' && selectedUser.status !== 'selected' && (
                      <motion.button
                        onClick={() => {
                          updateUserStatus(selectedUser, 'Selected');
                          setShowUserModal(false);
                          setSelectedUser(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 rounded-lg text-sm transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isUpdating}
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Approve User</span>
                      </motion.button>
                    )}
                    
                    {selectedUser.status !== 'Rejected' && selectedUser.status !== 'rejected' && (
                      <motion.button
                        onClick={() => {
                          updateUserStatus(selectedUser, 'Rejected');
                          setShowUserModal(false);
                          setSelectedUser(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 rounded-lg text-sm transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isUpdating}
                      >
                        <UserX className="h-4 w-4" />
                        <span>Reject User</span>
                      </motion.button>
                    )}
                    
                    {(selectedUser.status === 'Selected' || selectedUser.status === 'selected' || selectedUser.status === 'Rejected' || selectedUser.status === 'rejected') && (
                      <motion.button
                        onClick={() => {
                          updateUserStatus(selectedUser, 'Pending');
                          setShowUserModal(false);
                          setSelectedUser(null);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isUpdating}
                      >
                        <Clock className="h-4 w-4" />
                        <span>Reset to Pending</span>
                      </motion.button>
                    )}
                  </div>
                  
                  {isUpdating && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center space-x-2 text-sm text-blue-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                        <span>Updating user status...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </>
  );
};

export default WishlistUsers;

