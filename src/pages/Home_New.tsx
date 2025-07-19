import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
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
  
  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = entry.target.getAttribute('data-reveal');
            if (elementId) {
              setRevealedElements(prev => new Set([...prev, elementId]));
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
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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

  // Navigation handler for wishlist registration
  const handleWishlistNavigation = () => {
    window.location.href = '/wishlist-register';
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
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0e0e10]/90 backdrop-blur-md border-b border-[#1c1c1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <img src="/images/logo2.png" alt="JEHUB" className="h-8 w-auto" />
              </Link>
              {/* Navigation */}
              <div className="hidden md:flex space-x-8">
                <Link href="#home" className="text-white hover:text-[#9333ea] transition-colors">Home</Link>
                <Link href="#features" className="text-white hover:text-[#9333ea] transition-colors">Features</Link>
                <Link href="#beta" className="text-white hover:text-[#9333ea] transition-colors">Beta</Link>
                <Link href="#community" className="text-white hover:text-[#9333ea] transition-colors">Community</Link>
                <Link href="#contribute" className="text-white hover:text-[#9333ea] transition-colors">Contribute</Link>
              </div>
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
                <Link 
                  href="#beta" 
                  className="px-8 py-4 bg-[#9333ea] text-white rounded-lg font-semibold text-lg hover:bg-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Wishlist
                </Link>
                <Link 
                  href="#community" 
                  className="px-8 py-4 bg-transparent border-2 border-[#3b82f6] text-[#3b82f6] rounded-lg font-semibold text-lg hover:bg-[#3b82f6] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Community
                </Link>
              </div>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-8 w-8 text-[#d1d5db]" />
          </div>
        </section>

        {/* About JEHUB */}
        <section className="py-20 bg-[#0e0e10]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">What is JEHUB?</h2>
            <p className="text-xl text-[#d1d5db] max-w-4xl mx-auto leading-relaxed">
              JEHUB is a student-powered academic platform built for students, by students. It allows students to upload, access, and
              earn rewards for academic notes. It's open-source, community-first, and launching soon.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="py-20 bg-[#1c1c1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Core Features</h2>
              <p className="text-xl text-[#d1d5db]">Everything you need for academic success</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Upload Notes</h3>
                <p className="text-[#d1d5db]">Easily upload your notes via PDF or Google Drive integration.</p>
              </div>

              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#5EEAD4] to-[#86EFAC] rounded-2xl flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Search & Filter</h3>
                <p className="text-[#d1d5db]">Quickly find notes by filtering by subject, semester, and more.</p>
              </div>

              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#7DD3FC] to-[#312E81] rounded-2xl flex items-center justify-center mb-6">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Download Notes</h3>
                <p className="text-[#d1d5db]">Access notes semester-wise and download them easily.</p>
              </div>

              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#A78BFA] to-[#F472B6] rounded-2xl flex items-center justify-center mb-6">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn Points & XP</h3>
                <p className="text-[#d1d5db]">Get rewarded through our comprehensive gamification system.</p>
              </div>

              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FCA5A5] to-[#F59E0B] rounded-2xl flex items-center justify-center mb-6">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Leaderboard System</h3>
                <p className="text-[#d1d5db]">Compete with peers and climb the rankings.</p>
              </div>

              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] hover:border-[#9333ea] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-[#34D399] to-[#60A5FA] rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mobile-First UI</h3>
                <p className="text-[#d1d5db]">Enjoy a fast and seamless experience on any device.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gamification & Rewards */}
        <section className="py-20 bg-[#0e0e10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Earn, Compete, and Level Up</h2>
              <p className="text-xl text-[#d1d5db]">Gamify your learning experience</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">XP and Level System</h3>
                <p className="text-[#d1d5db]">Earn experience points and unlock new levels as you contribute.</p>
              </div>

              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#EC4899] to-[#BE185D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Milestone Badges</h3>
                <p className="text-[#d1d5db]">Get exclusive badges for reaching important milestones.</p>
              </div>

              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FBBF24] to-[#F97316] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Weekly/Monthly Leaderboards</h3>
                <p className="text-[#d1d5db]">Climb rankings and compare with fellow students.</p>
              </div>

              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload and Referral Rewards</h3>
                <p className="text-[#d1d5db]">Get rewarded for sharing notes and bringing friends.</p>
              </div>

              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FB7185] to-[#BE123C] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Contributor Challenges</h3>
                <p className="text-[#d1d5db]">Participate in challenges and help improve the platform.</p>
              </div>

              <div className="bg-[#1c1c1f] p-6 rounded-2xl border border-[#2d2d30] text-center hover:border-[#9333ea] transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">College Rank System</h3>
                <p className="text-[#d1d5db]">Compete on a college level and gain recognition.</p>
              </div>
            </div>
          </div>
        </section>



        {/* Open Source Contributor Invite */}
        <section id="contribute" className="py-20 bg-[#1c1c1f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Terminal className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">💻 Contribute to JEHUB</h2>
            <p className="text-xl text-[#d1d5db] mb-8">We're open-source! Developers, designers, content curators — join the team and build with us.</p>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)} 
              className="px-8 py-4 bg-[#9333ea] text-white rounded-lg font-semibold text-lg hover:bg-[#7c3aed] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-8"
            >
              Apply to Contribute
            </button>
            
            {isFormOpen && (
              <div className="bg-[#0e0e10] p-8 rounded-2xl border border-[#2d2d30] max-w-2xl mx-auto">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full px-4 py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full px-4 py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      placeholder="GitHub Username" 
                      className="w-full px-4 py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                    />
                    <select className="w-full px-4 py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] text-white focus:outline-none focus:border-[#9333ea] transition-colors">
                      <option>Select Role</option>
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>UI/UX Designer</option>
                      <option>Content Creator</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Tell us why you want to contribute to JEHUB..." 
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-[#1c1c1f] border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                  ></textarea>
                  <button 
                    type="submit" 
                    className="w-full px-8 py-4 bg-gradient-to-r from-[#9333ea] to-[#3b82f6] text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
            
            <div className="mt-8">
              <Link href="https://github.com" className="inline-flex items-center text-white hover:text-[#9333ea] transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-[#374151] to-[#111827] rounded-lg flex items-center justify-center mr-2">
                  <Github className="h-4 w-4 text-white" />
                </div>
                Visit our GitHub Repository
              </Link>
            </div>
          </div>
        </section>

        {/* Join the Community */}
        <section id="community" className="py-20 bg-[#0e0e10]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">👥 Join the Student Community</h2>
            <p className="text-xl text-[#d1d5db] mb-8">Connect with 1000+ students building the future of academic collaboration</p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
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

            <div className="mt-12 bg-[#1c1c1f] p-8 rounded-2xl border border-[#2d2d30]">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-[#d1d5db] mb-6">Get the latest updates about JEHUB's launch and features</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 rounded-lg bg-[#0e0e10] border border-[#2d2d30] text-white placeholder-[#666] focus:outline-none focus:border-[#9333ea] transition-colors"
                />
                <button className="px-6 py-3 bg-[#9333ea] text-white rounded-lg font-semibold hover:bg-[#7c3aed] transition-all duration-200">
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
        
        /* Smooth scrolling */
        html {
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
