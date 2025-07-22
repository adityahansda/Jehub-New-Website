import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Navigation, 
  Menu, 
  Bell, 
  User, 
  Home, 
  Upload, 
  Download, 
  Trophy 
} from 'lucide-react';

const MobileDemo = () => {
  const [screenSize, setScreenSize] = useState('desktop');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile');
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mobileFeatures = [
    {
      icon: Navigation,
      title: 'Bottom Tab Navigation',
      description: 'Easy thumb-friendly navigation with main actions at the bottom'
    },
    {
      icon: Menu,
      title: 'Fullscreen Menu',
      description: 'Comprehensive menu overlay for secondary navigation items'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Dropdown notification center with real-time updates'
    },
    {
      icon: User,
      title: 'User Profile',
      description: 'Quick access to user profile and account settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mobile Navigation Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our responsive mobile navigation system designed for optimal user experience across all devices.
          </p>
        </div>

        {/* Current Screen Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Screen Status</h2>
            <div className="flex items-center space-x-2">
              {screenSize === 'mobile' ? (
                <Smartphone className="h-6 w-6 text-blue-600" />
              ) : (
                <Monitor className="h-6 w-6 text-green-600" />
              )}
              <span className="font-medium capitalize text-gray-700">
                {screenSize} View
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Mobile (&lt; 768px)</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✅ Bottom tab navigation</li>
                <li>✅ Mobile header with logo</li>
                <li>✅ Fullscreen menu overlay</li>
                <li>✅ Touch-optimized buttons</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Tablet (768px - 1024px)</h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li>✅ Responsive grid layouts</li>
                <li>✅ Adaptive component sizing</li>
                <li>✅ Optimized touch targets</li>
                <li>✅ Flexible navigation</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Desktop (&gt; 1024px)</h3>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>✅ Full horizontal navigation</li>
                <li>✅ Sidebar layouts</li>
                <li>✅ Hover interactions</li>
                <li>✅ Multi-column layouts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Features */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mobile Navigation Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mobileFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mobile Preview</h2>
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showMobilePreview ? 'Hide' : 'Show'} Mobile Preview
            </button>
          </div>
          
          {showMobilePreview && (
            <div className="flex justify-center">
              <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl">
                <div className="bg-white rounded-xl overflow-hidden" style={{ width: '320px', height: '568px' }}>
                  {/* Mock Mobile Header */}
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded"></div>
                      <span className="ml-2 font-bold text-sm">JEHUB</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="p-4 flex-1">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Mobile Navigation Active</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        This is how the mobile navigation appears on actual mobile devices.
                      </p>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Bottom Navigation */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
                    <div className="flex items-center justify-around">
                      <div className="flex flex-col items-center py-1 px-2">
                        <Home className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-600 mt-1">Home</span>
                      </div>
                      <div className="flex flex-col items-center py-1 px-2">
                        <Upload className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 mt-1">Upload</span>
                      </div>
                      <div className="flex flex-col items-center py-1 px-2">
                        <Download className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 mt-1">Download</span>
                      </div>
                      <div className="flex flex-col items-center py-1 px-2">
                        <Trophy className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 mt-1">Board</span>
                      </div>
                      <div className="flex flex-col items-center py-1 px-2">
                        <Menu className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 mt-1">More</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDemo;
