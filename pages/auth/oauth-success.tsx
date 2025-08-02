import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/auth';
import { profilePictureService } from '../../src/services/profilePictureService';
import { userService } from '../../src/services/userService';

const OAuthSuccess: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [attempts, setAttempts] = useState(0);
  const [debug, setDebug] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);

  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebug('OAuth success page loaded');
    addDebug(`Current user: ${user ? user.name : 'null'}`);
    
    const checkAuth = async () => {
      try {
        addDebug(`Checking auth (attempt ${attempts + 1})`);
        
        // Get the current user from Google OAuth
        const currentUser = await authService.getCurrentUser();
        addDebug(`Current OAuth user: ${currentUser ? currentUser.name : 'null'}`);
        
        if (currentUser) {
          // Check if this is a signup flow
          const isSignupFlow = sessionStorage.getItem('isSignupFlow') === 'true';
          const forceSignup = sessionStorage.getItem('forceSignup') === 'true';
          
          addDebug(`Signup flow: ${isSignupFlow}, Force signup: ${forceSignup}`);
          
          // Check if user is registered in database
          const isRegistered = await authService.isUserRegistered(currentUser.email);
          addDebug(`User registered in database: ${isRegistered}`);
          
          if (!isRegistered && !isSignupFlow && !forceSignup) {
            // User exists in Google but not in our database - redirect to signup with message
            addDebug('User not registered, redirecting to signup');
            alert('Please complete your registration first.');
            setTimeout(() => router.push('/auth/signup'), 1500);
            return;
          }
          
          if (!isRegistered && (isSignupFlow || forceSignup)) {
            // New user signing up - initialize their profile
            addDebug('Initializing new user profile');
            await authService.initializeUserAfterOAuth();
            
            // Clear signup flags
            sessionStorage.removeItem('isSignupFlow');
            sessionStorage.removeItem('forceSignup');
            
            // Redirect to home page with success message
            addDebug('New user initialized, redirecting to home page');
            alert('Sign-in successful!');
            setTimeout(() => router.push('/'), 1500);
            return;
          }
          
          if (isRegistered) {
            // Existing user - check profile completeness
            const userProfile = await userService.getUserProfile(currentUser.email);
            const isProfileComplete = userProfile?.isProfileComplete || false;
            
            addDebug(`Profile complete: ${isProfileComplete}`);
            
            // Clear any signup flags for existing users
            sessionStorage.removeItem('isSignupFlow');
            sessionStorage.removeItem('forceSignup');
            
            if (!isProfileComplete) {
              addDebug('Existing user with incomplete profile, redirecting to signup');
              setTimeout(() => router.push('/auth/signup'), 1500);
            } else {
              alert('Sign-in successful!');
              setTimeout(() => router.push('/'), 1500);
            }
            return;
          }
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
        if (error.message.includes('Failed to initialize') || error.message.includes('Account setup failed')) {
          // User creation/initialization failed - likely not in database, redirect to signup
          addDebug('Account setup failed, redirecting to signup page');
          setTimeout(() => router.push('/auth/signup'), 1500);
        } else {
          setTimeout(() => router.push('/auth/login?error=oauth_failed'), 1000);
        }
      }
    };

    // Start checking after a short delay to allow session to be established
    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [attempts, router, user, isNewUser]);

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
