import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Menu, X, BookOpen, Users, Trophy, MessageSquare, PenTool, User, Upload, Download, HelpCircle, UserPlus } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/notes-upload', label: 'Upload', icon: Upload },
    { path: '/notes-download', label: 'Download', icon: Download },
    { path: '/notes-request', label: 'Request', icon: HelpCircle },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/blog', label: 'Blog', icon: PenTool },
    { path: '/about', label: 'About', icon: MessageSquare },
    { path: '/join-team', label: 'Join Team', icon: UserPlus },
  ];

  const handleNavClick = (index: number, path: string) => {
    setActiveIndex(index);
    setIsMenuOpen(false); // Close mobile menu on navigation
    router.push(path);
  };


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#2d2d30] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" onClick={() => handleNavClick(0, '/')}>
            <div className="relative">
              <Image
                src="/images/whitelogo.svg"
                alt="JEHUB"
                width={32}
                height={32}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">JEHUB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeIndex === index;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(index, item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2
                    ${isActive
                      ? 'bg-gradient-to-r from-[#f59e0b] to-[#fb923c] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-[#1c1c1f]/50'
                    }
                  `}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#1c1c1f]/80 text-white hover:text-[#f59e0b] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#2d2d30] z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(index, item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-[#f59e0b] to-[#fb923c] text-white'
                        : 'text-white/70 hover:text-white hover:bg-[#1c1c1f]/50'
                      }
                    `}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navigation;