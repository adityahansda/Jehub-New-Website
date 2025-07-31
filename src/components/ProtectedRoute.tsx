import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'manager' | 'intern' | 'student' | 'user';
}

const roleHierarchy = {
  admin: 5,
  manager: 4,
  intern: 3,
  student: 2,
  user: 1
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        console.log('ProtectedRoute: No user found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        console.log('ProtectedRoute: Checking access for user:', user.email);
        console.log('ProtectedRoute: Required role:', requiredRole);
        
        // Get user profile to check role
        const profile = await userService.getUserProfile(user.email);
        console.log('ProtectedRoute: User profile:', profile);
        
        const currentRole = profile?.role || 'user';
        console.log('ProtectedRoute: Current user role:', currentRole);
        setUserRole(currentRole);

        // Check if user has required role level
        const userRoleLevel = roleHierarchy[currentRole as keyof typeof roleHierarchy] || 1;
        const requiredRoleLevel = roleHierarchy[requiredRole];
        
        console.log('ProtectedRoute: User role level:', userRoleLevel);
        console.log('ProtectedRoute: Required role level:', requiredRoleLevel);

        if (userRoleLevel >= requiredRoleLevel) {
          console.log('ProtectedRoute: Access granted');
          setHasAccess(true);
        } else {
          console.log('ProtectedRoute: Access denied');
          setHasAccess(false);
        }
      } catch (error) {
        console.error('ProtectedRoute: Error checking user role:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [user, loading, router, requiredRole]);

  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need {requiredRole} role to access this page. Your current role: {userRole}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.back()}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
