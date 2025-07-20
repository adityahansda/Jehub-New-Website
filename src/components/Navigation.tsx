import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { BookOpen, Download, Upload, GitPullRequest, BarChart2, MessageSquare, UserPlus, Menu, X, Star, FlaskConical, Users } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/#features', label: 'Features', icon: Star },
    { path: '/#beta', label: 'Join Beta', icon: FlaskConical },
    { path: '/#groups', label: 'Join Group', icon: Users },
    { path: '/notes-upload', label: 'Upload', icon: Upload },
  ];

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path.startsWith('/#') ? router.asPath.includes(item.path) : item.path === router.pathname);
    setActiveIndex(currentIndex === -1 ? 0 : currentIndex);
  }, [router.pathname, router.asPath]);

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
      {/* Top bar with menu button and logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/80 backdrop-blur-md border-b border-[#2d2d30]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-lg text-white hover:text-amber-400 transition-colors md:hidden mr-2"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2 group" onClick={() => handleNavClick(0, '/')}>
                <Image
                  src="/images/whitelogo.svg"
                  alt="JEHUB"
                  width={32}
                  height={32}
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
                />
                {/* <span className="text-xl font-bold text-white hidden sm:block">JEHUB</span> */}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10">Login</Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90">Sign Up</Link>
            </div>

          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ease-in-out md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Left Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#121214]/80 backdrop-blur-lg border-r border-[#2d2d30] z-50 transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Navigation;