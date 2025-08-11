import { safeAccount } from '../lib/appwrite';
import { ID } from 'appwrite';
import { pointsService } from './pointsService';
import { profilePictureService } from './profilePictureService';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { generateUniqueUserId } from '../utils/userIdGenerator';
import { deviceTrackingService } from './deviceTrackingService';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  prefs: Record<string, any>;
}

class AuthService {
  private setCookieConsentIfMissing(): void {
    if (typeof document === 'undefined') return;
    const hasConsent = document.cookie.split('; ').some(row => row.startsWith('cookie_consent='));
    if (!hasConsent) {
      document.cookie = 'cookie_consent=1; path=/; max-age=31536000; SameSite=Lax';
    }
  }

  private buildOAuthRedirectUrls(): { successUrl: string; failureUrl: string } {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    const currentUrl = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    const ref = currentUrl?.searchParams.get('ref') || sessionStorage.getItem('referralCode') || '';
    if (ref) params.set('ref', ref);
    const redirectParam = currentUrl?.searchParams.get('redirect') || '';
    if (redirectParam) params.set('redirect', redirectParam);
    const success = `${origin}/auth/oauth-success${params.toString() ? `?${params.toString()}` : ''}`;
    const failure = `${origin}/auth/oauth-failure`;
    return { successUrl: success, failureUrl: failure };
  }

  async startGoogleOAuth(): Promise<void> {
    this.setCookieConsentIfMissing();
    const { successUrl, failureUrl } = this.buildOAuthRedirectUrls();
    await safeAccount.createOAuth2Session('google' as any, successUrl, failureUrl);
  }
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      // First check if we have any sessions
      const sessions = await safeAccount.listSessions();
      const sessionCount = Array.isArray(sessions)
        ? sessions.length
        : (sessions as any)?.sessions?.length ?? 0;
      console.log(`Found ${sessionCount} active sessions`);
      
      if (sessionCount === 0) {
        console.log('No active sessions found');
        return null;
      }
      
      const user = await safeAccount.get();

      if (!user) {
        console.log('No active session - user data not available');
        return null;
      }

      console.log(`User authenticated: ${user.email}`);
      
      // Track device login
      await deviceTrackingService.trackDeviceLogin(user.$id, user.email || '');

      return user as User;
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  }

  // Email/password login is disabled - only Google OAuth allowed
  async login(email: string, password: string): Promise<User> {
    throw new Error('Email/password login is disabled. Please use Google Sign-In only.');
  }

  // Email/password registration is disabled - only Google OAuth allowed
  async register(email: string, password: string, name: string): Promise<User> {
    throw new Error('Email/password registration is disabled. Please use Google Sign-In only.');
  }

  // Check if email exists in Google accounts (pre-OAuth check)
  async checkUserBeforeOAuth(email: string): Promise<{ exists: boolean; registered: boolean; message: string }> {
    try {
      // Check if user is registered in our database
      const isRegistered = await this.isUserRegistered(email);
      
      if (isRegistered) {
        return {
          exists: true,
          registered: true,
          message: 'User is registered and can sign in'
        };
      } else {
        return {
          exists: false,
          registered: false,
          message: 'User not found in database. Please sign up first.'
        };
      }
    } catch (error: any) {
      console.error('Error checking user before OAuth:', error);
      return {
        exists: false,
        registered: false,
        message: 'Error checking user status'
      };
    }
  }

  // Simple Google OAuth login
  async loginWithGoogle(): Promise<void> {
    try {
      await this.startGoogleOAuth();
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }

  // Simple Google OAuth signup
  async signupWithGoogle(): Promise<void> {
    try {
      await this.startGoogleOAuth();
    } catch (error: any) {
      throw new Error(error.message || 'Google signup failed');
    }
  }

  // Create new user profile (for signup flow)
  async createNewUserProfile(user: User, referralCode?: string): Promise<void> {
    try {
      console.log('Creating new user profile for:', user.email);
      await this.createUserProfile(user, referralCode);
      console.log('User profile created successfully for:', user.email);
    } catch (error: any) {
      console.error('Error creating new user profile:', error);
      throw new Error(`Failed to create user account: ${error.message}`);
    }
  }

  // Create user profile in database
  private async createUserProfile(user: User, referralCode?: string): Promise<void> {
    try {
      // Generate unique 8-digit numeric user ID
      const customUserId = await generateUniqueUserId();
      console.log(`Generated 8-digit user ID: ${customUserId} for ${user.email}`);
      
      // Try to get Google profile picture if available
      let profileImageUrl: string | null = null;
      
      try {
        const session = await safeAccount.getSession('current');
        if (session && session.providerAccessToken) {
          const { profilePictureService } = await import('./profilePictureService');
          const googleUserInfo = await profilePictureService.fetchGoogleUserInfo(session.providerAccessToken);
          
          if (googleUserInfo && googleUserInfo.picture) {
            profileImageUrl = googleUserInfo.picture;
            console.log(`Found Google profile picture for ${user.email}: ${profileImageUrl}`);
          }
        }
      } catch (profileError) {
        console.log('Could not fetch Google profile picture during user creation:', profileError);
      }
      
      console.log('Creating user document with:', {
        databaseId: DATABASE_ID,
        collectionId: USERS_COLLECTION_ID,
        documentId: customUserId,
        userEmail: user.email
      });
      
      // Create user profile document with custom 8-digit ID as document ID
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        customUserId,  // Use custom 8-digit ID as document ID
        {
          userId: customUserId,  // Also store as userId field for consistency
          authId: user.$id,      // Store original OAuth ID for reference
          name: user.name,
          email: user.email,
          joinDate: new Date().toISOString(),
          role: 'student',
          isProfileComplete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(profileImageUrl && { profileImageUrl })
        }
      );

      // Initialize with points system using the custom user ID
      await pointsService.initializeNewUser(customUserId, user.email, user.name, referralCode || undefined);
      
      console.log(`Created new user profile for ${user.email} with ID: ${customUserId}`);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Check if user is registered in database (public method)
  async isUserRegistered(email: string): Promise<boolean> {
    try {
      if (!email) {
        console.error('Email is required for user registration check');
        return false;
      }

      const profile = await this.getUserProfile(email);
      return profile !== null;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }

  // Get user profile from database
  private async getUserProfile(email: string): Promise<any> {
    try {
      if (!DATABASE_ID || !USERS_COLLECTION_ID) {
        throw new Error('Missing database configuration');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', email)]
      );
      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await safeAccount.deleteSession('current');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<void> {
    try {
      const resetUrl = `${window.location.origin}/auth/reset-password`;
      await safeAccount.createRecovery(email, resetUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Password recovery failed');
    }
  }

  // Complete password recovery
  async completePasswordRecovery(userId: string, secret: string, password: string): Promise<void> {
    try {
      await safeAccount.updateRecovery(userId, secret, password);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await safeAccount.updatePassword(newPassword, oldPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  // Change email
  async changeEmail(newEmail: string, password: string): Promise<void> {
    try {
      await safeAccount.updateEmail(newEmail, password);
    } catch (error: any) {
      throw new Error(error.message || 'Email change failed');
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<void> {
    try {
      const verifyUrl = `${window.location.origin}/auth/verify-email`;
      await safeAccount.createVerification(verifyUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }
}

export const authService = new AuthService();
