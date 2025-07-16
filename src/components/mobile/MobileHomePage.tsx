import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Bell,
  User,
  FileText,
  Download,
  Upload,
  Calendar,
  Briefcase,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  Star,
  ChevronRight,
  Sparkles,
  Megaphone,
  Menu,
  X,
  Home,
  HelpCircle,
  UserPlus,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalSidebar from '../UniversalSidebar';

interface MobileHomePageProps {
  user?: {
    name: string;
    avatar?: string;
  };
  notificationCount?: number;
}

const MobileHomePage: React.FC<MobileHomePageProps> = ({
  user = { name: "Aditya" },
  notificationCount = 3
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if it's the first visit today
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisitDate');

    if (lastVisit !== today) {
      setShowGreeting(true);
      localStorage.setItem('lastVisitDate', today);

      // Hide greeting after 30 seconds
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  const categories = [
    {
      id: 'notes-request',
      title: 'Notes Request',
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      path: '/notes-request',
      badge: 'New'
    },
    {
      id: 'notes-download',
      title: 'Notes Download',
      icon: Download,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      path: '/notes-download',
      badge: '🔥'
    },
    {
      id: 'notes-upload',
      title: 'Notes Upload',
      icon: Upload,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      path: '/notes-upload'
    },
    {
      id: 'events',
      title: 'Events',
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      path: '/events'
    },
    {
      id: 'internships',
      title: 'Internships',
      icon: Briefcase,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      path: '/internships',
      badge: 'Hot'
    },
    {
      id: 'join-team',
      title: 'Join Team',
      icon: Users,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-100',
      path: '/join-team'
    },
    {
      id: 'blog',
      title: 'Blog & Updates',
      icon: BookOpen,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-100',
      path: '/blog'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      icon: Award,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      path: '/leaderboard'
    }
  ];

  const latestBlogs = [
    {
      id: 1,
      title: 'Top 10 Study Tips for Engineering Students',
      summary: 'Discover proven strategies to excel in your engineering studies and boost your academic performance.',
      image: '/api/placeholder/300/200',
      readTime: '5 min read',
      category: 'Study Tips'
    },
    {
      id: 2,
      title: 'JEHUB Internship Program 2024 - Applications Open',
      summary: 'Join our internship program and gain real-world experience while building your career.',
      image: '/api/placeholder/300/200',
      readTime: '3 min read',
      category: 'Opportunities'
    },
    {
      id: 3,
      title: 'New Notes Added for CSE Semester 3',
      summary: 'Complete set of notes for Computer Science Engineering third semester subjects now available.',
      image: '/api/placeholder/300/200',
      readTime: '2 min read',
      category: 'Updates'
    }
  ];

  const announcements = [
    "⚠️ Applications open for JEHUB Internship Program!",
    "🎉 New Notes Added for CSE Sem 3",
    "📚 Weekend Study Group Sessions Available",
    "🔥 Premium Notes Collection Updated"
  ];

  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);



  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen bg-gray-50"
      >
      {/* Top App Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3"
      >
        <div className="flex items-center justify-between">
          {/* Left Side - Menu + Logo */}
          <div className="flex items-center space-x-3">
            <motion.button 
              onClick={() => setIsMenuOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </motion.button>
            <img
              src="/images/logo.png"
              alt="JEHUB"
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'block');
              }}
            />
            <span
              className="text-xl font-bold text-blue-600 hidden"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              JEHUB
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notificationCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
                >
                  {notificationCount}
                </motion.span>
              )}
            </motion.button>
            {/* Profile */}
            <Link href="/profile">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Universal Sidebar */}
      <UniversalSidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Greeting Message */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name}! Welcome back to JEHUB 🎉
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowGreeting(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/80 hover:text-white"
              >
                <span className="text-lg">×</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Strip */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <Megaphone className="h-4 w-4 animate-pulse" />
                <div className="overflow-hidden">
                  <motion.p 
                    key={currentAnnouncement}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium"
                  >
                    {announcements[currentAnnouncement]}
                  </motion.p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowAnnouncement(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/80 hover:text-white"
              >
                <span className="text-lg">×</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="px-4 pb-20 pt-5"
      >

        {/* Search Section */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes, events, blogs..."
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

            <div className="relative z-10">
              <div className="mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to JEHUB</h2>
              <p className="text-blue-100 mb-4">One platform for notes, events, and opportunities.</p>
              <Link href="/about">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:bg-blue-50 transition-colors">
                  <span>Explore Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Explore Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Explore Categories</h3>
            <button className="text-blue-600 text-sm font-medium">See all</button>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 pb-6 pt-3" style={{ width: 'max-content' }}>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link key={category.id} href={category.path}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + Math.random() * 0.3 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${category.bgColor} p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 relative flex-shrink-0 flex flex-col`} 
                      style={{ minWidth: '140px', width: '140px', height: '120px', minHeight: '120px' }}
                    >
                      {category.badge && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + Math.random() * 0.2 }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10"
                        >
                          {category.badge}
                        </motion.span>
                      )}
                      <div className={`w-12 h-12 ${category.color} rounded-2xl flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 flex items-end">
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight text-center w-full">{category.title}</h4>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Announcement Section */}
        <div className="py-4 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Megaphone className="h-5 w-5" />
              <h3 className="font-bold text-lg">Announcement</h3>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed">
              📢 JEHUB Internship Program 2024 applications are now open! Apply before August 31st.
              Get real-world experience and boost your career. Limited seats available.
            </p>
            <button className="mt-3 bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* JEHUB Official Notices */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">JEHUB Official Notices</h3>
            <button className="text-blue-600 text-sm font-medium">View all</button>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">New</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Semester Exam Schedule Released</h4>
                  <p className="text-gray-600 text-xs">Final examination schedule for all JUT affiliated colleges has been published. Check your exam dates now.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">Important</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Scholarship Applications Open</h4>
                  <p className="text-gray-600 text-xs">Merit-based scholarship applications are now open for all diploma students. Apply before the deadline.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">Update</span>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">New Course Material Available</h4>
                  <p className="text-gray-600 text-xs">Updated course materials and reference books are now available in the digital library.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Updates / Blogs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Latest from JEHUB</h3>
            <Link href="/blog">
              <button className="text-blue-600 text-sm font-medium flex items-center space-x-1">
                <span>View all</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          <div className="space-y-4">
            {latestBlogs.map((blog, index) => (
              <motion.div 
                key={blog.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                        {blog.category}
                      </span>
                      <span className="text-xs text-gray-500">{blog.readTime}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {blog.summary}
                    </p>
                    <motion.button 
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 text-xs font-medium flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <ArrowRight className="h-3 w-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-xs text-gray-600">Downloads</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-gray-600">Uploads</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">1,250</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CSS for animations */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
    </AnimatePresence>
  );
};

export default MobileHomePage;