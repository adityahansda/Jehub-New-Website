import { account } from './appwrite';
import { ID } from 'appwrite';
import { createUserProfile } from './userService';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  college?: string;
  branch?: string;
  semester?: string;
}

export class AuthService {
  // Login user
  static async login(data: LoginData) {
    try {
      const session = await account.createEmailPasswordSession(data.email, data.password);
      return session;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Register new user
  static async signup(data: SignupData) {
    try {
      // Create user account
      const user = await account.create(
        ID.unique(),
        data.email,
        data.password,
        data.name
      );

      // Automatically log in the user after registration
      await account.createEmailPasswordSession(data.email, data.password);

      // Create user profile in database
      const userProfile = await createUserProfile({
        userId: user.$id,
        name: data.name,
        email: data.email,
        college: data.college,
        branch: data.branch,
        semester: data.semester
      });

      return { user, userProfile };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error: any) {
      if (error.code === 401) {
        // User not logged in
        return null;
      }
      console.error('Get current user error:', error);
      throw new Error(error.message || 'Failed to get user');
    }
  }

  // Logout user
  static async logout() {
    try {
      await account.deleteSession('current');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Send password recovery email
  static async recoverPassword(email: string) {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
    } catch (error: any) {
      console.error('Password recovery error:', error);
      throw new Error(error.message || 'Password recovery failed');
    }
  }

  // Update password
  static async updatePassword(password: string, oldPassword?: string) {
    try {
      await account.updatePassword(password, oldPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Password update failed');
    }
  }

  // Verify email
  static async verifyEmail(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret);
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Send verification email
  static async sendVerificationEmail() {
    try {
      await account.createVerification(`${window.location.origin}/verify-email`);
    } catch (error: any) {
      console.error('Send verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  }
}
