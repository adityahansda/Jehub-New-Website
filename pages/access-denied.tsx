import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import { AlertCircle, Shield, LogIn, Home, ArrowLeft } from 'lucide-react';

interface AccessDeniedInfo {
  requiredRole: string;
  userRole: string;
  message: string;
  showAdminLogin: boolean;
}

const AccessDeniedPage: React.FC = () => {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [accessInfo, setAccessInfo] = useState<AccessDeniedInfo | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // Get access denied info from cookies
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const accessDeniedCookie = getCookieValue('access-denied-info');
    if (accessDeniedCookie) {
      try {
        const info = JSON.parse(decodeURIComponent(accessDeniedCookie));
        setAccessInfo(info);
        
        // Clear the cookie
        document.cookie = 'access-denied-info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      } catch (error) {
        console.error('Error parsing access denied info:', error);
      }
    }

    // Auto-redirect to home if user becomes authorized
    const timer = setTimeout(() => {
      if (!accessInfo) {
        router.push('/');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [accessInfo, router]);

  const handleAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50';
      case 'manager': return 'text-orange-600 bg-orange-50';
      case 'intern': return 'text-blue-600 bg-blue-50';
      case 'student': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Access Denied Alert */}
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              
              {accessInfo && (
                <div className="space-y-3">
                  <p className="text-red-700">
                    {accessInfo.message}
                  </p>
                  
                  <div className="bg-red-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-800">Required Role:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getRoleColor(accessInfo.requiredRole)}`}>
                        {accessInfo.requiredRole}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-red-800">Your Role:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getRoleColor(accessInfo.userRole)}`}>
                        {accessInfo.userRole}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex flex-col space-y-2">
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
                
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </button>
                
                {accessInfo?.showAdminLogin && (
                  <button
                    onClick={handleAdminLogin}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login as Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Admin Login</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                You need administrator privileges to access this page. Please contact your administrator or login with an admin account.
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    router.push('/login?admin=true');
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Info Display */}
        {user && userRole && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-700">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Currently logged in as{' '}
                  <span className={`font-semibold ${getRoleColor(userRole.role).split(' ')[0]}`}>
                    {userRole.role}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessDeniedPage;
