import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Shield, LogIn, Home, Loader2, RefreshCw } from 'lucide-react';

interface RoleVerificationWrapperProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'manager' | 'intern' | 'student' | 'user';
  loadingMessage?: string;
}

interface VerificationState {
  isVerifying: boolean;
  isVerified: boolean;
  hasPermission: boolean;
  error: string | null;
}

const RoleVerificationWrapper: React.FC<RoleVerificationWrapperProps> = ({
  children,
  requiredRole,
  loadingMessage = 'Verifying your permissions...'
}) => {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [verification, setVerification] = useState<VerificationState>({
    isVerifying: true,
    isVerified: false,
    hasPermission: false,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (authLoading) return; // Wait for auth context to finish loading

    verifyRoleAccess();
  }, [user, userRole, authLoading, requiredRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyRoleAccess = async () => {
    if (!user) {
      // User not authenticated - redirect to login
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setVerification(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      // Simulate a brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!userRole) {
        throw new Error('Unable to determine user role. Please try again.');
      }

      // Check role hierarchy
      const roleHierarchy = {
        admin: 5,
        manager: 4,
        intern: 3,
        student: 2,
        user: 1,
      };

      const userRoleLevel = roleHierarchy[userRole.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];
      const hasPermission = userRoleLevel >= requiredRoleLevel;

      setVerification({
        isVerifying: false,
        isVerified: true,
        hasPermission,
        error: null,
      });

    } catch (error: any) {
      console.error('Role verification error:', error);
      setVerification({
        isVerifying: false,
        isVerified: false,
        hasPermission: false,
        error: error.message || 'Failed to verify permissions',
      });
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      verifyRoleAccess();
    }
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

  // Show loading state while verifying
  if (authLoading || verification.isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {loadingMessage}
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we verify your access permissions...
            </p>
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <p className="text-blue-700 text-xs">
                Required Role: <span className="font-semibold uppercase">{requiredRole}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if verification failed
  if (verification.error && !verification.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Verification Failed
                </h3>
                
                <p className="text-red-700 mb-4">
                  {verification.error}
                </p>
                
                <div className="bg-red-50 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm font-medium">
                    If this error persists, please contact your administrator.
                  </p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {retryCount < maxRetries && (
                    <button
                      onClick={handleRetry}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Verification ({maxRetries - retryCount} left)
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </button>
                  
                  <button
                    onClick={() => router.push('/login?admin=true')}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login as Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if verification succeeded but user doesn't have permission
  if (verification.isVerified && !verification.hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Access Denied
                </h3>
                
                <p className="text-red-700 mb-4">
                  You don&apos;t have the required permissions to access this page.
                </p>
                
                <div className="bg-red-50 rounded-lg p-3 space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-800">Required Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getRoleColor(requiredRole)}`}>
                      {requiredRole}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-800">Your Role:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getRoleColor(userRole?.role || 'user')}`}>
                      {userRole?.role || 'user'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Back
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </button>
                  
                  {userRole?.role !== 'admin' && (
                    <button
                      onClick={() => router.push('/login?admin=true')}
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
        </div>
      </div>
    );
  }

  // If everything is verified and user has permission, render children
  return <>{children}</>;
};

export default RoleVerificationWrapper;
