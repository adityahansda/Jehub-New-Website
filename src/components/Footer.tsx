import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, MessageCircle, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center">
                <Image
                  src="/images/logo2.png"
                  alt="Jharkhand Engineer's Hub"
                  width={137}
                  height={48}
                  priority
                  sizes="(max-width: 768px) 100vw, 137px"
                  style={{
                    width: 'auto',
                    height: '48px',
                    maxWidth: '137px',
                    objectFit: 'contain'
                  }}
                />
              </div>
              {/* <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                JEHUB
              </span> */}
            </Link>
            <p className="text-gray-400 text-sm">
              Empowering students to learn, share, and grow together. Join our academic community today.
            </p>
            <div className="flex space-x-4">
              <a href="https://t.me/JharkhandEnginnersHub" target="_blank" rel="noopener noreferrer" aria-label="Join our Telegram channel" className="text-gray-400 hover:text-blue-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://chat.whatsapp.com/CzByx8sK4DYGW0cqqn85rU" target="_blank" rel="noopener noreferrer" aria-label="Join our WhatsApp group" className="text-gray-400 hover:text-green-400 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/@JharkhandEngineersHub" target="_blank" rel="noopener noreferrer" aria-label="Visit our YouTube channel" className="text-gray-400 hover:text-red-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/jharkhandengineershub/" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram profile" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/notes-upload" className="text-gray-400 hover:text-white transition-colors">Upload Notes</Link></li>
              <li><Link href="/notes-download" className="text-gray-400 hover:text-white transition-colors">Download Notes</Link></li>
              <li><Link href="/notes-request" className="text-gray-400 hover:text-white transition-colors">Request Notes</Link></li>
              <li><Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/community" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/join-team" className="text-gray-400 hover:text-white transition-colors">Join Our Team</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">jharkhandengineershub@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">+91 6205981226</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400 text-sm">Jharkhand</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 JEHUB - Jharkhand Engineers Hub. All rights reserved. Made with ❤️ for students.
          </p>
        </div>
      </div>
    </footer >
  );
};

export default Footer;