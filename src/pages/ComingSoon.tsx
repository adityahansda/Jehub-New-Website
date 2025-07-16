import React, { useState, useEffect } from "react";
import Image from 'next/image';
import {
  BookOpen,
  Mail,
  Bell,
  Users,
  Star,
  Rocket,
  Calendar,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  Youtube,
  Instagram,
} from "lucide-react";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Set launch date (you can modify this)
  const launchDate = new Date("2025-08-01T00:00:00").getTime();

  const handleClick = () => {
    window.open("https://forms.gle/W38n16zcxCrsezaTA"), "_blank";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Handle email subscription
      console.log("Email subscribed:", email);
      setIsSubscribed(true);
      setEmail("");
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Share Notes",
      description:
        "Upload and download high-quality academic notes from students worldwide",
    },
    {
      icon: Users,
      title: "Join Community",
      description:
        "Connect with fellow students, ask questions, and share knowledge",
    },
    {
      icon: Star,
      title: "Earn Points",
      description:
        "Get rewarded for your contributions and climb the leaderboard",
    },
    {
      icon: Rocket,
      title: "Boost Learning",
      description:
        "Access resources, blogs, and tools to accelerate your academic journey",
    },
  ];

  const stats = [
    { number: "10K+", label: "Students Waiting" },
    { number: "50+", label: "Universities" },
    { number: "100+", label: "Subjects Covered" },
    { number: "24/7", label: "Community Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="flex items-center justify-center">
              <Image 
                src="/images/logo.png" 
                alt="JEHUB Logo" 
                width={128}
                height={128}
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-16">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
                <Rocket className="h-4 w-4 mr-2" />
                Something Amazing is Coming
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Student Learning
                </span>
                is Almost Here
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Join thousands of students preparing for the ultimate academic
                collaboration platform. Share knowledge, earn rewards, and
                transform your learning experience.
              </p>

              {/* Countdown Timer */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-900">
                    Launching In
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Minutes" },
                    { value: timeLeft.seconds, label: "Seconds" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-lg"
                    >
                      <div className="text-2xl sm:text-3xl font-bold">
                        {item.value.toString().padStart(2, "0")}
                      </div>
                      <div className="text-sm opacity-90">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Signup */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md mx-auto">
                {isSubscribed ? (
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      You&lsquo;re In!
                    </h3>
                    <p className="text-gray-600">
                      We&apos;ll notify you as soon as JEHUB launches. Get ready
                      for an amazing experience!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Be the First to Know
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Get early access and exclusive updates about
                        JEHUB&apos;s launch
                      </p>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Notify Me at Launch
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      No spam, unsubscribe anytime. We respect your privacy.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* Join Team Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-md mx-auto mb-12">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Join Our Team
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you passionate about education and technology? Join our team and help build the future of student learning!
                </p>
                <button
                  onClick={handleClick}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Features Preview */}
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                What&apos;s Coming
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Discover the powerful features that will revolutionize how
                students learn and collaborate
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 sm:p-12 text-white mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Students worldwide are already excited about JEHUB. Be part of
                the educational revolution.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                      <div className="text-3xl sm:text-4xl font-bold mb-2">
                        {stat.number}
                      </div>
                      <div className="text-blue-100">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Follow Our Journey
              </h3>
              <div className="flex justify-center space-x-6 flex-wrap gap-4">
                <a
                  href="https://t.me/JharkhandEnginnersHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors bg-white/50 px-4 py-2 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Telegram</span>
                </a>
                <a
                  href="https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors bg-white/50 px-4 py-2 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://www.youtube.com/@JharkhandEngineersHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors bg-white/50 px-4 py-2 rounded-lg"
                >
                  <Youtube className="h-5 w-5" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/jharkhandengineershub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-pink-600 transition-colors bg-white/50 px-4 py-2 rounded-lg"
                >
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">
              © 2024 JEHUB - Jharkhand Engineers Hub. All rights reserved. Building the future of education.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ComingSoon;
