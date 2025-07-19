import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { 
  Upload, Download, Search, Gift, Trophy, Smartphone,
  DollarSign, Award, Crown, Star, Zap, Target,
  Terminal, Users, MessageCircle, Camera, ChevronDown, Github, Menu, X
} from 'lucide-react';

const Home = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [waitlistCount, setWaitlistCount] = useState(431);
  const [displayCount, setDisplayCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [revealedElements, setRevealedElements] = useState(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Remove wishlist form states - using button navigation instead

  // Countdown timer with proper error handling and timezone
  useEffect(() => {
    const targetDate = new Date('2025-08-15T12:00:00+05:30').getTime(); // IST timezone
    
    const updateCountdown = () => {
      try {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          
          setCountdown({ days, hours, minutes, seconds });
        } else {
          // Set to 0 if target date has passed
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Countdown error:', error);
        // Fallback: set countdown to 0 on error
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown(); // Call immediately
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // Parallax scroll effect and backup active section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Backup method: dynamically get sections in DOM order
      const sectionElements = Array.from(document.querySelectorAll('section[id]'))
        .map(el => ({ id: el.id, offsetTop: el.offsetTop }))
        .sort((a, b) => a.offsetTop - b.offsetTop);
      
      const scrollPosition = window.scrollY + 120; // Account for header
      
      // If we're at the very top, always show home as active
      if (window.scrollY < 100) {
        setActiveSection('home');
        return;
      }
      
      // Find the current section by checking which one we've scrolled past
      let currentSection = 'home';
      for (const section of sectionElements) {
        if (section.offsetTop <= scrollPosition) {
          currentSection = section.id;
        } else {
          break;
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal animation and active section tracking
  useEffect(() => {
    // Intersection Observer for reveal animations
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-reveal');
            if (elementId) {
              setRevealedElements(prev => {
                const newSet = new Set(prev);
                newSet.add(elementId);
                return newSet;
              });
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px'
      }
    );

    // Intersection Observer for active section tracking
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        // Find the section that is most in view
        let maxRatio = 0;
        let currentSection = 'home';
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const sectionId = entry.target.id;
            if (sectionId) {
              currentSection = sectionId;
            }
          }
        });
        
        // Only update if we have a section with meaningful intersection
        if (maxRatio > 0.1) {
          setActiveSection(currentSection);
          // Update URL hash without scrolling
          if (isInitialized) {
            window.history.replaceState(null, '', `#${currentSection}`);
          }
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: '-80px 0px -50% 0px'
      }
    );

    // Observe all reveal elements
    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach((el) => revealObserver.observe(el));

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => sectionObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [isInitialized]);

  // Animated counter for waitlist
  useEffect(() => {
    // Animate counter when beta section is revealed
    if (revealedElements.has('beta-container')) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = waitlistCount / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= waitlistCount) {
          setDisplayCount(waitlistCount);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [revealedElements, waitlistCount]);

  // Page initialization - scroll to top on load
  useEffect(() => {
    const handlePageLoad = () => {
      // Clear any hash from URL and scroll to top
      if (window.location.hash && !isInitialized) {
        window.history.replaceState(null, '', window.location.pathname);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      
      // Enable smooth scrolling after initialization
      document.documentElement.classList.add('smooth-scroll');
      setIsInitialized(true);
    };

    // Disable smooth scrolling initially
    document.documentElement.classList.remove('smooth-scroll');

    // Run immediately if page is already loaded
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, [isInitialized]);

  // Navigation handler for wishlist registration
  const handleWishlistNavigation = () => {
    window.location.href = '/wishlist-register';
  };

  // Smooth scroll function for navigation
  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId.replace('#', ''));
    if (element) {
      const headerOffset = 80; // Account for fixed header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle navigation click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const sectionId = href.replace('#', '');
      // Immediately update active section for instant feedback
      setActiveSection(sectionId);
      // Update URL without triggering page reload
      window.history.pushState(null, '', href);
      smoothScrollTo(href);
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash) {
        smoothScrollTo(hash);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      <Head>
        <title>JEHUB - Centralizing Academic Resources for Every Student</title>
        <meta
          name="description"
          content="JEHUB is a student-powered academic platform built for students, by students. Upload, explore, and earn from your class notes."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-[#0e0e10] text-[#d1d5db]">

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10] border-b border-[#2d2d30] shadow-lg">
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
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9333ea] to-[#3b82f6] rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {[
                  { href: '#home', label: 'Home' },
                  { href: '#features', label: 'Features' },
                  { href: '#beta', label: 'Beta' },
                  { href: '#community', label: 'Community' }
                ].map((item) => {
                  const isActive = activeSection === item.href.replace('#', '');
                  return (
                    <a 
                      key={item.href}
                      href={item.href} 
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`relative transition-all duration-300 px-3 py-2 rounded-lg cursor-pointer ${
                        isActive 
                          ? 'text-white bg-[#9333ea] shadow-lg' 
                          : 'text-white/80 hover:text-white hover:bg-[#1c1c1f]'
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] hover:bg-[#2d2d30] transition-all duration-300"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 h-6 w-6 text-white transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
                  />
                  <X 
                    className={`absolute inset-0 h-6 w-6 text-white transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} 
                  />
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isMobileMenuOpen 
              ? 'max-h-96 opacity-100' 
              : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-[#1c1c1f] border-t border-[#2d2d30]">
              <nav className="px-4 py-6 space-y-4">
                {[
                  { href: '#home', label: 'Home' },
                  { href: '#features', label: 'Features' },
                  { href: '#beta', label: 'Beta' },
                  { href: '#community', label: 'Community' }
                ].map((item, index) => {
                  const isActive = activeSection === item.href.replace('#', '');
                  return (
                    <a 
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`block px-4 py-3 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                        isActive 
                          ? 'text-white bg-[#9333ea] border-[#9333ea] shadow-lg' 
                          : 'text-white/80 hover:text-white bg-[#0e0e10] hover:bg-[#2d2d30] border-[#2d2d30] hover:border-[#9333ea]'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: isMobileMenuOpen ? 'slideInFromRight 0.3s ease-out forwards' : 'none'
                      }}
                    >
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1c1c1f] to-[#0e0e10] pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9333ea]/10 via-transparent to-[#3b82f6]/10"></div>
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                Centralizing Academic Resources
                <span className="block bg-gradient-to-r from-[#9333ea] to-[#3b82f6] bg-clip-text text-transparent">
                  for Every Student
                </span>
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-[#d1d5db] max-w-3xl mx-auto">
                Upload, explore, and earn from your class notes. Built by students, for students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#beta" 
                  onClick={(e) => handleNavClick(e, '#beta')}
                  className="px-8 py-4 bg-[#9333ea] text-white rounded-lg font-semibold text-lg hover:bg-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                >
                  Join Wishlist
                </a>
                <a 
                  href="#community" 
                  onClick={(e) => handleNavClick(e, '#community')}
                  className="px-8 py-4 bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] rounded-lg font-semibold text-lg hover:bg-[#3b82f6] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                >
                  Join Community
                </a>
              </div>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-[#d1d5db]" />
          </div>
        </section>

        {/* About JEHUB with Reveal Animation */}
        <section className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-r from-[#9333ea]/10 to-[#3b82f6]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-gradient-to-r from-[#3b82f6]/10 to-[#9333ea]/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div 
              data-reveal="about-section" 
              className={`transition-all duration-1000 transform ${
                revealedElements.has('about-section') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Glass blur container */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  What is JEHUB?
                </h2>
                <p className="text-xl text-[#d1d5db] max-w-4xl mx-auto leading-relaxed">
                  JEHUB is a student-powered academic platform built for students, by students. It allows students to upload, access, and
                  earn rewards for academic notes. It&apos;s open-source, community-first, and launching soon.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features with Glass Blur Cards */}
        <section id="features" className="py-20 bg-[#1c1c1f] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9333ea]/5 via-transparent to-[#3b82f6]/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#9333ea]/20 to-transparent rounded-full blur-3xl -translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              data-reveal="features-header" 
              className={`text-center mb-16 transition-all duration-1000 transform ${
                revealedElements.has('features-header') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Core Features
              </h2>
              <p className="text-xl text-[#d1d5db]">Everything you need for academic success</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards with Glass Blur Effect and Reveal Animation */}
              {[
                {
                  icon: Upload,
                  title: "Upload Notes",
                  description: "Easily upload your notes via PDF or Google Drive integration.",
                  gradient: "from-[#FF6B6B] to-[#FFD93D]",
                  id: "feature-upload"
                },
                {
                  icon: Search,
                  title: "Smart Search & Filter",
                  description: "Quickly find notes by filtering by subject, semester, and more.",
                  gradient: "from-[#5EEAD4] to-[#86EFAC]",
                  id: "feature-search"
                },
                {
                  icon: Download,
                  title: "Download Notes", 
                  description: "Access notes semester-wise and download them easily.",
                  gradient: "from-[#7DD3FC] to-[#312E81]",
                  id: "feature-download"
                },
                {
                  icon: Gift,
                  title: "Earn Points & XP",
                  description: "Get rewarded through our comprehensive gamification system.",
                  gradient: "from-[#A78BFA] to-[#F472B6]",
                  id: "feature-points"
                },
                {
                  icon: Trophy,
                  title: "Leaderboard System",
                  description: "Compete with peers and climb the rankings.",
                  gradient: "from-[#FCA5A5] to-[#F59E0B]",
                  id: "feature-leaderboard"
                },
                {
                  icon: Smartphone,
                  title: "Mobile-First UI",
                  description: "Enjoy a fast and seamless experience on any device.",
                  gradient: "from-[#34D399] to-[#60A5FA]",
                  id: "feature-mobile"
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    data-reveal={feature.id}
                    className={`group relative overflow-hidden transition-all duration-700 transform ${
                      revealedElements.has(feature.id)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {/* Glass blur card with enhanced effects */}
                    <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-white/30 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/10 group-hover:bg-white/[0.05]">
                      {/* Animated gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                      
                      {/* Glowing effect on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`}></div>
                      
                      {/* Icon container with enhanced effects */}
                      <div className="relative mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                          <IconComponent className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        {/* Pulsing ring effect on hover */}
                        <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-30 scale-0 group-hover:scale-[1.4] transition-all duration-500 blur-md`}></div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-[#d1d5db] group-hover:text-white/90 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Subtle border glow on hover */}
                      <div className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Gamification & Rewards */}
        <section className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-r from-[#3b82f6]/10 to-[#9333ea]/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              data-reveal="gamification-header"
              className={`text-center mb-16 transition-all duration-1000 transform ${
                revealedElements.has('gamification-header') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Earn, Compete, and Level Up
              </h2>
              <p className="text-xl text-[#d1d5db]">Gamify your learning experience</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: DollarSign,
                  title: "XP and Level System",
                  description: "Earn experience points and unlock new levels as you contribute.",
                  gradient: "from-[#FBBF24] to-[#F59E0B]",
                  id: "gamification-xp"
                },
                {
                  icon: Award,
                  title: "Milestone Badges",
                  description: "Get exclusive badges for reaching important milestones.",
                  gradient: "from-[#EC4899] to-[#BE185D]",
                  id: "gamification-badges"
                },
                {
                  icon: Crown,
                  title: "Weekly/Monthly Leaderboards",
                  description: "Climb rankings and compare with fellow students.",
                  gradient: "from-[#FBBF24] to-[#F97316]",
                  id: "gamification-leaderboard"
                },
                {
                  icon: Star,
                  title: "Upload and Referral Rewards",
                  description: "Get rewarded for sharing notes and bringing friends.",
                  gradient: "from-[#22D3EE] to-[#0EA5E9]",
                  id: "gamification-rewards"
                },
                {
                  icon: Zap,
                  title: "Contributor Challenges",
                  description: "Participate in challenges and help improve the platform.",
                  gradient: "from-[#FB7185] to-[#BE123C]",
                  id: "gamification-challenges"
                },
                {
                  icon: Target,
                  title: "College Rank System",
                  description: "Compete on a college level and gain recognition.",
                  gradient: "from-[#10B981] to-[#059669]",
                  id: "gamification-college"
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    data-reveal={item.id}
                    className={`group transition-all duration-700 transform ${
                      revealedElements.has(item.id)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-[#1c1c1f]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] hover:bg-[#1c1c1f] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-transform duration-300 group-hover:scale-110`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-[#d1d5db] group-hover:text-white/90 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>




        {/* Beta Wishlist Section */}
        <section id="beta" className="py-20 bg-gradient-to-br from-[#1c1c1f] to-[#0e0e10] relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#9333ea]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-[#3b82f6]/20 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div 
              data-reveal="beta-section" 
              className={`transition-all duration-1000 transform ${
                revealedElements.has('beta-section') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              {/* Glass morphism container */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  🚀 Join the Beta Wishlist
                </h2>
                <p className="text-xl text-[#d1d5db] mb-8 max-w-3xl mx-auto">
                  Be among the first {displayCount}+ students to experience JEHUB when we launch!
                </p>
                
                {/* Countdown Timer */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' }
                  ].map((item, index) => (
                    <div key={item.label} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-[#d1d5db] uppercase tracking-wide">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleWishlistNavigation}
                  className="px-8 py-4 bg-gradient-to-r from-[#9333ea] to-[#3b82f6] text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  Join Beta Wishlist Now
                </button>
                
                <p className="text-sm text-[#d1d5db]/80 mt-4">
                  Launch countdown • Early access guaranteed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join the Community */}
        <section id="community" className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div 
              data-reveal="community-header"
              className={`transition-all duration-1000 transform ${
                revealedElements.has('community-header') 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-10 scale-95'
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-3xl flex items-center justify-center mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                👥 Join the Student Community
              </h2>
              <p className="text-xl text-[#d1d5db] mb-8">
                Connect with 1000+ students building the future of academic collaboration
              </p>
            </div>
            
            <div 
              data-reveal="community-buttons"
              className={`grid md:grid-cols-3 gap-6 max-w-3xl mx-auto transition-all duration-1000 transform ${
                revealedElements.has('community-buttons') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <Link 
                href="#" 
                className="flex items-center justify-center px-6 py-4 bg-[#25d366] text-white rounded-lg font-semibold hover:bg-[#20ba59] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Join WhatsApp
              </Link>
              <Link 
                href="#" 
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#e1306c] to-[#f56040] text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <Camera className="h-5 w-5 mr-2" />
                Follow Instagram
              </Link>
              <Link 
                href="#" 
                className="flex items-center justify-center px-6 py-4 bg-[#1c1c1f] border border-[#2d2d30] text-white rounded-lg font-semibold hover:border-[#9333ea] hover:bg-[#9333ea] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Crown className="h-5 w-5 mr-2" />
                Campus Captain
              </Link>
            </div>

            <div 
              data-reveal="community-newsletter"
              className={`mt-12 bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl transition-all duration-1000 transform ${
                revealedElements.has('community-newsletter') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-[#d1d5db] mb-6">Get the latest updates about JEHUB&apos;s launch and features</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 rounded-lg bg-[#0e0e10]/80 backdrop-blur-sm border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                />
                <button className="px-6 py-3 bg-[#9333ea] text-white rounded-lg font-semibold hover:bg-[#7c3aed] transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        /* Mobile menu slide animation */
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
        
        /* Smooth scrolling - only after page is initialized */
        html {
          scroll-behavior: auto;
        }
        
        html.smooth-scroll {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #0e0e10;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #9333ea;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #7c3aed;
        }
      `}</style>
    </>
  );
};

export default Home;
