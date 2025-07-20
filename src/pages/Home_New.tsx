import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { 
  Upload, Download, Search, Gift, Trophy, Smartphone,
  DollarSign, Award, Crown, Star, Zap, Target,
  Terminal, Users, MessageCircle, Camera, ChevronDown, Github
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  
  // Animated counter for waitlist
  useEffect(() => {
    // Animate counter when beta section is revealed
    if (revealedElements.has('beta-section')) {
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

  // Handle browser back/forward buttons
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const handlePopState = () => {
      try {
        const hash = window.location.hash;
        if (hash) {
          smoothScrollTo(hash);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.warn('Error in popstate handler:', error);
      }
    };

    try {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } catch (error) {
      console.warn('Error setting up popstate listener:', error);
      return () => {};
    }
  }, []);

  
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
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !document) {
      return;
    }

    const handleScroll = () => {
      try {
        setScrollY(window.scrollY);
        
        // Backup method: dynamically get sections in DOM order
        const sectionElements = Array.from(document.querySelectorAll('section[id]'))
          .map(el => ({ 
            id: el.id, 
            offsetTop: (el as HTMLElement).offsetTop 
          }))
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
      } catch (error) {
        console.warn('Error in scroll handler:', error);
      }
    };

    try {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } catch (error) {
      console.warn('Error setting up scroll listener:', error);
      return () => {};
    }
  }, []);

  // Scroll reveal animation and active section tracking
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || !document) {
      return;
    }

    // Wait a bit for DOM to be ready
    const setupObservers = () => {
      try {
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
            try {
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
                if (isInitialized && window.history) {
                  try {
                    window.history.replaceState(null, '', `#${currentSection}`);
                  } catch (historyError) {
                    console.warn('Could not update URL hash:', historyError);
                  }
                }
              }
            } catch (sectionError) {
              console.warn('Error in section observer:', sectionError);
            }
          },
          {
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
            rootMargin: '-80px 0px -50% 0px'
          }
        );

        // Observe all reveal elements
        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length > 0) {
          revealElements.forEach((el) => {
            try {
              revealObserver.observe(el);
            } catch (observeError) {
              console.warn('Could not observe reveal element:', observeError);
            }
          });
        }

        // Observe all sections
        const sections = document.querySelectorAll('section[id]');
        if (sections.length > 0) {
          sections.forEach((section) => {
            try {
              sectionObserver.observe(section);
            } catch (observeError) {
              console.warn('Could not observe section:', observeError);
            }
          });
        }

        return () => {
          try {
            revealObserver.disconnect();
            sectionObserver.disconnect();
          } catch (disconnectError) {
            console.warn('Error disconnecting observers:', disconnectError);
          }
        };
      } catch (error) {
        console.warn('Error setting up intersection observers:', error);
        return () => {}; // Return empty cleanup function
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupObservers, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isInitialized]);

  // Navigation handler for wishlist registration
  const handleWishlistNavigation = () => {
    window.location.href = '/wishlist-register';
  };

  // Smooth scroll function for navigation
  const smoothScrollTo = (elementId: string) => {
    try {
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
    } catch (error) {
      console.warn('Error in smooth scroll:', error);
    }
  };

  // Handle navigation click
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    try {
      e.preventDefault();
      if (href.startsWith('#')) {
        const sectionId = href.replace('#', '');
        // Immediately update active section for instant feedback
        setActiveSection(sectionId);
        // Update URL without triggering page reload
        if (window.history) {
          try {
            window.history.pushState(null, '', href);
          } catch (historyError) {
            console.warn('Could not update URL:', historyError);
          }
        }
        smoothScrollTo(href);
      }
    } catch (error) {
      console.warn('Error in navigation click:', error);
    }
  };

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
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/95 backdrop-blur-md border-b border-[#2d2d30] shadow-lg">
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
              <nav className="hidden md:flex items-center space-x-1">
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
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer group ${
                        isActive 
                          ? 'text-white bg-gradient-to-r from-[#f59e0b] to-[#fb923c] shadow-lg shadow-[#f59e0b]/25' 
                          : 'text-white/80 hover:text-white hover:bg-[#1c1c1f]/80'
                      }`}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#f59e0b]/10 to-[#fb923c]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      )}
                    </a>
                  );
                })}
              </nav>
              
            </div>
          </div>
          
        </header>

        {/* Enhanced Hero Section */}
        <section id="home" className="relative flex items-center justify-center min-h-screen pt-20 pb-16">
          {/* Enhanced Background with Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] via-[#1a1a1d] to-[#0e0e10] -z-10"></div>
          
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#f59e0b]/20 via-[#f59e0b]/5 to-transparent rounded-full blur-3xl animate-pulse" 
              style={{animationDelay: '0s', animationDuration: '4s'}}
            ></div>
            <div 
              className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-[#3b82f6]/25 via-[#3b82f6]/5 to-transparent rounded-full blur-2xl animate-pulse" 
              style={{animationDelay: '2s', animationDuration: '6s'}}
            ></div>
            <div 
              className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-radial from-[#8b5cf6]/20 via-[#8b5cf6]/5 to-transparent rounded-full blur-3xl animate-pulse" 
              style={{animationDelay: '1s', animationDuration: '5s'}}
            ></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <div 
              className="absolute top-24 left-10 w-4 h-4 bg-[#f59e0b] rounded-full animate-float" 
              style={{animationDelay: '0s'}}
            ></div>
            <div 
              className="absolute top-40 right-20 w-6 h-6 bg-[#3b82f6] rounded-full animate-float" 
              style={{animationDelay: '1s'}}
            ></div>
            <div 
              className="absolute bottom-40 left-20 w-3 h-3 bg-[#8b5cf6] rounded-full animate-float" 
              style={{animationDelay: '2s'}}
            ></div>
            <div 
              className="absolute bottom-20 right-10 w-5 h-5 bg-[#f59e0b] rounded-full animate-float" 
              style={{animationDelay: '0.5s'}}
            ></div>
          </div>
          
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="animate-fade-in-up">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#f59e0b]/10 to-[#fb923c]/10 border border-[#f59e0b]/20 backdrop-blur-sm mb-8">
                <span className="text-[#f59e0b] text-sm font-medium mr-2">🚀</span>
                <span className="text-white text-sm font-medium">Launching Soon - Join 431+ Students</span>
                <div className="ml-2 w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
              </div>
              
              {/* Enhanced Main Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
                <span 
                  className="block animate-slide-in-left" 
                  style={{animationDelay: '0.2s'}}
                >
                  Centralizing
                </span>
                <span 
                  className="block bg-gradient-to-r from-[#f59e0b] via-[#fb923c] to-[#ef4444] bg-clip-text text-transparent animate-slide-in-right" 
                  style={{animationDelay: '0.4s'}}
                >
                  Academic Resources
                </span>
                <span 
                  className="block text-4xl sm:text-5xl lg:text-6xl mt-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent animate-slide-in-left" 
                  style={{animationDelay: '0.6s'}}
                >
                  for Every Student
                </span>
              </h1>
              
              {/* Enhanced Subtitle */}
              <p 
                className="text-xl sm:text-2xl lg:text-3xl mb-12 text-[#d1d5db] max-w-4xl mx-auto leading-relaxed animate-fade-in" 
                style={{animationDelay: '0.8s'}}
              >
                <span className="font-semibold text-white">Upload, explore, and earn</span> from your class notes.
                <br className="hidden sm:block" />
                <span className="text-[#f59e0b]">Built by students, for students.</span>
              </p>
              
              {/* Enhanced CTA Buttons */}
              <div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" 
                style={{animationDelay: '1s'}}
              >
                <a 
                  href="#beta" 
                  onClick={(e) => handleNavClick(e, '#beta')}
                  className="group relative px-10 py-5 bg-gradient-to-r from-[#f59e0b] via-[#fb923c] to-[#ef4444] text-white rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[#f59e0b]/25 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fb923c] via-[#ef4444] to-[#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <Zap className="h-6 w-6" />
                    <span>Join Beta Wishlist</span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                
                <a 
                  href="#community" 
                  onClick={(e) => handleNavClick(e, '#community')}
                  className="group relative px-10 py-5 bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[#3b82f6]/25 transform hover:-translate-y-2 hover:scale-105 cursor-pointer backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2 group-hover:text-white transition-colors duration-300">
                    <Users className="h-6 w-6" />
                    <span>Join Community</span>
                  </div>
                </a>
              </div>
              
              {/* Enhanced Statistics */}
              <div 
                className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in" 
                style={{animationDelay: '1.2s'}}
              >
                <div className="flex items-center space-x-2 text-[#d1d5db]">
                  <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">431+ Students Joined</span>
                </div>
                <div className="flex items-center space-x-2 text-[#d1d5db]">
                  <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">50+ Colleges Connected</span>
                </div>
                <div className="flex items-center space-x-2 text-[#d1d5db]">
                  <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">1000+ Notes Shared</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Scroll Indicator - Responsive & Clickable */}
          <button 
            onClick={() => smoothScrollTo('#features')}
            className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow cursor-pointer focus:outline-none group"
            aria-label="Scroll to features section"
          >
            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              {/* Text - hide on mobile, show on tablet+ */}
              <span className="hidden sm:block text-[#d1d5db] text-xs font-medium tracking-wide group-hover:text-[#f59e0b] transition-colors duration-300">
                Scroll to explore
              </span>
              
              {/* Mouse indicator - responsive sizing */}
              <div className="relative">
                <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-[#d1d5db]/50 rounded-full flex justify-center transition-all duration-300 group-hover:border-[#f59e0b] group-hover:shadow-lg group-hover:shadow-[#f59e0b]/20 group-active:scale-95">
                  <div className="w-1 h-2 sm:h-3 bg-[#f59e0b] rounded-full mt-1.5 sm:mt-2 animate-bounce transition-all duration-300 group-hover:bg-[#fb923c]"></div>
                </div>
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 w-5 h-8 sm:w-6 sm:h-10 border-2 border-[#f59e0b]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                
                {/* Ripple effect on click */}
                <div className="absolute inset-0 w-5 h-8 sm:w-6 sm:h-10 bg-[#f59e0b]/10 rounded-full opacity-0 group-active:opacity-100 transition-all duration-150 scale-0 group-active:scale-150"></div>
              </div>
              
              {/* Mobile-only simple text */}
              <span className="sm:hidden text-[#d1d5db] text-[10px] font-medium tracking-wider opacity-80 group-hover:text-[#f59e0b] group-hover:opacity-100 transition-all duration-300">
                SCROLL
              </span>
            </div>
          </button>
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
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        /* Gradient radial utility */
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
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
