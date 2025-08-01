import { account } from '../lib/appwrite';
import { ID } from 'appwrite';
import { pointsService } from './pointsService';
import { profilePictureService } from './profilePictureService';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

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

  // Login with Google OAuth (with optional referral code) - for existing users
  async loginWithGoogle(referralCode?: string, forceSignup: boolean = false): Promise<void> {
    try {
      // Store referral code in session storage if provided
      if (referralCode) {
        sessionStorage.setItem('referralCode', referralCode);
      }
      
      // Store signup intent in session storage
      if (forceSignup) {
        sessionStorage.setItem('forceSignup', 'true');
      }
      
      // The success URL should redirect to a page that handles the OAuth callback
      const successUrl = `${window.location.origin}/auth/oauth-success`;
      const failureUrl = `${window.location.origin}/auth/oauth-failure`;
      
      account.createOAuth2Session(
        'google' as any, // Type assertion to handle Appwrite OAuth provider typing
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }

  // Signup with Google OAuth - for new users
  async signupWithGoogle(referralCode?: string): Promise<void> {
    try {
      // Store referral code in session storage if provided
      if (referralCode) {
        sessionStorage.setItem('referralCode', referralCode);
      }
      
      // Mark this as a signup attempt
      sessionStorage.setItem('isSignupFlow', 'true');
      
      // The success URL should redirect to a page that handles the OAuth callback
      const successUrl = `${window.location.origin}/auth/oauth-success`;
      const failureUrl = `${window.location.origin}/auth/oauth-failure`;
      
      account.createOAuth2Session(
        'google' as any, // Type assertion to handle Appwrite OAuth provider typing
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google signup failed');
    }
  }

  // Initialize user after OAuth success
  async initializeUserAfterOAuth(): Promise<User | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      // Check if user profile exists in database
      const existingProfile = await this.getUserProfile(user.email);
      
      if (!existingProfile) {
        // New user - initialize with points system
        const referralCode = sessionStorage.getItem('referralCode');
        await this.createUserProfile(user, referralCode || undefined);
        
        // Clear referral code from session
        sessionStorage.removeItem('referralCode');
      }

      return user;
    } catch (error: any) {
      console.error('Error initializing user after OAuth:', error);
      throw new Error('Failed to initialize user account');
    }
  }

  // Create user profile in database
  private async createUserProfile(user: User, referralCode?: string): Promise<void> {
    try {
      // Create user profile document
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          userId: user.$id,
          name: user.name,
          email: user.email,
          joinDate: new Date().toISOString(),
          role: 'student',
          isProfileComplete: false
        }
      );

      // Initialize with points system
      await pointsService.initializeNewUser(user.$id, user.email, user.name, referralCode || undefined);
      
      console.log(`Created new user profile for ${user.email}`);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Check if user is registered in database (public method)
  async isUserRegistered(email: string): Promise<boolean> {
    try {
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
