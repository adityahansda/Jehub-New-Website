import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NewsletterSubscription from '../components/NewsletterSubscription';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Upload, Download, Search, Gift, Trophy, Smartphone,
  DollarSign, Award, Crown, Star, Zap, Target,
  Users, MessageCircle, Camera, ChevronDown
} from 'lucide-react';

const Home = () => {
  const router = useRouter();
  const [waitlistCount, setWaitlistCount] = useState(431);
  const [displayCount, setDisplayCount] = useState(0);
  const [revealedElements, setRevealedElements] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

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
      // console.warn('Error in smooth scroll:', error); // Suppressed for production logging cleanliness
    }
  };

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
        // console.warn('Error in popstate handler:', error); // Suppressed for production
      }
    };

    try {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    } catch (error) {
      // console.warn('Error setting up popstate listener:', error); // Suppressed for production
      return () => { };
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


        // Observe all reveal elements
        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length > 0) {
          revealElements.forEach((el) => {
            try {
              revealObserver.observe(el);
            } catch (observeError) {
              // console.warn('Could not observe reveal element:', observeError); // Suppressed for production
            }
          });
        }


        return () => {
          try {
            revealObserver.disconnect();
          } catch (disconnectError) {
            console.warn('Error disconnecting observers:', disconnectError);
          }
        };
      } catch (error) {
        console.warn('Error setting up intersection observers:', error);
        return () => { }; // Return empty cleanup function
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupObservers, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Navigation handler for wishlist registration - redirect to beta wishlist page
  const handleWishlistNavigation = () => {
    router.push('/beta-wishlist'); // Navigate to beta wishlist registration page
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
        <meta name="google-site-verification" content="RqBYoA-qnnigXoG07czwhn7O3vebF-hVI1KzK2O5BvM" />
        
        {/* SEO Meta Tags */}
        <meta name="keywords" content="student notes, academic resources, class notes, study materials, engineering notes, college notes, student platform, note sharing, education, learning resources" />
        <meta name="author" content="JEHUB Team" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jehub.vercel.app/" />
        <meta property="og:title" content="JEHUB - Centralizing Academic Resources for Every Student" />
        <meta property="og:description" content="JEHUB is a student-powered academic platform built for students, by students. Upload, explore, and earn from your class notes." />
        <meta property="og:image" content="https://jehub.vercel.app/og-image.jpg" />
        <meta property="og:site_name" content="JEHUB" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://jehub.vercel.app/" />
        <meta property="twitter:title" content="JEHUB - Centralizing Academic Resources for Every Student" />
        <meta property="twitter:description" content="JEHUB is a student-powered academic platform built for students, by students. Upload, explore, and earn from your class notes." />
        <meta property="twitter:image" content="https://jehub.vercel.app/og-image.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://jehub.vercel.app/" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "JEHUB",
              "alternateName": "Jharkhand Engineer's Hub",
              "url": "https://jehub.vercel.app",
              "logo": "https://jehub.vercel.app/logo.png",
              "description": "JEHUB is a student-powered academic platform built for students, by students. Upload, explore, and earn from your class notes.",
              "foundingDate": "2024",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "India",
                "addressRegion": "Jharkhand"
              },
              "sameAs": [
                "https://t.me/JharkhandEnginnersHub",
                "https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU"
              ]
            })
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "JEHUB",
              "alternateName": "Jharkhand Engineer's Hub",
              "url": "https://jehub.vercel.app",
              "description": "Centralizing Academic Resources for Every Student",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://jehub.vercel.app/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-[#0e0e10] text-[#d1d5db]">


        {/* Enhanced Hero Section */}
        <section id="home" className="relative flex items-center justify-center min-h-screen pt-16 pb-16 flex-col">
          {/* Enhanced Background with Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0b] via-[#1a1a1d] to-[#0e0e10] -z-10"></div>

          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-[#f59e0b]/20 via-[#f59e0b]/5 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '0s', animationDuration: '4s' }}
            ></div>
            <div
              className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-[#3b82f6]/25 via-[#3b82f6]/5 to-transparent rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: '2s', animationDuration: '6s' }}
            ></div>
            <div
              className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-radial from-[#8b5cf6]/20 via-[#8b5cf6]/5 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s', animationDuration: '5s' }}
            ></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
            <div
              className="absolute top-24 left-10 w-4 h-4 bg-[#f59e0b] rounded-full animate-float"
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className="absolute top-40 right-20 w-6 h-6 bg-[#3b82f6] rounded-full animate-float"
              style={{ animationDelay: '1s' }}
            ></div>
            <div
              className="absolute bottom-40 left-20 w-3 h-3 bg-[#8b5cf6] rounded-full animate-float"
              style={{ animationDelay: '2s' }}
            ></div>
            <div
              className="absolute bottom-20 right-10 w-5 h-5 bg-[#f59e0b] rounded-full animate-float"
              style={{ animationDelay: '0.5s' }}
            ></div>
          </div>

          <div className="relative z-10 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center animate-fade-in-up w-full">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#f59e0b]/10 to-[#fb923c]/10 border border-[#f59e0b]/20 backdrop-blur-sm mb-8 mt-8">
                <span className="text-[#f59e0b] text-sm font-medium mr-2">🚀</span>
                <span className="text-white text-sm font-medium">Launching Soon - Join 431+ Students</span>
                <div className="ml-2 w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse"></div>
              </div>

              {/* Enhanced Main Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
                <span
                  className="block animate-slide-in-left"
                  style={{ animationDelay: '0.2s' }}
                >
                  Centralizing
                </span>
                <span
                  className="block bg-gradient-to-r from-[#f59e0b] via-[#fb923c] to-[#ef4444] bg-clip-text text-transparent animate-slide-in-right"
                  style={{ animationDelay: '0.4s' }}
                >
                  Academic Resources
                </span>
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl mt-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent animate-slide-in-left pb-3"
                  style={{ animationDelay: '0.6s' }}
                >
                  for Every Student
                </span>
              </h1>

              {/* Enhanced Subtitle */}
              <p
                className="text-xl sm:text-2xl lg:text-3xl mb-12 text-[#d1d5db] max-w-4xl mx-auto leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.8s' }}
              >
                <span className="font-semibold text-white">Upload, explore, and earn</span> from your class notes.
                <br className="hidden sm:block" />
                <span className="text-[#f59e0b]">Built by students, for students.</span>
              </p>

              {/* Enhanced CTA Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up"
                style={{ animationDelay: '1s' }}
              >
                <button
                  onClick={handleWishlistNavigation}
                  className="group relative px-10 py-5 bg-gradient-to-r from-[#f59e0b] via-[#fb923c] to-[#ef4444] text-white rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[#f59e0b]/25 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fb923c] via-[#ef4444] to-[#f59e0b] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <Zap className="h-6 w-6" />
                    <span>Join Beta Wishlist</span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => window.scrollTo({ top: document.getElementById('community')?.offsetTop || 0, behavior: 'smooth' })}
                  className="group relative px-10 py-5 bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[#3b82f6]/25 transform hover:-translate-y-2 hover:scale-105 cursor-pointer backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2 group-hover:text-white transition-colors duration-300">
                    <Users className="h-6 w-6" />
                    <span>Join Community</span>
                  </div>
                </button>
              </div>

              {/* Enhanced Statistics */}
              <div
                className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 mt-16 mb-20 animate-fade-in max-w-4xl mx-auto"
                style={{ animationDelay: '1.2s' }}
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

          {/* Enhanced Scroll Indicator - Down Arrow Design */}
          <div className=' w-full flex justify-center'>
            <button
              onClick={() => smoothScrollTo('#features')}
              className=" animate-bounce-slow cursor-pointer focus:outline-none group z-20"
              aria-label="Scroll to features section"
            >
              <div className="flex flex-col items-center justify-center sm:space-y-3 w-full m-auto">
                {/* Text - hide on mobile, show on tablet+ */}
                <span className="hidden sm:block text-[#d1d5db] text-xs font-medium tracking-wide group-hover:text-[#f59e0b] transition-colors duration-300">
                  Scroll to explore
                </span>

                {/* Down Arrow indicator - responsive sizing */}
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#d1d5db]/50 flex items-center justify-center transition-all duration-300 group-hover:border-[#f59e0b] group-hover:shadow-lg group-hover:shadow-[#f59e0b]/20 group-active:scale-95">
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#f59e0b] animate-bounce transition-all duration-300 group-hover:text-[#fb923c]" />
                  </div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#f59e0b]/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>

                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#f59e0b]/10 rounded-full opacity-0 group-active:opacity-100 transition-all duration-150 scale-0 group-active:scale-150"></div>
                </div>

                {/* Mobile-only simple text */}
                <span className="sm:hidden text-[#d1d5db] text-[10px] font-medium tracking-wider opacity-80 group-hover:text-[#f59e0b] group-hover:opacity-100 transition-all duration-300 text-center">
                  SCROLL
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Wishlist Section with Countdown */}
        <section className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-r from-[#9333ea]/10 to-[#3b82f6]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div
                data-reveal="wishlist-section"
                className={`transition-all duration-1000 transform ${revealedElements.has('wishlist-section')
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-10 scale-95'
                  }`}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-[#ef4444] to-[#f97316] rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform duration-300 hover:scale-110">
                  <Gift className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  Beta Test Coming Soon
                </h2>

                {/* Beta Test Message */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      Beta Test Starting Soon
                    </h3>
                    <p className="text-lg text-[#d1d5db] mb-4">
                      We're preparing for an exciting beta test phase. Join our waitlist to be among the first to experience JEHUB!
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-blue-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Preparing for launch</span>
                    </div>
                  </div>
                </div>

                <p className="text-xl text-[#d1d5db] mb-8">
                  Get ready for the beta test! Join our waitlist to be notified when testing begins.
                </p>

                <button
                  onClick={handleWishlistNavigation}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Join Beta Test Waitlist
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About JEHUB with Reveal Animation */}
        <section className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-r from-[#9333ea]/10 to-[#3b82f6]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-gradient-to-r from-[#3b82f6]/10 to-[#9333ea]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div
                data-reveal="about-section"
                className={`transition-all duration-1000 transform ${revealedElements.has('about-section')
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
          </div>
        </section>

        {/* Core Features with Enhanced Glass Blur Cards */}
        <section id="features" className="py-24 bg-gradient-to-br from-[#1a1a1d] via-[#1c1c1f] to-[#0e0e10] relative overflow-hidden">
          {/* Enhanced Background decoration with multiple layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9333ea]/8 via-[#6366f1]/6 to-[#3b82f6]/8"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-[#9333ea]/25 via-[#7c3aed]/15 to-transparent rounded-full blur-3xl -translate-y-1/2 animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-r from-[#3b82f6]/20 via-[#1e40af]/10 to-transparent rounded-full blur-3xl translate-y-1/2 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

          {/* Floating geometric shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-16 w-4 h-4 bg-gradient-to-r from-[#f59e0b] to-[#fb923c] rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-32 right-24 w-6 h-6 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] rotate-45 animate-float opacity-50" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-32 left-32 w-5 h-5 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-full animate-float opacity-40" style={{ animationDelay: '3s' }}></div>
            <div className="absolute bottom-48 right-16 w-3 h-12 bg-gradient-to-b from-[#10b981] to-[#059669] rounded-full animate-float opacity-45" style={{ animationDelay: '2.5s' }}></div>
          </div>

          <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto w-full">
              <div
                data-reveal="features-header"
                className={`text-center mb-20 transition-all duration-1000 transform ${revealedElements.has('features-header')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                  }`}
              >
                {/* Enhanced section badge */}
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#9333ea]/10 via-[#6366f1]/10 to-[#3b82f6]/10 border border-[#9333ea]/20 backdrop-blur-sm mb-8">
                  <span className="text-[#9333ea] text-sm font-semibold mr-2">✨</span>
                  <span className="text-white text-sm font-semibold">Platform Features</span>
                  <div className="ml-2 w-2 h-2 bg-[#9333ea] rounded-full animate-pulse"></div>
                </div>

                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                  <span className="block bg-gradient-to-r from-white via-[#f8fafc] to-white/90 bg-clip-text text-transparent">Core</span>
                  <span className="block bg-gradient-to-r from-[#9333ea] via-[#6366f1] to-[#3b82f6] bg-clip-text text-transparent">Features</span>
                </h2>
                <p className="text-xl sm:text-2xl text-[#d1d5db]/90 max-w-3xl mx-auto leading-relaxed">
                  <span className="font-semibold text-white">Everything you need</span> for academic success,
                  <br className="hidden sm:block" />
                  <span className="text-[#9333ea]">designed with students in mind</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {/* Enhanced Feature Cards with Modern Glass Blur Effect */}
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
                    description: "Challenge your peers and rise to the top of the leaderboard",
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
                      className={`group transition-all duration-500 transform ${revealedElements.has(feature.id)
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                        }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {/* Simple Glass Card */}
                      <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center hover:border-white/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">

                        {/* Simple Gradient Background on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>

                        {/* Icon */}
                        <div className="relative mb-6">
                          <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110`}>
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="text-2xl font-bold text-white mb-4">
                            {feature.title}
                          </h3>
                          <p className="text-[#d1d5db] group-hover:text-white/90 transition-colors duration-300">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Gamification & Rewards */}
        <section className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-r from-[#3b82f6]/10 to-[#9333ea]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-7xl mx-auto w-full">
              <div
                data-reveal="gamification-header"
                className={`text-center mb-16 transition-all duration-1000 transform ${revealedElements.has('gamification-header')
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
                    description: "Boost your rank and see how you stack up against others",
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
                    description: "Compete at the college level and earn the recognition you deserve",
                    gradient: "from-[#10B981] to-[#059669]",
                    id: "gamification-college"
                  }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      data-reveal={item.id}
                      className={`group transition-all duration-700 transform ${revealedElements.has(item.id)
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
          </div>
        </section>


        {/* Join the Community */}
        <section id="community" className="py-20 bg-[#0e0e10] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center w-full">
              <div
                data-reveal="community-header"
                className={`transition-all duration-1000 transform ${revealedElements.has('community-header')
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
                className={`grid md:grid-cols-3 gap-6 max-w-3xl mx-auto transition-all duration-1000 transform ${revealedElements.has('community-buttons')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: '200ms' }}
              >
                <Link
                  href="https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-4 bg-[#25d366] text-white rounded-lg font-semibold hover:bg-[#20ba59] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Join WhatsApp
                </Link>
                <Link
                  href="https://www.instagram.com/jharkhandengineershub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#e1306c] to-[#f56040] text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Follow Instagram
                </Link>
                <Link
                  href="https://t.me/JharkhandEnginnersHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-4 bg-[#1c1c1f] border border-[#2d2d30] text-white rounded-lg font-semibold hover:border-[#9333ea] hover:bg-[#9333ea] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Join Telegram
                </Link>
              </div>

              <div
                data-reveal="community-newsletter"
                className={`mt-12 bg-black/20 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl transition-all duration-1000 transform ${revealedElements.has('community-newsletter')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: '400ms' }}
              >
                <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-[#d1d5db] mb-6">Get the latest updates about JEHUB&apos;s launch and features</p>
                <NewsletterSubscription />
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
