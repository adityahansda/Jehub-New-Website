import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleVerification, UserRole } from '../../hooks/useRoleVerification';
import { Loader2, AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackPath?: string;
  showAccessDenied?: boolean;
  redirectDelay?: number;
}

/**
 * RoleGuard component that protects routes based on user roles
 * 
 * @param children - Components to render if access is granted
 * @param requiredRole - Minimum role required to access the content
 * @param fallbackPath - Path to redirect to if access is denied (default: '/dashboard')
 * @param showAccessDenied - Whether to show access denied page or redirect immediately (default: true)
 * @param redirectDelay - Delay in milliseconds before auto-redirect (default: 5000)
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  fallbackPath = '/dashboard',
  showAccessDenied = true,
  redirectDelay = 5000
}) => {
  const { user } = useAuth();
  const { userRole, hasAccess, loading: roleLoading } = useRoleVerification();
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!roleLoading && user) {
      const hasRequiredAccess = hasAccess(requiredRole);
      
      if (!hasRequiredAccess) {
        console.log(`Access denied: User role '${userRole}' insufficient for required role '${requiredRole}'`);
        setAccessDenied(true);
        
        // Redirect after delay if showAccessDenied is true, immediately otherwise
        const delay = showAccessDenied ? redirectDelay : 0;
        setTimeout(() => {
          router.push(fallbackPath);
        }, delay);
        return;
      }
      
      setAccessDenied(false);
    }
  }, [user, userRole, roleLoading, hasAccess, requiredRole, router, fallbackPath, showAccessDenied, redirectDelay]);

  // Show loading state while checking authentication and role
  if (roleLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Verifying Access...</h2>
        <p className="text-gray-500 mt-2">Please wait while we check your permissions</p>
      </div>
    );
  }

  // Show access denied message or redirect immediately based on showAccessDenied prop
  if (accessDenied) {
    if (!showAccessDenied) {
      return null; // Will redirect immediately
    }

    return (
      <div className="min-h-screen bg-red-50 p-6 flex flex-col items-center justify-center">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-2">You do not have permission to access this page.</p>
          <p className="text-sm text-gray-600 mb-4">
            Current role: <span className="font-semibold">{userRole || 'Unknown'}</span>
          </p>
          <p className="text-red-600 font-medium mb-6">
            Required role: <span className="capitalize">{requiredRole}</span> or above
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.push(fallbackPath)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </button>
            <button 
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
        <p className="text-red-500 mt-4 text-sm">
          Auto-redirecting in {redirectDelay / 1000} seconds...
        </p>
      </div>
    );
  }

  // Render children if access is granted
  return <>{children}</>;
};

export default RoleGuard;
