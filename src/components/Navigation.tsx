import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Menu, X, BookOpen, Users, Trophy, MessageSquare, PenTool, User, Upload, Download, HelpCircle, UserPlus, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠', lucideIcon: BookOpen },
    { path: '/notes-upload', label: 'Upload', icon: '📤', lucideIcon: Upload },
    { path: '/notes-download', label: 'Download', icon: '📥', lucideIcon: Download },
    { path: '/notes-request', label: 'Request', icon: '❓', lucideIcon: HelpCircle },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆', lucideIcon: Trophy },
    { path: '/blog', label: 'Blog', icon: '✍️', lucideIcon: PenTool },
    { path: '/about', label: 'About', icon: '💬', lucideIcon: MessageSquare },
    { path: '/join-team', label: 'Join Team', icon: '👥', lucideIcon: UserPlus },
  ];

  const isActive = (path: string) => router.pathname === path;

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const mobileMenu = document.querySelector('[data-mobile-menu]');
      const menuButton = document.querySelector('[data-menu-button]');

      if (isMenuOpen &&
        mobileMenu &&
        !mobileMenu.contains(target) &&
        menuButton &&
        !menuButton.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#2d2d30] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/images/whitelogo.svg"
                alt="JEHUB"
                width={32}
                height={32}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444] to-[#fbbf24] rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">JEHUB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const LucideIcon = item.lucideIcon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer group ${isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-[#f59e0b] to-[#fb923c] shadow-lg shadow-[#f59e0b]/25'
                      : 'text-white/80 hover:text-white hover:bg-[#1c1c1f]/80'
                    }`}
                >
                  <div className="flex items-center space-x-1">
                    <LucideIcon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {!isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f59e0b]/10 to-[#fb923c]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative p-3 rounded-xl bg-[#1c1c1f]/80 backdrop-blur-sm border border-[#2d2d30] hover:bg-[#2d2d30]/80 hover:border-[#f59e0b]/50 transition-all duration-300 group"
            aria-label="Toggle mobile menu"
            data-menu-button
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 text-white transition-all duration-300 transform ${isMenuOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                  } group-hover:text-[#f59e0b]`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 text-white transition-all duration-300 transform ${isMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
                  } group-hover:text-[#f59e0b]`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 transition-all duration-300 ease-in-out z-40 ${isMenuOpen
          ? 'opacity-100 visible transform translate-y-0'
          : 'opacity-0 invisible transform -translate-y-4'
        }`}>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>

        <div className="relative bg-[#0e0e10]/95 backdrop-blur-2xl border border-[#2d2d30]/80 border-t-0 shadow-2xl" data-mobile-menu>
          {/* Additional background layer for better opacity */}
          <div className="absolute inset-0 bg-[#1a1a1d]/90 backdrop-blur-xl rounded-b-lg"></div>

          <nav className="relative px-4 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const LucideIcon = item.lucideIcon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${isActive(item.path)
                        ? 'text-white bg-gradient-to-r from-[#f59e0b] to-[#fb923c] shadow-lg shadow-[#f59e0b]/25'
                        : 'text-white/90 hover:text-white hover:bg-[#2d2d30] hover:bg-opacity-80 border border-transparent hover:border-[#f59e0b]/30'
                      }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isMenuOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Additional Links */}
            <div className="pt-4 mt-4 border-t border-[#2d2d30]">
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/90 hover:text-white hover:bg-[#2d2d30] hover:bg-opacity-80 border border-transparent hover:border-[#f59e0b]/30 transition-all duration-300"
              >
                <span className="text-base">👤</span>
                <span className="font-medium text-sm flex-1">Profile</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;