import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  Calendar, 
  Users, 
  Download, 
  Upload, 
  HelpCircle, 
  UserPlus, 
  Trophy, 
  LogIn, 
  UserCheck, 
  Shield, 
  Eye,
  ExternalLink,
  Globe,
  MessageSquare,
  Briefcase
} from 'lucide-react';

const pages = [
  // Core Pages
  { id: 1, name: 'Home', path: '/', category: 'Core', description: 'Main landing page with latest updates', icon: Home, status: 'Active' },
  { id: 2, name: 'About', path: '/about', category: 'Core', description: 'Learn about JEHUB and our mission', icon: User, status: 'Active' },
  { id: 3, name: 'Blog', path: '/blog', category: 'Content', description: 'Latest articles and updates', icon: FileText, status: 'Active' },
  
  // Academic Pages
  { id: 4, name: 'Notes Download', path: '/notes-download', category: 'Academic', description: 'Download study materials and notes', icon: Download, status: 'Active' },
  { id: 5, name: 'Notes Upload', path: '/notes-upload', category: 'Academic', description: 'Upload notes and study materials', icon: Upload, status: 'Active' },
  { id: 6, name: 'Notes Request', path: '/notes-request', category: 'Academic', description: 'Request specific study materials', icon: HelpCircle, status: 'Active' },
  
  // Community Pages
  { id: 7, name: 'Groups', path: '/groups', category: 'Community', description: 'Join college groups and communities', icon: Users, status: 'Active' },
  { id: 8, name: 'Events', path: '/events', category: 'Community', description: 'Upcoming events and activities', icon: Calendar, status: 'Active' },
  { id: 9, name: 'Team', path: '/team', category: 'Community', description: 'Meet our team members', icon: Users, status: 'Active' },
  { id: 10, name: 'Leaderboard', path: '/leaderboard', category: 'Community', description: 'Top contributors and achievers', icon: Trophy, status: 'Active' },
  
  // User Management
  { id: 11, name: 'Login', path: '/login', category: 'Auth', description: 'User login page', icon: LogIn, status: 'Active' },
  { id: 12, name: 'Sign Up', path: '/signup', category: 'Auth', description: 'Create new account', icon: UserCheck, status: 'Active' },
  { id: 13, name: 'Profile', path: '/profile', category: 'User', description: 'User profile and settings', icon: User, status: 'Active' },
  { id: 14, name: 'Join Team', path: '/join-team', category: 'User', description: 'Apply to join the JEHUB team', icon: UserPlus, status: 'Active' },
  
  // Career Pages
  { id: 15, name: 'Internships', path: '/internships', category: 'Career', description: 'Find internship opportunities', icon: Briefcase, status: 'Active' },
  { id: 16, name: 'Wishlist Register', path: '/wishlist-register', category: 'Career', description: 'Register for opportunity updates', icon: MessageSquare, status: 'Active' },
  
  // Admin Pages
  { id: 17, name: 'Admin Dashboard', path: '/admin-dashboard', category: 'Admin', description: 'Administrative dashboard', icon: Shield, status: 'Restricted' },
  { id: 18, name: 'Admin PDF Validation', path: '/admin-pdf-validation', category: 'Admin', description: 'PDF validation and management', icon: FileText, status: 'Restricted' },
  { id: 19, name: 'Team Dashboard', path: '/team-dashboard', category: 'Admin', description: 'Team management dashboard', icon: Settings, status: 'Restricted' },
  { id: 20, name: 'Old Team Members', path: '/old-team-members', category: 'Admin', description: 'Former team members archive', icon: Users, status: 'Restricted' },
  
  // Demo/Test Pages
  { id: 21, name: 'Mobile Demo', path: '/mobile-demo', category: 'Demo', description: 'Mobile interface demonstration', icon: Globe, status: 'Demo' },
  { id: 22, name: 'Mobile Test', path: '/mobile-test', category: 'Demo', description: 'Mobile testing interface', icon: Globe, status: 'Demo' },
  { id: 23, name: 'Coming Soon', path: '/coming-soon', category: 'Demo', description: 'Coming soon placeholder page', icon: Globe, status: 'Demo' },
];

const PageIndex = () => {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredPages = categoryFilter === 'All'
    ? pages
    : pages.filter(page => page.category === categoryFilter);

  const handleViewPage = (path: string) => {
    router.push(path);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Restricted': return 'bg-red-100 text-red-800';
      case 'Demo': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-purple-100 text-purple-800';
      case 'Academic': return 'bg-blue-100 text-blue-800';
      case 'Community': return 'bg-green-100 text-green-800';
      case 'Auth': return 'bg-orange-100 text-orange-800';
      case 'User': return 'bg-teal-100 text-teal-800';
      case 'Career': return 'bg-indigo-100 text-indigo-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Demo': return 'bg-gray-100 text-gray-800';
      case 'Content': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['All', 'Core', 'Academic', 'Community', 'Auth', 'User', 'Career', 'Admin', 'Demo', 'Content'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            JEHUB <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Page Index</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete directory of all pages available on the JEHUB platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{pages.length}</div>
            <div className="text-gray-600 font-medium">Total Pages</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{pages.filter(p => p.status === 'Active').length}</div>
            <div className="text-gray-600 font-medium">Active Pages</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{pages.filter(p => p.status === 'Restricted').length}</div>
            <div className="text-gray-600 font-medium">Restricted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{new Set(pages.map(p => p.category)).size}</div>
            <div className="text-gray-600 font-medium">Categories</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {category} {category !== 'All' && `(${pages.filter(p => p.category === category).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <div key={page.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
                <div className="p-6">
                  {/* Page Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {page.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(page.category)}`}>
                            {page.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-600">{page.path}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {page.description}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewPage(page.path)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 group"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">View Page</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pages found
            </h3>
            <p className="text-gray-600">
              No pages match the selected category filter.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">
              💡 Page Index Help
            </p>
            <p className="text-blue-700 text-sm">
              This page provides a comprehensive overview of all available pages on the JEHUB platform. 
              Use the category filters to navigate through different sections, and click &quot;View Page&quot; to visit any page directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageIndex;
