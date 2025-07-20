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
  // Login user - DISABLED
  static async login(data: LoginData) {
    console.log('Authentication disabled - Login attempt for:', data.email);
    throw new Error('Authentication system is currently disabled');
  }

  // Register new user - DISABLED  
  static async signup(data: SignupData) {
    console.log('Authentication disabled - Signup attempt for:', data.email);
    throw new Error('Authentication system is currently disabled');
  }

  // Get current user - DISABLED
  static async getCurrentUser() {
    console.log('Authentication disabled - getCurrentUser called');
    return null;
  }

  // Logout user - DISABLED
  static async logout() {
    console.log('Authentication disabled - Logout called');
    // No error thrown for logout to prevent issues
  }

  // Send password recovery email - DISABLED
  static async recoverPassword(email: string) {
    console.log('Authentication disabled - Password recovery attempt for:', email);
    throw new Error('Authentication system is currently disabled');
  }

  // Update password - DISABLED
  static async updatePassword(password: string, oldPassword?: string) {
    console.log('Authentication disabled - Password update attempt');
    throw new Error('Authentication system is currently disabled');
  }

  // Verify email - DISABLED
  static async verifyEmail(userId: string, secret: string) {
    console.log('Authentication disabled - Email verification attempt');
    throw new Error('Authentication system is currently disabled');
  }

  // Send verification email - DISABLED
  static async sendVerificationEmail() {
    console.log('Authentication disabled - Send verification email attempt');
    throw new Error('Authentication system is currently disabled');
  }
}
