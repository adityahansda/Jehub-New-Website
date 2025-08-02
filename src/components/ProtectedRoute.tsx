import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  requireAuth = true 
}) => {
  const { user, userProfile, isVerified, loading } = useAuth();
  const router = useRouter();
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If authentication is required but user is not logged in OR not verified in database
    if (requireAuth && (!user || !isVerified)) {
      if (user && !isVerified) {
        // User is logged in via Google but not registered in database - redirect to signup
        router.push('/auth/signup');
      } else {
        // User is not logged in at all - redirect to login
        router.push('/auth/login');
      }
      return;
    }

    // If specific roles are required
    if (requiredRoles.length > 0) {
      const userRole = userProfile?.role || 'user';
      
      if (!requiredRoles.includes(userRole)) {
        router.push('/auth/access-denied');
        return;
      }
    }

    // Access granted
    setAccessGranted(true);
  }, [user, userProfile, isVerified, loading, router, requiredRoles, requireAuth]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h3>
              <p className="text-red-700 mb-4">
                You don&apos;t have permission to access this page.
              </p>
              {requiredRoles.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-red-600">
                    <strong>Required roles:</strong> {requiredRoles.join(', ')}
                  </p>
                  {userProfile && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Your role:</strong> {userProfile.role || 'user'}
                    </p>
                  )}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go Home
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
