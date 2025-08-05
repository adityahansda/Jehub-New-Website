import React, { useState } from 'react';
import { Users, MessageCircle, ArrowRight, School, UserPlus, ExternalLink, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const Groups = () => {
  const { user, isVerified } = useAuth();
  const router = useRouter();

  const handleJoinGroup = (link: string) => {
    if (!user || !isVerified) {
      toast.error('Please sign in to join the WhatsApp group.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClick: () => {
          router.push('/login');
        }
      });
    } else {
      window.open(link, '_blank');
      toast.success('Opening WhatsApp group...', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };
  const collegeGroups = [
    {
      id: 1,
      name: 'Jharkhand Polytechnic New Students 2024',
      description: 'Connect with new polytechnic students across Jharkhand for academic support and resources.',
      link: 'https://chat.whatsapp.com/E4TNC9nolQA9kyls3u0cfb?mode=ac_t',
      category: 'New Students',
      type: 'General'
    },
    {
      id: 2,
      name: 'Jharkhand Engineer\'s Hub',
      description: 'Main community hub for all engineering students and professionals in Jharkhand.',
      link: 'https://chat.whatsapp.com/DuHyRtYW9nqGthezXam9yZ?mode=ac_t',
      category: 'Main Hub',
      type: 'General'
    },
    {
      id: 3,
      name: 'Government Women\'s Polytechnic College Ranchi',
      description: 'Exclusive group for students of Government Women\'s Polytechnic College, Tharpakhna, Ranchi.',
      link: 'https://chat.whatsapp.com/FfHbWr8rXmlDmXAxwL9V49?mode=ac_t',
      category: 'Women\'s College',
      type: 'Polytechnic'
    },
    {
      id: 4,
      name: 'Government Women\'s Polytechnic Balidih Bokaro',
      description: 'Group for 2024-2027 batch students of Government Women\'s Polytechnic, Balidih, Bokaro.',
      link: 'https://chat.whatsapp.com/G8ExBuJIcvW8JRVidKikp7?mode=ac_t',
      category: 'Women\'s College',
      type: 'Polytechnic'
    },
    {
      id: 5,
      name: 'Govt. Polytechnic Dhanbad',
      description: 'Connect with fellow students from Government Polytechnic Dhanbad for notes and updates.',
      link: 'https://chat.whatsapp.com/BoedjU10guMCAB8Fn21Ke9?mode=ac_t',
      category: 'Government',
      type: 'Polytechnic'
    },
    {
      id: 6,
      name: 'Government Polytechnic Jagannathpur',
      description: 'Academic and social group for Government Polytechnic Jagannathpur students.',
      link: 'https://chat.whatsapp.com/LlDjmVs8aokKnIthnsGpQ5?mode=ac_t',
      category: 'Government',
      type: 'Polytechnic'
    },
    {
      id: 7,
      name: 'Career & Internship Updates',
      description: 'Get latest career opportunities, internship openings, and job updates.',
      link: 'https://chat.whatsapp.com/DxKWQFoi15u5zP8ptYxoUV?mode=ac_t',
      category: 'Career',
      type: 'Professional'
    },
    {
      id: 8,
      name: 'Government Polytechnic Khutri Bokaro 2024',
      description: '2024 batch group for Government Polytechnic, Khutri, Bokaro students.',
      link: 'https://chat.whatsapp.com/LNJtnAMpiUgLLUmTCwjH2F?mode=ac_t',
      category: 'Government',
      type: 'Polytechnic'
    },
    {
      id: 9,
      name: 'Madhupur Polytechnic',
      description: 'Community group for Madhupur Polytechnic students and alumni.',
      link: 'https://chat.whatsapp.com/CJ36PI2vMFw0TrmZG3jE2D?mode=ac_t',
      category: 'PPP Institute',
      type: 'Polytechnic'
    },
    {
      id: 10,
      name: 'Government Polytechnic Latehar',
      description: 'Academic support and networking group for Government Polytechnic Latehar.',
      link: 'https://chat.whatsapp.com/KPZQXkmfPKn6FMVpVCc8Xi?mode=ac_t',
      category: 'Government',
      type: 'Polytechnic'
    },
    {
      id: 11,
      name: 'Warriors Hub - Powered by JEHUB',
      description: 'Elite community of dedicated students and professionals powered by JEHUB.',
      link: 'https://chat.whatsapp.com/Do0E81ikx0u9lJwkphRuLH?mode=ac_t',
      category: 'Elite',
      type: 'Community'
    },
    {
      id: 12,
      name: 'General Discussion',
      description: 'Open forum for general discussions, queries, and casual conversations.',
      link: 'https://chat.whatsapp.com/FF5KeHd3GbtKRTUNzF95Vp?mode=ac_t',
      category: 'General',
      type: 'Discussion'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            WhatsApp Groups
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join WhatsApp groups for your college or area of interest. Connect with classmates, share resources, get updates, and build your network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
            <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-600 mb-2">12+</div>
            <div className="text-gray-600">Active Groups</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-green-600 mb-2">2000+</div>
            <div className="text-gray-600">Active Members</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
            <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
            <div className="text-gray-600">Daily Messages</div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {collegeGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                <MessageCircle className="h-16 w-16 text-white" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {group.category}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {group.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {group.description}
                </p>
                
<button 
                onClick={() => handleJoinGroup(group.link)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                  <MessageCircle className="h-4 w-4" />
                  Join WhatsApp Group
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Don&apos;t See Your College?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We&apos;re constantly adding new college groups. If your college isn&apos;t listed, let us know and we&apos;ll help you start a community!
          </p>
          <a 
            href="https://t.me/jehubsupport" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-decoration-none"
          >
            Request New Group
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Groups;
