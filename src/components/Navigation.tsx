import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { BookOpen, Download, Upload, GitPullRequest, BarChart2, MessageSquare, UserPlus, Menu, X, Star, FlaskConical, Users, Info, Briefcase, Trophy, GraduationCap, ChevronDown, Sparkles, Bell, Calendar, UserCheck, Gift, MessageCircle, Shield, Search, Zap, Coins, Settings, User, LogOut, Home, Activity, Award, Target, Bookmark, LayoutDashboard, FileText, Bot } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import ProfilePicture from './ProfilePicture';
import AuthLoader from './AuthLoader';
import { pointsService } from '../services/pointsService';

// Utility function to check if user is eligible to upload notes
const isEligibleForNotesUpload = (userRole: string | undefined): boolean => {
  if (!userRole) return false;
  const eligibleRoles = ['admin', 'manager', 'intern', 'team'];
  return eligibleRoles.includes(userRole.toLowerCase());
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAllPagesOpen, setIsAllPagesOpen] = useState(false);
  const [userPoints, setUserPoints] = useState({ availablePoints: 0, points: 0, pointsSpent: 0 });
  const [pointsLoading, setPointsLoading] = useState(false);
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  const navItems = useMemo(() => [
    { path: '/', label: 'Home', icon: Home },
    { path: '/notes-download', label: 'Notes', icon: Download },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/internships', label: 'Internships', icon: Briefcase },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/blog', label: 'Blog', icon: BookOpen },
    { path: '/about', label: 'About', icon: Info },
    { path: '/team', label: 'Team', icon: Star }
  ], []);

  // All Pages Mega Menu - comprehensive list of all site pages
  const allPagesMenu = useMemo(() => [
    {
      category: 'Main Pages',
      pages: [
        { path: '/', label: 'Home', icon: Home, description: 'Welcome to JEHUB' },
        { path: '/about', label: 'About Us', icon: Info, description: 'Learn about JEHUB' },
        { path: '/contact', label: 'Contact Us', icon: MessageCircle, description: 'Get in touch with us' }
      ]
    },
    {
      category: 'Academic Resources',
      pages: [
        { path: '/notes-download', label: 'Download Notes', icon: Download, description: 'Browse & download study materials' },
        { path: '/notes/upload', label: 'Upload Notes', icon: Upload, description: 'Share your study materials' },
        { path: '/notes/request', label: 'Request Notes', icon: GitPullRequest, description: 'Request specific materials' },
        { path: '/exam-updates', label: 'Exam Updates', icon: Bell, description: 'Latest exam notifications' },
        { path: '/counselling-updates', label: 'Counselling Updates', icon: UserCheck, description: 'Admission counselling info' }
      ]
    },
    {
      category: 'Community & Events',
      pages: [
        { path: '/events', label: 'Events', icon: Calendar, description: 'Upcoming academic events' },
        { path: '/groups', label: 'Study Groups', icon: Users, description: 'Join study communities' },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Top contributors ranking' },
        { path: '/blog', label: 'Blog', icon: BookOpen, description: 'Educational articles & tips' },
        { path: '/telegram-members', label: 'Telegram Community', icon: MessageCircle, description: 'Join our Telegram group' }
      ]
    },
    {
      category: 'Career & Opportunities',
      pages: [
        { path: '/internships', label: 'Internships', icon: Briefcase, description: 'Latest internship opportunities' },
        { path: '/job-updates', label: 'Job Updates', icon: Target, description: 'Career opportunities' },
        { path: '/placement-prep', label: 'Placement Prep', icon: GraduationCap, description: 'Interview preparation' }
      ]
    },
    {
      category: 'Team & Organization',
      pages: [
        { path: '/team', label: 'Our Team', icon: Users, description: 'Meet the JEHUB team' },
        { path: '/team/join-team', label: 'Join Our Team', icon: UserPlus, description: 'Become a team member' },
        { path: '/team/old-team-members', label: 'Alumni Team', icon: Award, description: 'Former team members' }
      ]
    },
    {
      category: 'User Features',
      pages: [
        { path: '/profile', label: 'Profile', icon: User, description: 'Manage your profile' },
        { path: '/notifications', label: 'Notifications', icon: Bell, description: 'Your updates & alerts' },
        { path: '/settings', label: 'Settings', icon: Settings, description: 'Account preferences' },
        { path: '/referral', label: 'Referrals', icon: Gift, description: 'Invite friends & earn rewards' }
      ]
    },
    {
      category: 'Resources & Tools',
      pages: [
        { path: '/wishlist-users', label: 'Beta Access', icon: Star, description: 'Join beta testing program' },
        { path: '/features', label: 'Features', icon: Sparkles, description: 'Explore all features' },
        { path: '/misc/pageindex', label: 'Site Map', icon: Target, description: 'All pages directory' },
        { path: '/privacy-policy', label: 'Privacy Policy', icon: Shield, description: 'Data protection policy' },
        { path: '/terms-of-service', label: 'Terms of Service', icon: FileText, description: 'Usage terms & conditions' }
      ]
    }
  ], []);


  // Load user points when user changes
  useEffect(() => {
    const loadUserPoints = async () => {
      if (user && user.email) {
        try {
          setPointsLoading(true);
          const points = await pointsService.getUserPointsByEmail(user.email);
          setUserPoints(points);
        } catch (error) {
          console.error('Error loading user points:', error);
        } finally {
          setPointsLoading(false);
        }
      } else {
        setUserPoints({ availablePoints: 0, points: 0, pointsSpent: 0 });
      }
    };

    loadUserPoints();
  }, [user]);

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => {
      if (item.path.startsWith('/#')) {
        return router.asPath.includes(item.path);
      }
      // Handle groups redirect: /groups redirects to /features/groups
      if (item.path === '/groups' && router.pathname === '/features/groups') {
        return true;
      }
      return item.path === router.pathname;
    });
    setActiveIndex(currentIndex === -1 ? 0 : currentIndex);
  }, [router.pathname, router.asPath, navItems]);

  const handleNavClick = (index: number, path: string) => {
    setActiveIndex(index);
    setIsMenuOpen(false); // Close mobile menu on navigation

    if (path.startsWith('/#')) {
      if (router.pathname === '/') {
        const elementId = path.substring(2);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = (path: string) => {
    setIsProfileOpen(false);
    router.push(path);
  };


  // Check if we're on the home page
  const isHomePage = router.pathname === '/';
  
  return (
    <>
      {/* Top Navigation Bar - Dark mode for all pages */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo and Search */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-3 rounded-lg transition-all duration-200 md:hidden text-gray-300 hover:text-white hover:bg-gray-800 active:scale-95 touch-manipulation"
                aria-label="Open menu"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center" onClick={() => handleNavClick(0, '/')}>
                <div className="flex items-center">
                  <Image
                    src="/images/whitelogo.svg"
                    alt="JEHUB"
                    width={56}
                    height={56}
                    className="h-14 w-14 transition-all duration-300"
                    priority
                  />
                </div>
              </Link>
              
              
              {/* Desktop Navigation Menu - Only show on home page */}
              {isHomePage && (
                <nav className="hidden lg:flex items-center ml-6 space-x-1">
                  <Link
                    href="/"
                    onClick={() => handleNavClick(0, '/')}
                    className={`group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      router.pathname === '/' 
                        ? 'text-white bg-gray-800 border border-gray-700'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>Home</span>
                  </Link>
                  
                  <Link
                    href="/about"
                    className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span>About Us</span>
                  </Link>
                  
                  <Link
                    href="/wishlist-users"
                    className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span>Wishlist User</span>
                  </Link>
                  
              <Link
                href="/contact"
                className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <span>Contact Us</span>
              </Link>
              
                  
                  <Link
                    href="/groups"
                    className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span>Groups</span>
                  </Link>
                  
                  <Link
                    href="/events"
                    className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span>Events</span>
                  </Link>
                  
                  <Link
                    href="/team"
                    className="group relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <span>Team</span>
                  </Link>
                </nav>
              )}
            </div>

            {/* Center Section - Spacer */}
            <div className="flex-1"></div>

            {/* Right Section - Menu, Notifications, Profile */}
            <div className="flex items-center space-x-3">
              {/* All Pages Menu - Desktop - Only show on non-home pages */}
              {!isHomePage && (
                <div className="hidden lg:flex items-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsAllPagesOpen(!isAllPagesOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Menu className="h-4 w-4" />
                      <span>All Pages</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isAllPagesOpen ? 'rotate-180' : ''}`} />
                    </button>
                  
                  {isAllPagesOpen && (
                    <div className="absolute right-0 top-full mt-2 w-screen max-w-6xl bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                          {allPagesMenu.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-3">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                  {section.category}
                                </h3>
                              </div>
                              <div className="space-y-2">
                                {section.pages.map((page, pageIndex) => {
                                  const IconComponent = page.icon;
                                  return (
                                    <Link
                                      key={pageIndex}
                                      href={page.path}
                                      onClick={() => setIsAllPagesOpen(false)}
                                      className="group block p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100"
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0">
                                          <IconComponent className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                                            {page.label}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {page.description}
                                          </p>
                                        </div>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Footer section with quick stats or call to action */}
                        <div className="border-t border-gray-100 mt-6 pt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Explore all features of JEHUB platform</p>
                            <button 
                              onClick={() => setIsAllPagesOpen(false)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Close Menu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* Points Display - Only show for authenticated users */}
              {user && (
                <div className="hidden sm:flex items-center space-x-2 bg-amber-100 bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-300 border-opacity-30">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-200">
                    {pointsLoading ? '...' : userPoints.availablePoints}
                  </span>
                </div>
              )}

              {/* Notifications */}
              <button className="p-2 rounded-lg transition-all duration-200 relative text-gray-300 hover:text-white hover:bg-gray-800">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile Section */}
              <div className="flex items-center">
                {loading ? (
                  <AuthLoader className="px-3 py-2 rounded-lg" />
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 text-gray-400 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-sm">
                        {/* Profile Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-lg font-medium">
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 font-semibold text-sm">{user?.name}</p>
                              <p className="text-gray-600 text-xs">{user?.email}</p>
                              <div className="flex items-center space-x-1 mt-1 bg-white bg-opacity-70 px-2 py-1 rounded-full">
                                <Coins className="h-3 w-3 text-amber-600" />
                                <span className="text-xs text-amber-600 font-medium">{userPoints.availablePoints} Points</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Main Actions */}
                        <div className="py-2">
                          
                          <button onClick={() => handleProfileClick('/settings')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                              <Settings className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Settings</span>
                              <p className="text-xs text-gray-500">Manage your preferences</p>
                            </div>
                          </button>
                          
                          <button onClick={() => handleProfileClick('/profile')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Profile</span>
                              <p className="text-xs text-gray-500">Edit your profile info</p>
                            </div>
                          </button>
                          
                          <button onClick={() => handleProfileClick('/referral')} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 group">
                            <div className="w-8 h-8 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                              <Gift className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Referrals</span>
                              <p className="text-xs text-gray-500">Invite friends & earn</p>
                            </div>
                          </button>
                        </div>
                        
                        {/* Logout Section */}
                        <div className="border-t border-gray-100 p-2">
                          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 group rounded-lg">
                            <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                              <LogOut className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Sign Out</span>
                              <p className="text-xs text-red-500">See you later!</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/login" className="px-4 py-2 font-medium text-sm transition-colors duration-200 text-gray-300 hover:text-white">
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 z-50 transition-all duration-300 ease-in-out md:hidden shadow-xl bg-gray-900 border-r border-gray-800 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="h-full overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <Image
                  src="/images/whitelogo.svg"
                  alt="JEHUB"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  priority
                />
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>


            <nav className="flex flex-col space-y-2">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(index, item.path)}
                    className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-900 text-blue-300 font-medium border-r-2 border-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 transition-all duration-200 ${
                      isActive 
                        ? 'text-blue-400'
                        : 'text-gray-400 group-hover:text-gray-200'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              <div className="my-6">
                <div className="border-t border-gray-200"></div>
              </div>


              {/* Auth Section */}
              <div className="mt-8 pt-6">
                <div className="border-t border-gray-200"></div>

                <div className="mt-6">
                  {loading ? (
                    // Loading state for mobile menu
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="animate-pulse flex items-center space-x-3 w-full">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{user?.name}</p>
                          <p className="text-gray-300 text-xs">{user?.email}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Coins className="h-3 w-3 text-amber-400" />
                            <span className="text-xs text-amber-400 font-medium">{userPoints.availablePoints} Points</span>
                          </div>
                        </div>
                      </div>

                      {/* Profile Actions */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleProfileClick('/referral')}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                        >
                          <Gift className="h-5 w-5" />
                          <span>Referral Dashboard</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center px-4 py-3 text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;