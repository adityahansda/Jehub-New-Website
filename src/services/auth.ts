import { account } from '../lib/appwrite';
import { ID } from 'appwrite';
import { pointsService } from './pointsService';
import { profilePictureService } from './profilePictureService';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { generateUniqueUserId } from '../utils/userIdGenerator';

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
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await account.get();
      return user as User;
    } catch (error) {
      console.log('No active session');
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
      const successUrl = `${window.location.origin}/auth/oauth-success`;
      const failureUrl = `${window.location.origin}/auth/oauth-failure`;
      
      account.createOAuth2Session(
        'google' as any,
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }

  // Simple Google OAuth signup
  async signupWithGoogle(): Promise<void> {
    try {
      const successUrl = `${window.location.origin}/auth/oauth-success`;
      const failureUrl = `${window.location.origin}/auth/oauth-failure`;
      
      account.createOAuth2Session(
        'google' as any,
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google signup failed');
    }
  }

  // Create new user profile (for signup flow)
  async createNewUserProfile(user: User, referralCode?: string): Promise<void> {
    try {
      await this.createUserProfile(user, referralCode);
    } catch (error: any) {
      console.error('Error creating new user profile:', error);
      throw new Error('Failed to create user account');
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
        const session = await account.getSession('current');
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
      await account.deleteSession('current');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<void> {
    try {
      const resetUrl = `${window.location.origin}/auth/reset-password`;
      await account.createRecovery(email, resetUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Password recovery failed');
    }
  }

  // Complete password recovery
  async completePasswordRecovery(userId: string, secret: string, password: string): Promise<void> {
    try {
      await account.updateRecovery(userId, secret, password);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await account.updatePassword(newPassword, oldPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  // Change email
  async changeEmail(newEmail: string, password: string): Promise<void> {
    try {
      await account.updateEmail(newEmail, password);
    } catch (error: any) {
      throw new Error(error.message || 'Email change failed');
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<void> {
    try {
      const verifyUrl = `${window.location.origin}/auth/verify-email`;
      await account.createVerification(verifyUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }
}

export const authService = new AuthService();
