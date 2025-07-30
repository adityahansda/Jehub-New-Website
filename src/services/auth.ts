import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

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

  // Login with email and password
  async login(email: string, password: string): Promise<User> {
    try {
      await account.createEmailPasswordSession(email, password);
      return await this.getCurrentUser() as User;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Register with email and password
  async register(email: string, password: string, name: string): Promise<User> {
    try {
      await account.create(ID.unique(), email, password, name);
      return await this.login(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login with Google OAuth
  async loginWithGoogle(): Promise<void> {
    try {
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
