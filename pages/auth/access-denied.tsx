import React from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, Home, ArrowLeft, Shield, User } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';
import { getDashboardUrl } from '../../src/utils/dashboardRouter';

const AccessDeniedPage: React.FC = () => {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    const dashboardUrl = getDashboardUrl(userProfile);
    router.push(dashboardUrl);
  };

  const userRole = userProfile?.role || 'user';
  const isStudent = userRole === 'student' || userRole === 'user';
  const isAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'intern';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Access Denied Alert */}
        <div className="bg-white rounded-lg shadow-lg border border-yellow-200 p-6 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              
              <div className="mb-4">
                {user ? (
                  <div>
                    <p className="text-red-700 mb-2">
                      You don&apos;t have permission to access this page.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Your Role:</span>
                        <span className="capitalize bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          {userRole}
                        </span>
                      </div>
                    </div>
                    {isStudent && (
                      <p className="text-sm text-red-600">
                        Students cannot access admin pages. You&apos;ll be redirected to your dashboard.
                      </p>
                    )}
                    {isAdmin && (
                      <p className="text-sm text-red-600">
                        This page may not exist or you may need additional permissions.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-700">
                    You need to be logged in to access this page.
                  </p>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                {user && (
                  <button
                    onClick={handleGoToDashboard}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Go to Your Dashboard
                  </button>
                )}
                
                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </button>
                
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
