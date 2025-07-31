import { userService } from '../services/userService';

/**
 * Determines the appropriate redirect path after login based on user's profile status
 * @param userEmail The user's email address
 * @returns The path to redirect to
 */
export const getPostLoginRedirectPath = async (userEmail: string): Promise<string> => {
  try {
    // Check if user has a profile in the database
    const isNewUser = await userService.isNewUser(userEmail);
    
    if (isNewUser) {
      // New user - redirect to complete profile
      return '/complete-profile';
    }
    
    // Existing user - check if profile is complete
    const isProfileComplete = await userService.isProfileComplete(userEmail);
    
    if (isProfileComplete) {
      // Existing user with complete profile - redirect to home
      return '/';
    } else {
      // Existing user with incomplete profile - redirect to complete profile
      return '/complete-profile';
    }
  } catch (error) {
    console.error('Error determining redirect path:', error);
    // Default to complete profile if there's an error
    return '/complete-profile';
  }
};

/**
 * Handles the redirect after successful login
 * @param userEmail The user's email address
 * @param router Next.js router instance
 */
export const handlePostLoginRedirect = async (userEmail: string, router: any) => {
  const redirectPath = await getPostLoginRedirectPath(userEmail);
  router.push(redirectPath);
};
