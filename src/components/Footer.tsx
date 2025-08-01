import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle, Send } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1 text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start mb-4 group">
              <div className="relative">
                <Image
                  src="/images/whitelogo.svg"
                  alt="JEHUB Logo"
                  width={48}
                  height={48}
                  className="sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
              Empowering Jharkhand&apos;s engineering community with quality resources, 
              collaborative learning, and professional growth opportunities.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start space-x-3">
              <a href="https://t.me/JharkhandEnginnersHub" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all duration-300 group">
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-all duration-300 group">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://www.instagram.com/jharkhandengineershub/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-all duration-300 group">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" />
              </a>
              <a href="https://www.youtube.com/@JharkhandEngineersHub" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 group">
                <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white relative">
              Quick Links
              <span className="absolute bottom-0 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-8 h-0.5 bg-blue-500"></span>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">About Us</Link></li>
              <li><Link href="/notes-upload" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Upload Notes</Link></li>
              <li><Link href="/notes-download" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Download Notes</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Blog</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Events</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white relative">
              Resources
              <span className="absolute bottom-0 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-8 h-0.5 bg-green-500"></span>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/study-materials" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Study Materials</Link></li>
              <li><Link href="/question-papers" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Question Papers</Link></li>
              <li><Link href="/tutorials" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Tutorials</Link></li>
              <li><Link href="/projects" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Projects</Link></li>
              <li><Link href="/internships" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Internships</Link></li>
              <li><Link href="/job-portal" className="text-gray-400 hover:text-white md:hover:pl-2 transition-all duration-300 text-sm">Job Portal</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white relative">
              Contact Us
              <span className="absolute bottom-0 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></span>
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="group flex items-start justify-center md:justify-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-blue-600 transition-colors duration-300 flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 group-hover:text-gray-300 transition-colors duration-300">Email</p>
                  <a href="mailto:jharkhandengineershub@gmail.com" className="text-white hover:text-blue-400 transition-colors duration-300 text-xs sm:text-sm break-words font-medium block">jharkhandengineershub@gmail.com</a>
                </div>
              </div>
              
              <div className="group flex items-start justify-center md:justify-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-green-600 transition-colors duration-300 flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 group-hover:text-gray-300 transition-colors duration-300">Phone</p>
                  <a href="tel:+916201234567" className="text-white hover:text-green-400 transition-colors duration-300 text-xs sm:text-sm font-medium block">+91 620 123 4567</a>
                </div>
              </div>
              
              <div className="group flex items-start justify-center md:justify-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-red-600 transition-colors duration-300 flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 group-hover:text-gray-300 transition-colors duration-300">Location</p>
                  <p className="text-white text-xs sm:text-sm font-medium group-hover:text-gray-100 transition-colors duration-300">Ranchi, Jharkhand, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex flex-col items-center space-y-2 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                © 2024 JEHUB - Jharkhand Engineer&apos;s Hub. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</Link>
                <span className="text-gray-600">•</span>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</Link>
              </div>
            </div>
            
            {/* Scroll to Top Button */}
            <button 
              onClick={scrollToTop} 
              className="group relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-400 hover:to-red-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:animate-bounce" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
