import { databases } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { User } from './auth';

export interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  college?: string;
  branch?: string;
  semester?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  notesUploaded: number;
  notesDownloaded: number;
  requestsFulfilled: number;
  rank: number;
  description?: string;
  points: number;
  relatedItemId?: string;
  lastLoginDate?: string;
  dailyLoginStreak: number;
  role: string;
  level: string;
  verification?: string;
  username?: string;
  lastActive?: string;
  status?: 'active' | 'inactive' | 'banned';
  isVerified?: boolean;
  dateOfBirth?: string;
  profileImageUrl?: string;
  isProfileComplete?: boolean;
  profileCompletedAt?: string;
  phone?: string;
  referralCode?: string;
  telegramUsername?: string;
  coins?: number;
  premiumStatus?: boolean;
  referralProgramJoined?: boolean;
  totalReferrals?: number;
  referredBy?: string;
  totalEarnings?: number;
  availableBalance?: number;
  isReferralActive?: boolean;
  availablePoints?: number;
  pointsSpent?: number;
  lastPointsEarned?: string;
  subscribed?: boolean;
}

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USER_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

class UserProfileService {
  
  /**
   * Check if user already exists in database by email
   */
  async checkUserExists(email: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID,
        [Query.equal('email', email), Query.limit(1)]
      );
      
      if (response.documents && response.documents.length > 0) {
        return response.documents[0] as unknown as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error checking if user exists:', error);
      // If there's an error (like permissions), assume user doesn't exist
      return null;
    }
  }

  /**
   * Create a new user profile in the database
   */
  async createUserProfile(user: User): Promise<UserProfile | null> {
    try {
      // First check if user already exists
      const existingUser = await this.checkUserExists(user.email);
      
      if (existingUser) {
        console.log('User already exists in database:', user.email);
        // Update last login date for existing user
        await this.updateLastLoginDate(existingUser.$id!);
        return existingUser;
      }

      // Generate unique username from email
      const username = this.generateUsername(user.email);
      
      // Create new user profile with default values
      const newUserProfile: Omit<UserProfile, '$id'> = {
        userId: user.$id,
        name: user.name || 'New User',
        email: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        notesUploaded: 0,
        notesDownloaded: 0,
        requestsFulfilled: 0,
        rank: 1,
        points: 0,
        dailyLoginStreak: 1,
        role: 'student', // Default role
        level: 'beginner', // Default level
        status: 'active',
        isVerified: user.emailVerification || false,
        username,
        coins: 0,
        premiumStatus: false,
        referralProgramJoined: false,
        totalReferrals: 0,
        totalEarnings: 0,
        availableBalance: 0,
        isReferralActive: false,
        availablePoints: 0,
        pointsSpent: 0,
        subscribed: false,
        isProfileComplete: false
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        ID.unique(),
        newUserProfile
      );

      console.log('User profile created successfully:', (response as any).email);
      return response as unknown as UserProfile;
      
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      
      // If it's a duplicate error, try to fetch the existing user
      if (error.code === 409 || error.message?.includes('duplicate')) {
        console.log('User already exists (caught duplicate error), fetching existing user');
        return await this.checkUserExists(user.email);
      }
      
      return null;
    }
  }

  /**
   * Update user's last login date
   */
  async updateLastLoginDate(documentId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        documentId,
        {
          lastLoginDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      console.log('Last login date updated for user');
    } catch (error) {
      console.error('Error updating last login date:', error);
    }
  }

  /**
   * Get user profile by email
   */
  async getUserProfile(email: string): Promise<UserProfile | null> {
    return await this.checkUserExists(email);
  }

  /**
   * Get user profile by userId (Appwrite auth ID)
   */
  async getUserProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID,
        [Query.equal('userId', userId), Query.limit(1)]
      );
      
      if (response.documents && response.documents.length > 0) {
        return response.documents[0] as unknown as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error fetching user profile by userId:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(documentId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Remove system fields that shouldn't be updated
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...updateData } = updates as any;
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        USER_COLLECTION_ID,
        documentId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );

      return response as unknown as UserProfile;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  /**
   * Generate a unique username from email
   */
  private generateUsername(email: string): string {
    const baseUsername = email.split('@')[0].toLowerCase();
    // Remove any non-alphanumeric characters and limit length
    return baseUsername.replace(/[^a-z0-9]/g, '').substring(0, 20);
  }

  /**
   * Increment user login streak
   */
  async incrementLoginStreak(userProfile: UserProfile): Promise<void> {
    try {
      const lastLoginDate = userProfile.lastLoginDate ? new Date(userProfile.lastLoginDate) : null;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = userProfile.dailyLoginStreak || 0;

      if (lastLoginDate) {
        // Check if last login was yesterday (consecutive day)
        if (this.isSameDay(lastLoginDate, yesterday)) {
          newStreak += 1;
        } else if (!this.isSameDay(lastLoginDate, today)) {
          // Reset streak if more than a day gap
          newStreak = 1;
        }
        // If logged in today already, don't change streak
      } else {
        newStreak = 1;
      }

      await this.updateUserProfile(userProfile.$id!, {
        dailyLoginStreak: newStreak,
        lastLoginDate: today.toISOString()
      });

    } catch (error) {
      console.error('Error updating login streak:', error);
    }
  }

  /**
   * Helper function to check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
}

export const userProfileService = new UserProfileService();
