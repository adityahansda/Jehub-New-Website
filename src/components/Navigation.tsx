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
import { BookOpen, Download, Upload, GitPullRequest, BarChart2, MessageSquare, UserPlus, Menu, X, Star, FlaskConical, Users, Info, Briefcase, Trophy, GraduationCap, ChevronDown, Sparkles } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  const navItems = useMemo(() => [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/notes-download', label: 'Download Notes', icon: Download },
    { path: '/notes-upload', label: 'Upload Notes', icon: Upload },
    { path: '/groups', label: 'Join Groups', icon: Users },
    { path: '/events', label: 'Events', icon: Trophy },
    { path: '/internships', label: 'Internships', icon: Briefcase },
    { path: '/leaderboard', label: 'Leaderboard', icon: Star },
  ], []);


  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path.startsWith('/#') ? router.asPath.includes(item.path) : item.path === router.pathname);
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

  return (
    <>
      {/* Enhanced Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Enhanced Mobile Menu Button with Animation */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="group relative p-2 rounded-xl transition-all duration-300 md:hidden mr-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:scale-105 hover:shadow-lg"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-white group-hover:text-amber-400 transition-all duration-300" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Enhanced Logo with Animation */}
              <Link href="/" className="flex items-center space-x-3 group" onClick={() => handleNavClick(0, '/')}>
                <div className="relative">
                  <Image
                    src="/images/whitelogo.svg"
                    alt="JEHUB"
                    width={36}
                    height={36}
                    className="h-9 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              </Link>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Main Navigation Items */}
              <nav className="flex items-center space-x-1">
                {[
                  { href: '/notes-download', label: 'Notes Download', icon: Download },
                  { href: '/groups', label: 'Groups', icon: Users },
                  { href: '/events', label: 'Events', icon: Trophy },
                  { href: '/internships', label: 'Internships', icon: Briefcase }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                          ? 'text-white bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-amber-400' : 'text-white/60 group-hover:text-white'
                          } ${hoveredIndex === index ? 'scale-110' : ''}`} />
                        <span>{item.label}</span>
                      </div>

                      {/* Hover Effect Background */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full animate-pulse"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Separator */}
              <div className="w-px h-6 bg-white/20 mx-3"></div>

              {/* Authentication Button */}
              <div className="flex items-center">
                <Link
                  href="/login"
                  className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Enhanced Overlay with Backdrop Blur */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-all duration-500 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Enhanced Left Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#0a0a0b]/95 via-[#121214]/95 to-[#0a0a0b]/95 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-500 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-20 h-20 bg-amber-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-10 w-16 h-16 bg-orange-400 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-8 w-12 h-12 bg-amber-300 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative h-full overflow-y-auto">
        <div className="p-6 pb-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">JEHUB</h2>
                <p className="text-xs text-white/60">Student Hub</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 hover:scale-105"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <nav className="flex flex-col space-y-3">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeIndex === index;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(index, item.path)}
                  className={`group relative w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-left transition-all duration-300 hover:scale-105 ${isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-xl shadow-amber-500/25'
                      : 'text-white/70 hover:text-white hover:bg-white/10 hover:backdrop-blur-xl'
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                    <IconComponent className={`h-5 w-5 transition-all duration-300 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white group-hover:scale-110'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="w-full h-0.5 bg-white/30 rounded-full mt-1 animate-pulse"></div>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className={`w-1 h-8 bg-amber-400 rounded-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    }`}></div>

                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>
              );
            })}

            {/* Enhanced Divider */}
            <div className="relative my-6">
              <div className="border-t border-white/10"></div>
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            </div>

            {/* Enhanced Additional Links */}
            <div className="space-y-2">
              {[
                { href: '/misc/about', label: 'About JEHUB', icon: Info },
                { href: '/blog', label: 'Blog & Updates', icon: BookOpen },
                { href: '/profile', label: 'My Profile', icon: GraduationCap }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group w-full flex items-center space-x-4 px-5 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all duration-300 hover:scale-105"
                  >
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                      <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Auth Section */}
            <div className="relative mt-8 pt-6">
              <div className="border-t border-white/10"></div>
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="group relative w-full flex items-center justify-center px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/25 overflow-hidden"
                >
                  <span className="relative z-10">Login</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </Link>
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