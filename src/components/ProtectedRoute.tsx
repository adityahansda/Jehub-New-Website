import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/authUtils';
import RoleVerificationWrapper from './RoleVerificationWrapper';


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

  // Always call useEffect at the top level
  useEffect(() => {
    if (loading) return;
    
    if (!userRole && requiredRole === 'user') {
      router.push('/login');
      return;
    }
  }, [userRole, loading, router, requiredRole]);

  // For basic user role (default), just check authentication without heavy verification
  if (requiredRole === 'user') {
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

    return <>{children}</>;
  }

  // For specific roles, use the RoleVerificationWrapper with loading states
  return (
    <RoleVerificationWrapper 
      requiredRole={requiredRole}
      loadingMessage={`Verifying ${requiredRole} permissions...`}
    >
      {children}
    </RoleVerificationWrapper>
  );
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
