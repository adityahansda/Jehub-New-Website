import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  MessageCircle,
  Crown,
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  CheckCheck,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User
} from 'lucide-react';

interface TelegramMember {
  user_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  display_name: string;
  status: string;
  is_premium?: boolean;
  joined_at: string;
  left_at?: string;
  is_active: boolean;
  is_wishlist_verified?: boolean;
}

interface TelegramStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
}

interface VerificationResponse {
  is_member: boolean;
  isVerified: boolean;
  error?: string;
  user_data?: {
    user_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    display_name: string;
    status: string;
    is_active: boolean;
    joined_at: string;
  };
}

interface VerificationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: VerificationResponse;
  error?: string;
}

const TelegramMembersContent: React.FC = () => {
  const [members, setMembers] = useState<TelegramMember[]>([]);
  const [allMembers, setAllMembers] = useState<TelegramMember[]>([]);
  const [stats, setStats] = useState<TelegramStats>({ total: 0, active: 0, inactive: 0, verified: 0, unverified: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<'joined_at' | 'username' | 'display_name' | 'status'>('joined_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTelegramMembers();
  }, []);

  const fetchTelegramMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/telegram-members');
      setMembers(response.data.members || []);
      setAllMembers(response.data.allMembers || []);
      
      // Calculate verification stats
      const allMembersData = response.data.allMembers || [];
      const verifiedCount = allMembersData.filter((m: TelegramMember) => m.is_wishlist_verified).length;
      const unverifiedCount = allMembersData.length - verifiedCount;
      
      setStats({
        ...response.data.stats,
        verified: verifiedCount,
        unverified: unverifiedCount
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch Telegram members');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTelegramMembers();
    setRefreshing(false);
  };

  const handleVerify = async (username?: string) => {
    const usernameToVerify = username || telegramUsername.trim();
    
    if (!usernameToVerify) {
      setVerification({
        status: 'error',
        error: 'Please enter your Telegram username.'
      });
      return;
    }

    setVerification({ status: 'loading' });

    try {
      const cleanUsername = usernameToVerify.startsWith('@') 
        ? usernameToVerify.substring(1) 
        : usernameToVerify;

      const response = await fetch(`/api/verify-telegram?username=${encodeURIComponent(cleanUsername)}`);
      const data: VerificationResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerification({
        status: 'success',
        data
      });

    } catch (error: any) {
      setVerification({
        status: 'error',
        error: error.message || 'Failed to verify membership'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const displayMembers = showInactive ? allMembers : members;
  
  // Apply filters
  let filteredMembers = displayMembers.filter(member => {
    const displayName = member.display_name || '';
    const firstName = member.first_name || '';
    const username = member.username || '';
    const searchLower = searchTerm.toLowerCase();
    
    return displayName.toLowerCase().includes(searchLower) ||
           firstName.toLowerCase().includes(searchLower) ||
           username.toLowerCase().includes(searchLower);
  });

  // Apply verification filter
  if (showVerifiedOnly) {
    filteredMembers = filteredMembers.filter(member => member.is_wishlist_verified);
  }

  // Apply sorting
  filteredMembers.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'joined_at':
        aValue = new Date(a.joined_at || 0).getTime();
        bValue = new Date(b.joined_at || 0).getTime();
        break;
      case 'username':
        aValue = (a.username || '').toLowerCase();
        bValue = (b.username || '').toLowerCase();
        break;
      case 'display_name':
        aValue = (a.display_name || a.first_name || '').toLowerCase();
        bValue = (b.display_name || b.first_name || '').toLowerCase();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const getStatusIcon = (member: TelegramMember) => {
    if (!member.is_active) return <UserX className="h-4 w-4 text-red-400" />;
    if (member.status === 'administrator' || member.status === 'creator') return <Crown className="h-4 w-4 text-yellow-400" />;
    return <UserCheck className="h-4 w-4 text-green-400" />;
  };

  const getStatusText = (member: TelegramMember) => {
    if (!member.is_active) return 'Left';
    if (member.status === 'administrator' || member.status === 'creator') return member.status.charAt(0).toUpperCase() + member.status.slice(1);
    return 'Member';
  };

  const getStatusColor = (member: TelegramMember) => {
    if (!member.is_active) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (member.status === 'administrator' || member.status === 'creator') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  const getVerificationIcon = (member: TelegramMember) => {
    if (member.is_wishlist_verified) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    return <AlertCircle className="h-5 w-5 text-orange-400" />;
  };

  const getVerificationText = (member: TelegramMember) => {
    if (member.is_wishlist_verified) {
      return 'Verified Student';
    }
    return 'Not Verified';
  };

  const getVerificationColor = (member: TelegramMember) => {
    if (member.is_wishlist_verified) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
    return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (field: 'joined_at' | 'username' | 'display_name' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const renderVerificationResult = () => {
    if (verification.status === 'loading') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-blue-900/30 border border-blue-400/30 rounded-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
            <p className="text-blue-200 text-lg">Verifying membership...</p>
          </div>
        </motion.div>
      );
    }

    if (verification.status === 'error') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-red-900/30 border border-red-400/30 rounded-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <div>
              <h3 className="text-red-200 font-semibold text-lg mb-2">Verification Failed</h3>
              <p className="text-red-300">{verification.error}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (verification.status === 'success' && verification.data) {
      const { is_member, isVerified, user_data } = verification.data;

      if (!is_member) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 bg-amber-900/30 border border-amber-400/30 rounded-xl"
          >
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-amber-200 font-semibold text-xl mb-4">Not a Member</h3>
              <p className="text-amber-300 mb-6">
                This user is not currently a member of our Telegram group.
              </p>
              <div className="space-y-4">
                <a
                  href="https://t.me/JharkhandEnginnersHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <span>Join Telegram Group</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          {/* Verification Status */}
          <div className={`p-6 border rounded-xl ${
            isVerified 
              ? 'bg-green-900/30 border-green-400/30' 
              : 'bg-amber-900/30 border-amber-400/30'
          }`}>
            <div className="text-center">
              {isVerified ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-green-200 font-semibold text-xl mb-2">Membership Verified! ✅</h3>
                  <p className="text-green-300">
                    This user is a verified member with full access to all features.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-amber-200 font-semibold text-xl mb-2">Member - Not Verified</h3>
                  <p className="text-amber-300 mb-4">
                    This user is a member but needs verification for full access.
                  </p>
                  <div className="bg-amber-800/30 border border-amber-600/30 rounded-lg p-4">
                    <p className="text-amber-200 text-sm mb-3">To get verified:</p>
                    <div className="space-y-2 text-left text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">1.</span>
                        <span className="text-amber-300">Go to the Telegram group</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">2.</span>
                        <span className="text-amber-300">Send the command: <code className="bg-amber-700/50 px-2 py-1 rounded">/verify</code></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400 font-bold">3.</span>
                        <span className="text-amber-300">Wait for admin verification</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Data Display */}
          {user_data && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden">

              
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-700/50">
                <h4 className="text-white font-semibold text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Member Information</span>
                </h4>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <p className="text-white font-medium">
                        {user_data.display_name || user_data.first_name || 'Not available'}
                      </p>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center space-x-2">
                      <p className="text-white font-medium">
                        @{user_data.username || 'Not set'}
                      </p>
                      {user_data.username && (
                        <button
                          onClick={() => copyToClipboard(`@${user_data.username}`)}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                          title="Copy username"
                        >
                          {copied ? <CheckCheck className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user_data)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user_data.status.charAt(0).toUpperCase() + user_data.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Joined</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-white">{user_data.joined_at && user_data.joined_at !== 'Unknown' ? formatDate(user_data.joined_at) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Status */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user_data.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white font-medium">
                      {user_data.is_active ? 'Active Member' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Telegram Group Members - JEHub</title>
          <meta name="description" content="View all members of JEHub Telegram group" />
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
                  <MessageCircle className="absolute inset-0 h-8 w-8 m-auto text-purple-400" />
                </div>
              </motion.div>
              <motion.p 
                className="text-white mt-6 text-lg font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Loading Telegram members...
              </motion.p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Telegram Members - JEHub</title>
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
                  <UserX className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
                  <p className="text-red-400 mb-6">{error}</p>
                  <motion.button
                    onClick={fetchTelegramMembers}
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>All Telegram Group Members - JEHub Community</title>
        <meta name="description" content="View all members of JEHub Telegram group community including active and left members" />
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
            <div className="relative bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-indigo-700/80 backdrop-blur-sm px-4 sm:px-8 py-6 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />
              <div className="relative">
                <motion.div 
                  className="flex items-center justify-center mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-white/10 p-3 rounded-2xl mr-4">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                      All JEHub Telegram Members
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base font-medium">
                      Complete Member Directory (Active & Left)
                    </p>
                  </div>
                </motion.div>
                
                {/* Enhanced Stats Cards */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-blue-100 text-sm">Total Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <UserCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.active}</div>
                    <div className="text-blue-100 text-sm">Active Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.verified}</div>
                    <div className="text-green-100 text-sm">Verified Students</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <AlertCircle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.unverified}</div>
                    <div className="text-orange-100 text-sm">Unverified</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{members.filter(m => m.is_premium).length}</div>
                    <div className="text-yellow-100 text-sm">Premium Members</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Verification Section */}
            <div className="px-4 sm:px-8 py-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  🔍 Verify Member Status
                </h2>
                <p className="text-gray-300">
                  Check if a specific user is a member and their verification status
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="telegram-username" className="block text-sm font-medium text-gray-300 mb-2">
                      Telegram Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="telegram-username"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        placeholder="Enter username (without @)"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-all duration-200"
                        disabled={verification.status === 'loading'}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400 text-sm">@</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => handleVerify()}
                      disabled={verification.status === 'loading' || !telegramUsername.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
                    >
                      {verification.status === 'loading' ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin mr-2 inline" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2 inline" />
                          Verify
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Verification Result */}
                <AnimatePresence mode="wait">
                  {renderVerificationResult()}
                </AnimatePresence>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="px-4 sm:px-8 py-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 placeholder-gray-400 text-sm sm:text-base"
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

                {/* Enhanced Controls */}
                <div className="flex flex-wrap gap-3">
                  {/* Sorting Controls */}
                  <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-lg p-1">
                    <span className="text-xs text-gray-400 px-2">Sort by:</span>
                    <button
                      onClick={() => handleSort('joined_at')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition ${
                        sortBy === 'joined_at' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Calendar className="h-3 w-3" />
                      <span>Date</span>
                      {getSortIcon('joined_at')}
                    </button>
                    <button
                      onClick={() => handleSort('username')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition ${
                        sortBy === 'username' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <User className="h-3 w-3" />
                      <span>Username</span>
                      {getSortIcon('username')}
                    </button>
                    <button
                      onClick={() => handleSort('display_name')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition ${
                        sortBy === 'display_name' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      <span>Name</span>
                      {getSortIcon('display_name')}
                    </button>
                    <button
                      onClick={() => handleSort('status')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition ${
                        sortBy === 'status' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Shield className="h-3 w-3" />
                      <span>Status</span>
                      {getSortIcon('status')}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm focus:outline-none transition ${
                      showVerifiedOnly ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>{showVerifiedOnly ? 'Show All' : 'Verified Only'}</span>
                  </button>
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm focus:outline-none transition ${
                      showInactive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showInactive ? 'Hide Left Users' : 'Show All Users'}</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm focus:outline-none transition text-gray-300 hover:bg-white/10 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-8 py-4 sm:py-6">
              <div className="space-y-3 sm:space-y-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-4">👥</div>
                    <div className="text-sm sm:text-base">
                      {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 px-1">
                      Showing {filteredMembers.length} of {displayMembers.length} members
                      {showVerifiedOnly && ` (${stats.verified} verified)`}
                      {!showInactive && ` (including left users)`}
                      <span className="ml-2 text-blue-400">
                        • Sorted by {sortBy === 'joined_at' ? 'Date' : sortBy === 'username' ? 'Username' : sortBy === 'display_name' ? 'Name' : 'Status'} 
                        ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                      </span>
                    </div>
                    <div className="grid gap-4 sm:gap-6">
                      <AnimatePresence>
                        {filteredMembers.map((member, index) => (
                          <motion.div
                            key={member.user_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                            className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl ${
                              !member.is_active ? 'opacity-75 border-red-500/30' : ''
                            } ${member.is_wishlist_verified ? 'ring-2 ring-green-500/20' : ''}`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-4">
                              {/* Member Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                      {member.display_name || member.first_name || 'Unknown User'}
                                    </h3>
                                    {member.is_wishlist_verified && (
                                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Verified</span>
                                      </div>
                                    )}
                                  </div>
                                  {/* Enhanced Username Display */}
                                  <div className="flex items-center space-x-3 mb-2">
                                    {member.username ? (
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-300">@{member.username}</span>
                                        <button
                                          onClick={() => copyToClipboard(`@${member.username}`)}
                                          className="text-gray-400 hover:text-blue-300 transition-colors duration-200"
                                          title="Copy username"
                                        >
                                          {copied ? <CheckCheck className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">No username</span>
                                      </div>
                                    )}
                                                                         <div className="flex items-center space-x-2">
                                       <Clock className="h-4 w-4 text-gray-400" />
                                       <span className="text-xs text-gray-400">
                                         Joined: {member.joined_at ? formatDate(member.joined_at) : 'Unknown'}
                                       </span>
                                     </div>
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(member)}`}>
                                  {getStatusIcon(member)}
                                  <span>{getStatusText(member)}</span>
                                </div>
                              </div>
                              
                              {/* Verification Status */}
                              <div className="flex items-center justify-between">
                                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${getVerificationColor(member)}`}>
                                  {getVerificationIcon(member)}
                                  <span>{getVerificationText(member)}</span>
                                </div>
                                
                                {/* Member Info */}
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                                     {!member.is_active && member.left_at && (
                                     <div className="flex items-center space-x-1 text-red-400">
                                       <UserX className="h-4 w-4" />
                                       <span>Left: {formatDate(member.left_at)}</span>
                                     </div>
                                   )}
                                  {member.is_premium && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-4 w-4 text-yellow-400" />
                                      <span className="text-yellow-400">Premium</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
};

const TelegramMembers: React.FC = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'intern', 'team']}>
      <TelegramMembersContent />
    </ProtectedRoute>
  );
};

export default TelegramMembers;
