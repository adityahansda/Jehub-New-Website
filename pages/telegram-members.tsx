import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
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
  EyeOff
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
}

interface TelegramStats {
  total: number;
  active: number;
  inactive: number;
}

const TelegramMembers: React.FC = () => {
  const [members, setMembers] = useState<TelegramMember[]>([]);
  const [allMembers, setAllMembers] = useState<TelegramMember[]>([]);
  const [stats, setStats] = useState<TelegramStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTelegramMembers();
  }, []);

  const fetchTelegramMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/telegram-members');
      setMembers(response.data.members || []);
      setAllMembers(response.data.allMembers || []);
      setStats(response.data.stats || { total: 0, active: 0, inactive: 0 });
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

  const displayMembers = showInactive ? allMembers : members;
  const filteredMembers = displayMembers.filter(member => 
    member.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.username && member.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (member: TelegramMember) => {
    if (!member.is_active) return <UserX className="h-4 w-4 text-red-400" />;
    if (member.status === 'administrator' || member.status === 'creator') return <Crown className="h-4 w-4 text-yellow-400" />;
    return <UserCheck className="h-4 w-4 text-green-400" />;
  };

  const getStatusText = (member: TelegramMember) => {
    if (!member.is_active) return 'Left';
    return member.status.charAt(0).toUpperCase() + member.status.slice(1);
  };

  const getStatusColor = (member: TelegramMember) => {
    if (!member.is_active) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (member.status === 'administrator' || member.status === 'creator') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
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
        <Footer />
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Telegram Group Members - JEHub Community</title>
        <meta name="description" content="View all members of JEHub Telegram group community" />
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
                      JEHub Telegram Community
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base font-medium">
                      Group Members Dashboard
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
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-blue-100 text-sm">Total Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <UserCheck className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats.active}</div>
                    <div className="text-blue-100 text-sm">Active Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{members.filter(m => m.is_premium).length}</div>
                    <div className="text-blue-100 text-sm">Premium Members</div>
                  </div>
                </motion.div>
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

                {/* Controls */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm focus:outline-none transition ${
                      showInactive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{showInactive ? 'Hide Inactive' : 'Show All'}</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm focus:outline-none transition text-gray-300 hover:bg-white/10 disabled:opacity-50"
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
                              !member.is_active ? 'opacity-60' : ''
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="space-y-4">
                              {/* Member Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                    {member.display_name}
                                  </h3>
                                  {member.username && (
                                    <p className="text-sm text-gray-400">@{member.username}</p>
                                  )}
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(member)}`}>
                                  {getStatusIcon(member)}
                                  <span>{getStatusText(member)}</span>
                                </div>
                              </div>
                              
                              {/* Member Info */}
                              <div className="flex items-center justify-between text-sm text-gray-400">
                                <div>
                                  <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>
                                </div>
                                {member.is_premium && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-yellow-400">Premium</span>
                                  </div>
                                )}
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

      <Footer />
    </>
  );
};

export default TelegramMembers;
