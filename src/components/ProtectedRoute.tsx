import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/authUtils';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'intern' | 'student' | 'user';
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'user',
  fallback 
}: ProtectedRouteProps) => {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!userRole) {
      router.push('/login');
      return;
    }
  }, [userRole, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If no user role after loading, don't render content
  if (!userRole) {
    return null;
  }


  // Check role-based authorization
  if (userRole && requiredRole !== 'user') {
    const roleHierarchy = {
      admin: 5,
      manager: 4,
      intern: 3,
      student: 2,
      user: 1,
    };

    const userRoleLevel = roleHierarchy[userRole.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      // Special handling for students - redirect to profile page
      if (userRole.role === 'student' && router.pathname !== '/profile') {
        router.push('/profile');
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        );
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">
              Required role: {requiredRole} | Your role: {userRole.role}
            </p>
            {userRole.role === 'student' && (
              <button 
                onClick={() => router.push('/profile')}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go to Profile
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

// Higher-order component for protecting pages
export const withAuth = (
  Component: React.ComponentType<any>,
  requiredRole?: 'admin' | 'manager' | 'intern' | 'student' | 'user'
) => {
  return function AuthenticatedComponent(props: any) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;
