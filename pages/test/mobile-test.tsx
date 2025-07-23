import React from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

const MobileTest = () => {
  const navigationLinks = [
    { path: '/', label: 'Home' },
    { path: '/notes-upload', label: 'Upload Notes' },
    { path: '/notes-download', label: 'Download Notes' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/notes-request', label: 'Request Notes' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
    { path: '/join-team', label: 'Join Team' },
    { path: '/login', label: 'Login' },
    { path: '/signup', label: 'Sign Up' },
    { path: '/profile', label: 'Profile' },
    { path: '/team', label: 'Team' },
    { path: '/team-dashboard', label: 'Team Dashboard' },
    { path: '/admin-dashboard', label: 'Admin Dashboard' },
    { path: '/old-team-members', label: 'Old Team Members' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Mobile Navigation Test</h1>
          <p className="text-gray-600 mb-8">
            This page tests all navigation links to ensure they work correctly with the mobile navigation system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900">{link.label}</span>
                </div>
                <Link
                  href={link.path}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Test Link
                </Link>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Mobile Navigation Features:</h3>
            <ul className="space-y-1 text-blue-800">
              <li>✅ Responsive header with logo and notifications</li>
              <li>✅ Bottom tab navigation for mobile devices</li>
              <li>✅ Full-screen mobile menu overlay</li>
              <li>✅ Touch-friendly navigation elements</li>
              <li>✅ Automatic mobile/desktop detection</li>
              <li>✅ PWA manifest for app-like experience</li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Test Instructions:</h3>
            <ol className="space-y-1 text-green-800 list-decimal list-inside">
              <li>Test each link above on both mobile and desktop</li>
              <li>Verify the mobile bottom navigation appears on screens &lt; 768px</li>
              <li>Check that the &quot;More&quot; menu works properly</li>
              <li>Ensure all pages load without errors</li>
              <li>Test the responsive behavior when resizing the window</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTest;
