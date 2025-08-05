import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../src/components/Navigation';
import Footer from '../src/components/Footer';
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
  Grid3X3
} from 'lucide-react';

interface WishlistUser {
  name: string;
  status?: string;
  isPremium?: boolean;
  collegeName?: string;
  branch?: string;
  degree?: string;
  yearsOfStudy?: string;
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

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/beta-wishlist-sheets');
      setUsers(response.data.entries || []);
      setCollegeSummary(response.data.collegeSummary || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch wishlist data');
    } finally {
      setLoading(false);
    }
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

                {/* Toggle View Mode */}
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

      <Footer />
    </>
  );
};

export default WishlistUsers;

