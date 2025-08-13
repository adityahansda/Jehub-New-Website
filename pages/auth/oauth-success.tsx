import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../src/services/auth';
import { account, safeAccount } from '../../src/lib/appwrite';
import { useAuth } from '../../src/contexts/AuthContext';
import { profilePictureService } from '../../src/services/profilePictureService';
import { extractGoogleProfilePictureUrl } from '../../src/lib/profileUtils';

// Helper function to detect incognito/private browsing mode
const detectIncognitoMode = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Method 1: Try to detect via localStorage
    try {
      if (typeof window !== 'undefined') {
        // Test localStorage availability
        localStorage.setItem('__incognito_test__', '1');
        localStorage.removeItem('__incognito_test__');
        
        // Method 2: Check for reduced functionality indicators
        const isPrivate = (
          // Check if indexedDB is available but disabled
          !window.indexedDB ||
          // Check if storage API is available
          !navigator.storage ||
          // Check webRTC availability
          !window.RTCPeerConnection ||
          // Check for reduced navigator properties
          !navigator.cookieEnabled
        );
        
        resolve(isPrivate);
      } else {
        resolve(false);
      }
    } catch (e) {
      // If localStorage throws, likely in incognito mode
      resolve(true);
    }
  });
};

// Helper function to process authenticated user
const processAuthenticatedUser = async (currentUser: any): Promise<void> => {
  // This function would contain the user processing logic
  // For now, it's a placeholder that matches the existing flow
  throw new Error('processAuthenticatedUser not yet implemented in this context');
};

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
        
        // Detect if we're in incognito/private mode
        const isIncognito = await detectIncognitoMode();
        if (isIncognito) {
          addDebug('⚠️ Incognito/Private browsing detected - using fallback methods');
        }
        
        // Check URL parameters for OAuth success indicators
        const urlParams = new URLSearchParams(window.location.search);
        const fragment = window.location.hash.substring(1);
        const fragmentParams = new URLSearchParams(fragment);
        
        addDebug(`URL search params: ${window.location.search}`);
        addDebug(`URL fragment: ${window.location.hash}`);
        addDebug(`Full URL: ${window.location.href}`);
        
        // Log all URL parameters for debugging
        for (const [key, value] of urlParams.entries()) {
          addDebug(`URL param: ${key} = ${key.includes('secret') ? '***' : value}`);
        }
        for (const [key, value] of fragmentParams.entries()) {
          addDebug(`Fragment param: ${key} = ${key.includes('secret') ? '***' : value}`);
        }
        
        // Look for OAuth success indicators in URL
        const hasOAuthSuccess = urlParams.has('success') || 
                              fragmentParams.has('success') ||
                              urlParams.has('userId') ||
                              fragmentParams.has('userId') ||
                              urlParams.has('code') ||
                              fragmentParams.has('code') ||
                              window.location.pathname.includes('oauth-success');
        
        if (!hasOAuthSuccess) {
          addDebug('No OAuth success indicators found in URL');
          // In incognito mode, try to wait longer for session establishment
          if (isIncognito) {
            addDebug('Incognito mode: waiting longer for session...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Try to get current user directly
            try {
              const currentUser = await authService.getCurrentUser();
              if (currentUser) {
                addDebug('Found session in incognito mode after extended wait');
                // Continue processing with the found user
                return await processAuthenticatedUser(currentUser);
              }
            } catch (error: any) {
              addDebug(`Still no session in incognito mode: ${error.message}`);
            }
          }
          
          router.replace('/login?error=oauth_failed');
          return;
        }
        
        addDebug('OAuth success indicators found, attempting to establish session...');
        
        // Check for existing sessions first
        try {
          const sessions = await safeAccount.listSessions();
          addDebug(`Found ${sessions.length} existing sessions`);
          if (sessions.length > 0) {
            addDebug(`Session IDs: ${sessions.map((s: any) => s.$id).join(', ')}`);
          }
        } catch (error: any) {
          addDebug(`Error listing sessions: ${error.message}`);
        }
        
        // Try to create session from URL parameters if available
        const userId = urlParams.get('userId') || fragmentParams.get('userId');
        const secret = urlParams.get('secret') || fragmentParams.get('secret');
        
        if (userId && secret) {
          addDebug(`Found OAuth parameters: userId=${userId}, secret=***`);
          try {
            const session = await account.createSession(userId, secret);
            addDebug('Session created successfully: ' + JSON.stringify(session));
            // Check if cookie is set
            addDebug('Document cookies after session creation: ' + document.cookie);
          } catch (sessionError: any) {
            addDebug(`Session creation failed: ${sessionError.message}`);
            console.error('Session creation error:', sessionError);
            addDebug('Document cookies after failed session creation: ' + document.cookie);
            
            // In incognito mode, this might fail due to cookie restrictions
            if (isIncognito) {
              addDebug('Session creation failed in incognito - this is expected due to cookie restrictions');
              addDebug('Continuing with alternative session handling...');
            }
          }
        } else {
          addDebug('No userId/secret found in URL - checking if Appwrite created session automatically');
          // Try to get current session
          try {
            const currentSession = await safeAccount.getSession('current');
            if (currentSession) {
              addDebug(`Found current session: ${currentSession.$id}`);
            } else {
              addDebug('No current session found');
            }
          } catch (error: any) {
            addDebug(`Error getting current session: ${error.message}`);
          }
        }
        
        // Wait longer in incognito mode for session establishment
        const waitTime = isIncognito ? 5000 : 2000;
        addDebug(`Waiting ${waitTime}ms for session establishment (incognito: ${isIncognito})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
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
        
        // Try to fetch and store Google profile picture only if user already registered
        try {
          addDebug('Attempting to fetch Google profile picture...');
          
          // Get current session to access OAuth tokens
          const session = await account.getSession('current');
          addDebug(`Session data: ${JSON.stringify({ 
            $id: session.$id, 
            provider: session.provider,
            hasAccessToken: !!session.providerAccessToken,
            hasRefreshToken: !!session.providerRefreshToken
          })}`);
          
          if (session && session.providerAccessToken) {
            addDebug('Found OAuth access token, fetching user info...');
            
            // Fetch Google user info including profile picture
            const googleUserInfo = await profilePictureService.fetchGoogleUserInfo(session.providerAccessToken);
            addDebug(`Google user info response: ${JSON.stringify(googleUserInfo)}`);
            
            if (googleUserInfo && googleUserInfo.picture) {
              addDebug(`Found Google profile picture: ${googleUserInfo.picture}`);
              // Defer saving until after registration check; handled below
            } else {
              addDebug('No profile picture found in Google user info or failed to fetch');
              addDebug(`GoogleUserInfo structure: ${JSON.stringify(googleUserInfo)}`);
            }
          } else {
            addDebug('No OAuth access token available - cannot fetch profile picture');
            addDebug('This might be an Appwrite configuration issue or Google OAuth scope issue');
            
            // Try alternative approach - check if user already has profile data in Appwrite prefs
            if (currentUser.prefs && currentUser.prefs.picture) {
              addDebug(`Found profile picture in user prefs: ${currentUser.prefs.picture}`);
              // Defer saving until after registration check; handled below
            } else {
              addDebug('No profile picture found in user prefs either');
            }
          }
        } catch (profileError: any) {
          addDebug(`Error fetching Google profile picture: ${profileError.message}`);
          console.error('Error fetching Google profile picture:', profileError);
          // Don't fail the entire login process if profile picture fetch fails
        }
        
        // Check if user is registered in our database
        const isRegistered = await authService.isUserRegistered(currentUser.email);
        addDebug(`User registered in database: ${isRegistered}`);
        
        if (isRegistered) {
          console.log('OAuth Success: User is registered, deciding final redirect');
          addDebug('User is registered, refreshing auth context and deciding redirect');
          // Now that we know the profile exists, attempt to save profile picture if we fetched one
          try {
            const picture = (currentUser.prefs && currentUser.prefs.picture) ? currentUser.prefs.picture : undefined;
            if (picture) {
              const saved = await profilePictureService.saveProfilePictureFromGoogle(currentUser.$id, currentUser.email, picture);
              if (saved) addDebug('Saved Google profile picture after registration check');
            }
          } catch {}
          
          // Refresh auth context first
          await forceRefreshAuth();
          
          // Small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Respect redirect param; default to home. If profile is incomplete, send to signup.
          const redirectParam = new URL(window.location.href).searchParams.get('redirect') || '/';
          try {
            const target = redirectParam;
            // We don't import context here; assume forceRefreshAuth updated client state
            // Navigate to redirect target (even if signup later enforces completion)
            router.replace(target);
          } catch {
            router.replace('/');
          }
        } else {
          console.log('OAuth Success: User not registered, creating user profile...');
          addDebug('User not registered, attempting to create user profile');
          
          try {
            // Try to create user profile automatically
            await authService.createNewUserProfile(currentUser);
            addDebug('User profile created successfully');
            
            // Refresh auth context
            await forceRefreshAuth();
            
            // Redirect to signup to complete profile
            router.replace('/auth/signup');
          } catch (profileError: any) {
            addDebug(`Failed to create user profile: ${profileError.message}`);
            console.error('Error creating user profile:', profileError);
            
            // If profile creation fails, still redirect to signup
            // Refresh auth context to ensure user state is correct
            await forceRefreshAuth();
            
            // Don't logout - keep the OAuth session for signup
            router.replace('/auth/signup');
          }
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
