import { safeAccount } from '../lib/appwrite';
import { ID, OAuthProvider } from 'appwrite';
import { userProfileService } from './userProfile';

export interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  prefs: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

class AuthService {

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await safeAccount.get();
      if (!user) {
        return null;
      }
      return user as User;
    } catch (error) {
      return null;
    }
  }

  // Register with email and password
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const user = await safeAccount.create(
        ID.unique(),
        credentials.email,
        credentials.password,
        credentials.name
      );
      
      // Automatically log in after registration
      const loggedInUser = await this.login({
        email: credentials.email,
        password: credentials.password
      });
      
      // Create user profile in database
      try {
        await userProfileService.createUserProfile(loggedInUser);
      } catch (profileError) {
        console.error('Failed to create user profile after registration:', profileError);
        // Don't fail registration if profile creation fails
      }
      
      return user as User;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login with email and password (deprecated - use Google OAuth instead)
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      await safeAccount.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );
      
      const user = await safeAccount.get();
      
      // Create or update user profile in database
      try {
        const userProfile = await userProfileService.createUserProfile(user as User);
        if (userProfile) {
          await userProfileService.incrementLoginStreak(userProfile);
        }
      } catch (profileError) {
        console.error('Failed to handle user profile after login:', profileError);
        // Don't fail login if profile handling fails
      }
      
      return user as User;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Google OAuth login
  async loginWithGoogle(): Promise<void> {
    try {
      const successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/oauth-success`;
      const failureUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/oauth-failure`;
      
      await safeAccount.createOAuth2Session(
        OAuthProvider.Google,
        successUrl,
        failureUrl
      );
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }


  // Send password recovery email
  async sendPasswordRecovery(email: string): Promise<void> {
    try {
      const recoveryUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`;
      await safeAccount.createRecovery(email, recoveryUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send recovery email');
    }
  }

  // Reset password with recovery token
  async resetPassword(userId: string, secret: string, password: string): Promise<void> {
    try {
      await safeAccount.updateRecovery(userId, secret, password);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Update password (for logged-in users)
  async updatePassword(newPassword: string, oldPassword: string): Promise<void> {
    try {
      await safeAccount.updatePassword(newPassword, oldPassword);
    } catch (error: any) {
      throw new Error(error.message || 'Password update failed');
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<void> {
    try {
      const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/verify-email`;
      await safeAccount.createVerification(verificationUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification email');
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
}

export const authService = new AuthService();
