import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/auth';

const OAuthSuccess: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState(0);
  const [debug, setDebug] = useState<string[]>([]);

  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebug('OAuth success page loaded');
    addDebug(`Current user: ${user ? user.name : 'null'}`);
    
    const checkAuth = async () => {
      try {
        addDebug(`Checking auth (attempt ${attempts + 1})`);
        const currentUser = await authService.getCurrentUser();
        addDebug(`Auth check result: ${currentUser ? currentUser.name : 'null'}`);
        
        if (currentUser) {
          addDebug('User found, redirecting to complete profile');
          setTimeout(() => router.push('/complete-profile'), 1000);
          return;
        }
        
        // Retry up to 5 times
        if (attempts < 5) {
          setAttempts(prev => prev + 1);
          setTimeout(checkAuth, 1000);
        } else {
          addDebug('Max attempts reached, redirecting to login with error');
          setTimeout(() => router.push('/auth/login?error=oauth_failed'), 1000);
        }
      } catch (error: any) {
        addDebug(`Auth check error: ${error.message}`);
        setTimeout(() => router.push('/auth/login?error=oauth_failed'), 1000);
      }
    };

    // Start checking after a short delay to allow session to be established
    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [attempts, router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Sign In...
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we complete your Google sign-in.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Attempt {attempts + 1} of 5
        </p>
        
        {/* Debug information - remove in production */}
        {process.env.NODE_ENV === 'development' && debug.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Log:</h3>
            <div className="text-xs text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {debug.map((msg, idx) => (
                <div key={idx}>{msg}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;
