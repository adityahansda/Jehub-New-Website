import React from 'react';
import Link from 'next/link';
import { 
  Home, Download, Upload, Users, Calendar, Briefcase, 
  Trophy, BookOpen, User, Settings, MessageCircle, 
  Star, FileText, ArrowRight, Layers
} from 'lucide-react';

const PageIndex = () => {
  const pageCategories = [
    {
      title: 'Main Pages',
      description: 'Core pages and primary functionality',
      pages: [
        { name: 'Home', path: '/', icon: Home, description: 'Main dashboard and landing page' },
        { name: 'About JEHUB', path: '/about', icon: BookOpen, description: 'Learn about our platform and mission' },
        { name: 'Blog & Updates', path: '/blog', icon: MessageCircle, description: 'Latest news and updates' },
      ]
    },
    {
      title: 'Notes & Resources',
      description: 'Academic materials and study resources',
      pages: [
        { name: 'Download Notes', path: '/notes-download', icon: Download, description: 'Access study materials and notes' },
        { name: 'Upload Notes', path: '/notes-upload', icon: Upload, description: 'Share your notes with community' },
        { name: 'Request Notes', path: '/notes-request', icon: FileText, description: 'Request specific study materials' },
      ]
    },
    {
      title: 'Community & Groups',
      description: 'Connect with fellow students',
      pages: [
        { name: 'College Groups', path: '/groups', icon: Users, description: 'Join your college community' },
        { name: 'Events', path: '/events', icon: Calendar, description: 'Upcoming workshops and competitions' },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, description: 'Top contributors and achievers' },
      ]
    },
    {
      title: 'Opportunities',
      description: 'Career and growth opportunities',
      pages: [
        { name: 'Internships', path: '/internships', icon: Briefcase, description: 'Find internship opportunities' },
        { name: 'Join Team', path: '/join-team', icon: Star, description: 'Join the JEHUB team' },
        { name: 'Wishlist', path: '/wishlist', icon: Star, description: 'Save your favorite content' },
      ]
    },
    {
      title: 'User Account',
      description: 'Profile and account management',
      pages: [
        { name: 'Profile', path: '/profile', icon: User, description: 'View and edit your profile' },
        { name: 'Settings', path: '/settings', icon: Settings, description: 'Account settings and preferences' },
        { name: 'Login', path: '/login', icon: User, description: 'Sign in to your account' },
        { name: 'Sign Up', path: '/signup', icon: User, description: 'Create a new account' },
      ]
    },
    {
      title: 'Team & Organization',
      description: 'About our team and organization',
      pages: [
        { name: 'Team', path: '/team', icon: Users, description: 'Meet our team members' },
        { name: 'Team Dashboard', path: '/team/team-dashboard', icon: Layers, description: 'Internal team dashboard' },
        { name: 'Old Team Members', path: '/team/old-team-members', icon: Users, description: 'Former team members' },
      ]
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Page Index
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore all available pages on JEHUB. Find everything from study materials to community features in one organized view.
          </p>
        </div>

        {/* Page Categories */}
        <div className="space-y-12">
          {pageCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {category.title}
                </h2>
                <p className="text-gray-600">
                  {category.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.pages.map((page, pageIndex) => {
                  const Icon = page.icon;
                  return (
                    <Link 
                      key={pageIndex} 
                      href={page.path}
                      className="group bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {page.description}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">30+</div>
                <div className="text-gray-600">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                <div className="text-gray-600">Main Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                <div className="text-gray-600">Daily Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Availability</div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help Finding Something?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you navigate through all available features and pages.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageIndex;
