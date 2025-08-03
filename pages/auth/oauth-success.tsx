import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../src/services/auth';
import { account } from '../../src/lib/appwrite';
import { useAuth } from '../../src/contexts/AuthContext';

const OAuthSuccess: React.FC = () => {
  const router = useRouter();
  const { forceRefreshAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const [debug, setDebug] = useState<string[]>([]);
  const hasProcessed = useRef(false);

  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Prevent multiple executions in React StrictMode
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

    const handleOAuthSuccess = async () => {
      try {
        addDebug('OAuth success page loaded - checking URL parameters...');
        console.log('OAuth Success: Initiating check...');
        
        // Check URL parameters for OAuth success indicators
        const urlParams = new URLSearchParams(window.location.search);
        const fragment = window.location.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragment);
        
        addDebug(`URL search params: ${window.location.search}`);
        addDebug(`URL fragment: ${window.location.hash}`);
        
        // Look for OAuth success indicators in URL
        const hasOAuthSuccess = urlParams.has('success') || 
                              fragmentParams.has('success') ||
                              urlParams.has('userId') ||
                              fragmentParams.has('userId') ||
                              window.location.pathname.includes('oauth-success');
        
        if (!hasOAuthSuccess) {
          addDebug('No OAuth success indicators found in URL');
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        addDebug('OAuth success indicators found, attempting to establish session...');
        
        // Try to create session from URL parameters if available
        const userId = urlParams.get('userId') || fragmentParams.get('userId');
        const secret = urlParams.get('secret') || fragmentParams.get('secret');
        
        if (userId && secret) {
          addDebug(`Found OAuth parameters: userId=${userId}, secret=***`);
          try {
            await account.createSession(userId, secret);
            addDebug('Session created successfully from OAuth parameters');
          } catch (sessionError: any) {
            addDebug(`Session creation failed: ${sessionError.message}`);
            // Continue to try other methods
          }
        }
        
        // Wait a moment for any session to be established
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the current user with retries
        let currentUser = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!currentUser && attempts < maxAttempts) {
          attempts++;
          addDebug(`Attempt ${attempts} to get current user...`);
          
          try {
            currentUser = await authService.getCurrentUser();
            if (currentUser) {
              addDebug(`Successfully authenticated user: ${currentUser.email}`);
              break;
            }
          } catch (error: any) {
            addDebug(`Attempt ${attempts} failed: ${error.message}`);
          }
          
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
        
        if (!currentUser) {
          console.error('OAuth Success: No authenticated user found after all attempts');
          addDebug('No authenticated user found - this indicates OAuth configuration issue');
          addDebug('Please check Appwrite OAuth settings and Google Cloud Console');
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        if (!currentUser.email) {
          console.error('OAuth Success: User email is missing');
          addDebug('User email is missing from OAuth response');
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        addDebug(`User authenticated: ${currentUser.email}`);
        
        // Check if user is registered in our database
        const isRegistered = await authService.isUserRegistered(currentUser.email);
        addDebug(`User registered in database: ${isRegistered}`);
        
        if (isRegistered) {
          console.log('OAuth Success: User is registered, redirecting to home');
          addDebug('User is registered, refreshing auth context and redirecting to home');
          
          // Refresh auth context first
          await forceRefreshAuth();
          
          // Small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Redirect to home
          router.replace('/');
        } else {
          console.log('OAuth Success: User not registered, redirecting to signup');
          addDebug('User not registered, redirecting to signup page');
          
          // Refresh auth context to ensure user state is correct
          await forceRefreshAuth();
          
          // Don't logout - keep the OAuth session for signup
          router.replace('/auth/signup');
        }
        
      } catch (error: any) {
        console.error('OAuth Success: Error occurred:', error);
        addDebug(`Error: ${error.message || 'Unknown error occurred'}`);
        router.replace('/login?error=oauth_failed');
      } finally {
        setChecking(false);
      }
    };
    
    handleOAuthSuccess();
  }, [router, forceRefreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg">
        {checking && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {checking ? 'Completing Sign In...' : 'Redirecting...'}
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we process your Google sign-in.
        </p>
        
        {/* Debug information - only in development */}
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
