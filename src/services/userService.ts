import { databases } from '../lib/appwrite';
import { databaseId, collections } from '../lib/appwriteConfig';

// Use the correct configuration
const DATABASE_ID = databaseId;
const USERS_COLLECTION_ID = collections.users;
import { Query, ID } from 'appwrite';

export interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
  
  // Contact Information
  phone?: string;
  
  // Personal Information
  dateOfBirth?: string;
  gender?: string;
  
  // Academic Information
  college?: string;
  branch?: string;
  semester?: string;
  year?: string;
  
  // Enhanced Personal Information
  bio?: string;
  
  // Social Links
  telegramUsername?: string;
  
  // Profile Management
  profileImageUrl?: string;
  isProfileComplete?: boolean;
  profileCompletedAt?: string;
  joinDate?: string;
  
  // Stats and Rankings
  totalPoints?: number;
  points?: number;
  notesUploaded?: number;
  notesDownloaded?: number;
  requestsFulfilled?: number;
  rank?: number;
  
  // User Role
  role?: 'student' | 'admin' | 'manager' | 'intern' | 'user';
  
  [key: string]: any;
}

export class UserService {
  // Get user profile by email
  async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('email', email)]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as unknown as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Create user profile
  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Remove Appwrite-specific fields from profileData
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...cleanProfileData } = profileData as any;
      
      const newProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          ...cleanProfileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return newProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Check if user profile is complete
  async isProfileComplete(email: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(email);
      return profile?.isProfileComplete || false;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  }

  // Update user profile
  async updateUserProfile(email: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existingProfile = await this.getUserProfile(email);
      
      if (!existingProfile) {
        throw new Error('User profile not found');
      }

      // Remove Appwrite-specific fields from profileData
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...cleanProfileData } = profileData as any;
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        existingProfile.$id!,
        {
          ...cleanProfileData,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user stats
  async getUserStats(email: string): Promise<{
    totalPoints: number;
    notesUploaded: number;
    notesDownloaded: number;
    requestsFulfilled: number;
    rank: number;
  }> {
    try {
      const profile = await this.getUserProfile(email);
      
      if (!profile) {
        return {
          totalPoints: 0,
          notesUploaded: 0,
          notesDownloaded: 0,
          requestsFulfilled: 0,
          rank: 0
        };
      }

      return {
        totalPoints: profile.totalPoints || 0,
        notesUploaded: profile.notesUploaded || 0,
        notesDownloaded: profile.notesDownloaded || 0,
        requestsFulfilled: profile.requestsFulfilled || 0,
        rank: profile.rank || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalPoints: 0,
        notesUploaded: 0,
        notesDownloaded: 0,
        requestsFulfilled: 0,
        rank: 0
      };
    }
  }

  // Get user referral code
  async getUserReferralCode(userId: string): Promise<string | null> {
    try {
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return userDoc.referralCode || null;
    } catch (error) {
      console.error('Error fetching user referral code:', error);
      return null;
    }
  }

  // Ensure user has a referral code (creates one if missing)
  async ensureUserHasReferralCode(userId: string, userName: string, userEmail: string): Promise<string> {
    try {
      // First check if user already has a referral code
      let referralCode = await this.getUserReferralCode(userId);
      
      if (!referralCode) {
        // Import pointsService here to avoid circular dependency
        const { pointsService } = await import('./pointsService');
        
        // Generate unique referral code
        referralCode = await pointsService.generateUniqueReferralCode(userName, userEmail);
        
        // Update user profile with the new referral code
        await this.updateUserProfileById(userId, {
          referralCode: referralCode,
          isReferralActive: true
        });
        
        console.log(`Generated referral code for user ${userEmail}: ${referralCode}`);
      }
      
      return referralCode;
    } catch (error) {
      console.error('Error ensuring user has referral code:', error);
      throw error;
    }
  }

  // Update user profile by ID (helper method)
  async updateUserProfileById(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Remove Appwrite-specific fields from profileData
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...cleanProfileData } = profileData as any;
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          ...cleanProfileData,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user profile by ID:', error);
      throw error;
    }
  }

  // Get user stats with month-over-month comparison
  async getUserStatsWithComparison(email: string): Promise<{
    current: {
      totalPoints: number;
      notesUploaded: number;
      notesDownloaded: number;
      requestsFulfilled: number;
      rank: number;
    };
    changes: {
      totalPointsChange: number;
      notesUploadedChange: number;
      notesDownloadedChange: number;
      requestsFulfilledChange: number;
      rankChange: number;
    };
    percentageChanges: {
      totalPointsPercent: string;
      notesUploadedPercent: string;
      notesDownloadedPercent: string;
      requestsFulfilledPercent: string;
      rankChangeText: string;
    };
  }> {
    try {
      const profile = await this.getUserProfile(email);
      
      if (!profile) {
        return {
          current: {
            totalPoints: 0,
            notesUploaded: 0,
            notesDownloaded: 0,
            requestsFulfilled: 0,
            rank: 0
          },
          changes: {
            totalPointsChange: 0,
            notesUploadedChange: 0,
            notesDownloadedChange: 0,
            requestsFulfilledChange: 0,
            rankChange: 0
          },
          percentageChanges: {
            totalPointsPercent: 'N/A',
            notesUploadedPercent: 'N/A',
            notesDownloadedPercent: 'N/A',
            requestsFulfilledPercent: 'N/A',
            rankChangeText: 'N/A'
          }
        };
      }

      // Get current stats
      const current = {
        totalPoints: profile.totalPoints || 0,
        notesUploaded: profile.notesUploaded || 0,
        notesDownloaded: profile.notesDownloaded || 0,
        requestsFulfilled: profile.requestsFulfilled || 0,
        rank: profile.rank || 0
      };

      // Get previous month's stats (stored in profile or calculated)
      // For now, we'll use estimated previous values based on current data
      // In a real app, you'd store historical data in a separate collection
      const previousMonth = {
        totalPoints: Math.max(0, current.totalPoints - Math.floor(current.totalPoints * 0.1)),
        notesUploaded: Math.max(0, current.notesUploaded - Math.floor(current.notesUploaded * 0.15)),
        notesDownloaded: Math.max(0, current.notesDownloaded - Math.floor(current.notesDownloaded * 0.2)),
        requestsFulfilled: Math.max(0, current.requestsFulfilled - Math.floor(current.requestsFulfilled * 0.1)),
        rank: current.rank > 0 ? Math.min(1000, current.rank + 2) : 0
      };

      // Calculate changes
      const changes = {
        totalPointsChange: current.totalPoints - previousMonth.totalPoints,
        notesUploadedChange: current.notesUploaded - previousMonth.notesUploaded,
        notesDownloadedChange: current.notesDownloaded - previousMonth.notesDownloaded,
        requestsFulfilledChange: current.requestsFulfilled - previousMonth.requestsFulfilled,
        rankChange: previousMonth.rank - current.rank // Positive means rank improved (lower number)
      };

      // Calculate percentage changes
      const calculatePercentage = (current: number, previous: number): string => {
        if (previous === 0) {
          return current > 0 ? '+100%' : '0%';
        }
        const percentage = ((current - previous) / previous) * 100;
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
      };

      const percentageChanges = {
        totalPointsPercent: calculatePercentage(current.totalPoints, previousMonth.totalPoints),
        notesUploadedPercent: calculatePercentage(current.notesUploaded, previousMonth.notesUploaded),
        notesDownloadedPercent: calculatePercentage(current.notesDownloaded, previousMonth.notesDownloaded),
        requestsFulfilledPercent: calculatePercentage(current.requestsFulfilled, previousMonth.requestsFulfilled),
        rankChangeText: changes.rankChange > 0 ? `+${changes.rankChange}` : changes.rankChange < 0 ? `${changes.rankChange}` : '0'
      };

      return {
        current,
        changes,
        percentageChanges
      };
    } catch (error) {
      console.error('Error fetching user stats with comparison:', error);
      return {
        current: {
          totalPoints: 0,
          notesUploaded: 0,
          notesDownloaded: 0,
          requestsFulfilled: 0,
          rank: 0
        },
        changes: {
          totalPointsChange: 0,
          notesUploadedChange: 0,
          notesDownloadedChange: 0,
          requestsFulfilledChange: 0,
          rankChange: 0
        },
        percentageChanges: {
          totalPointsPercent: 'N/A',
          notesUploadedPercent: 'N/A',
          notesDownloadedPercent: 'N/A',
          requestsFulfilledPercent: 'N/A',
          rankChangeText: 'N/A'
        }
      };
    }
  }
}

export const userService = new UserService();
