import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Users, Search, Filter, Share2, UserPlus, Shield, CheckCircle, Clock, MapPin, MessageCircle, Star, ExternalLink, Menu } from 'lucide-react';
import UniversalSidebar from '../../src/components/UniversalSidebar';
import PageHeader from '../../src/components/PageHeader';

const Groups = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mainCommunityGroups = [
    {
      id: 'main-telegram',
      name: 'JEHUB Main Community',
      platform: 'Telegram',
      members: 5247,
      description: 'Official JEHUB Telegram community for all students across Jharkhand',
      link: 'https://t.me/jehub_main',
      icon: '📱',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'main-whatsapp',
      name: 'JEHUB Study Group',
      platform: 'WhatsApp',
      members: 3156,
      description: 'WhatsApp group for quick discussions and study materials sharing',
      link: 'https://chat.whatsapp.com/jehub',
      icon: '💬',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const groups = [
    {
      id: 1,
      name: 'Jharkhand University of Technology - B.Tech',
      location: 'Ranchi, Jharkhand',
      members: 1247,
      activeMembers: 342,
      isActive: true,
      admin: 'Dr. Rajesh Kumar',
      description: 'JUT B.Tech student community for academic discussions and resources.',
      avatar: '/images/jut-logo.png',
      joinedDate: '2024-01-15',
      category: 'University',
      studyType: 'B.Tech'
    },
    {
      id: 2,
      name: 'Jharkhand University of Technology - Diploma',
      location: 'Ranchi, Jharkhand',
      members: 689,
      activeMembers: 198,
      isActive: true,
      admin: 'Prof. Sunita Devi',
      description: 'JUT Diploma student community for technical learning and development.',
      avatar: '/images/jut-logo.png',
      joinedDate: '2024-01-15',
      category: 'University',
      studyType: 'Diploma'
    },
    {
      id: 3,
      name: 'Birla Institute of Technology - B.Tech',
      location: 'Mesra, Jharkhand',
      members: 2156,
      activeMembers: 678,
      isActive: true,
      admin: 'Prof. Anita Sharma',
      description: 'BIT Mesra B.Tech student hub for engineering excellence and innovation.',
      avatar: '/images/bit-logo.png',
      joinedDate: '2024-02-20',
      category: 'Institute',
      studyType: 'B.Tech'
    },
    {
      id: 4,
      name: 'National Institute of Technology - B.Tech',
      location: 'Jamshedpur, Jharkhand',
      members: 1834,
      activeMembers: 521,
      isActive: true,
      admin: 'Dr. Vikram Singh',
      description: 'NIT Jamshedpur B.Tech community for technical learning and development.',
      avatar: '/images/nit-logo.png',
      joinedDate: '2024-03-10',
      category: 'Institute',
      studyType: 'B.Tech'
    },
    {
      id: 5,
      name: 'Ranchi University - General',
      location: 'Ranchi, Jharkhand',
      members: 967,
      activeMembers: 287,
      isActive: false,
      admin: 'Dr. Priya Kumari',
      description: 'Ranchi University student group for academic collaboration.',
      avatar: '/images/ru-logo.png',
      joinedDate: '2024-01-05',
      category: 'University',
      studyType: 'Other'
    },
    {
      id: 6,
      name: 'Indian School of Mines - B.Tech',
      location: 'Dhanbad, Jharkhand',
      members: 1521,
      activeMembers: 445,
      isActive: true,
      admin: 'Prof. Amit Jha',
      description: 'ISM Dhanbad B.Tech community for mining and engineering studies.',
      avatar: '/images/ism-logo.png',
      joinedDate: '2024-02-28',
      category: 'Institute',
      studyType: 'B.Tech'
    },
    {
      id: 7,
      name: 'Central University of Jharkhand - General',
      location: 'Ranchi, Jharkhand',
      members: 743,
      activeMembers: 198,
      isActive: true,
      admin: 'Dr. Sunita Devi',
      description: 'CUJ student network for diverse academic disciplines.',
      avatar: '/images/cuj-logo.png',
      joinedDate: '2024-03-15',
      category: 'University',
      studyType: 'Other'
    },
    {
      id: 8,
      name: 'Jharkhand Polytechnic - Diploma',
      location: 'Ranchi, Jharkhand',
      members: 892,
      activeMembers: 234,
      isActive: true,
      admin: 'Prof. Rajesh Sharma',
      description: 'State polytechnic students community for technical education.',
      avatar: '/images/jp-logo.png',
      joinedDate: '2024-03-01',
      category: 'Institute',
      studyType: 'Diploma'
    }
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && group.isActive) ||
                         (selectedFilter === 'inactive' && !group.isActive) ||
                         (selectedFilter === 'university' && group.category === 'University') ||
                         (selectedFilter === 'institute' && group.category === 'Institute');
    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'btech' && group.studyType === 'B.Tech') ||
                           (selectedCategory === 'diploma' && group.studyType === 'Diploma') ||
                           (selectedCategory === 'other' && group.studyType === 'Other');
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const handleJoinGroup = (groupId: number) => {
    console.log('Joining group:', groupId);
    // Add join logic here
  };

  const handleShareGroup = (groupId: number) => {
    console.log('Sharing group:', groupId);
    // Add share logic here
  };

  return (
    <>
      <Head>
        <title>Groups - JEHUB</title>
        <meta name="description" content="Join college groups and connect with students from various institutions in Jharkhand" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <PageHeader 
          title="Groups"
          icon={Users}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Universal Sidebar */}
        <UniversalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Hero Section - Main Community Groups */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Join Our Main Community</h2>
              <p className="text-blue-100 text-lg">Connect with thousands of students across Jharkhand</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {mainCommunityGroups.map((group) => (
                <div key={group.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${group.color} rounded-2xl flex items-center justify-center text-2xl`}>
                      {group.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{group.name}</h3>
                      <p className="text-blue-100">{group.platform}</p>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">{group.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{group.members.toLocaleString()} members</span>
                    </div>
                    <a 
                      href={group.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
                    >
                      <span>Join Now</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Groups</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="university">Universities</option>
                    <option value="institute">Institutes</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setSelectedCategory('btech')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'btech' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                B.Tech
              </button>
              <button
                onClick={() => setSelectedCategory('diploma')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'diploma' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Diploma
              </button>
              <button
                onClick={() => setSelectedCategory('other')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'other' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Other Groups
              </button>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">{group.name}</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{group.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {group.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Group Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{group.members.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{group.activeMembers.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Active Members</div>
                    </div>
                  </div>

                  {/* Admin Info */}
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Admin: </span>
                      <span className="text-sm text-gray-600">{group.admin}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Join</span>
                    </button>
                    <button
                      onClick={() => handleShareGroup(group.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default Groups;
