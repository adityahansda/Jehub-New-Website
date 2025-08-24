import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../src/services/auth';
import { useAuth } from '../../src/contexts/AuthContext';
import { userProfileService } from '../../src/services/userProfile';


const OAuthSuccess: React.FC = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Wait a bit for OAuth to establish session
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the current user with retry logic
        let currentUser = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!currentUser && attempts < maxAttempts) {
          try {
            currentUser = await authService.getCurrentUser();
            if (!currentUser && attempts < maxAttempts - 1) {
              // Wait a bit more before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.warn(`OAuth attempt ${attempts + 1} failed:`, error);
          }
          attempts++;
        }
        
        if (!currentUser) {
          console.error('OAuth Success: No user found after', maxAttempts, 'attempts');
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        if (!currentUser.email) {
          console.error('OAuth Success: User found but no email');
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        // Create or update user profile in database
        console.log('Creating/updating user profile in database...');
        try {
          const userProfile = await userProfileService.createUserProfile(currentUser);
          if (userProfile) {
            console.log('User profile processed successfully:', userProfile.email);
            // Increment login streak for existing users
            await userProfileService.incrementLoginStreak(userProfile);
          } else {
            console.warn('Failed to create/update user profile, continuing with login...');
          }
        } catch (profileError) {
          console.error('Error handling user profile:', profileError);
          // Don't block login if profile creation fails
        }
        
        // User is authenticated, redirect to home or requested page
        const redirectParam = new URL(window.location.href).searchParams.get('redirect') || '/';
        router.replace(redirectParam);
        
      } catch (error: any) {
        console.error('OAuth Success: Error occurred:', error);
        router.replace('/login?error=oauth_failed');
      } finally {
        setChecking(false);
      }
    };
    
    handleOAuthSuccess();
  }, [router]);

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
      </div>
    </div>
  );
};

export default OAuthSuccess;
