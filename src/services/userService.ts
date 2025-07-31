import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '../appwrite/config';
import { Query } from 'appwrite';

export interface UserProfile {
  $id?: string;
  userId: string;
  name: string;
  email: string;
  
  // Contact Information
  phone?: string;
  alternatePhone?: string;
  collegeEmail?: string;
  
  // Personal Information
  dateOfBirth?: string;
  gender?: string;
  
  // Academic Information
  college?: string;
  branch?: string;
  semester?: string;
  year?: string;
  enrollmentNumber?: string;
  currentGPA?: string;
  
  // Enhanced Personal Information
  bio?: string;
  interests?: string;
  skills?: string;
  languages?: string;
  
  // Address Information
  currentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  
  // Social Links
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  // Profile Management
  profileImageUrl?: string;
  isProfileComplete?: boolean;
  profileCompletedAt?: string;
  joinDate?: string;
  
  // Stats and Rankings
  totalPoints?: number;
  notesUploaded?: number;
  notesDownloaded?: number;
  requestsFulfilled?: number;
  rank?: number;
  
  // Preferences
  preferredLanguage?: string;
  notificationPreferences?: string;
  
  // Role and Status
  role?: 'admin' | 'manager' | 'intern' | 'student' | 'user';
  status?: 'active' | 'banned' | 'inactive';
  
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

  // Check if user profile is complete
  async isProfileComplete(email: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(email);
      // If no profile exists, user is new and profile is not complete
      if (!profile) {
        return false;
      }
      // Check if profile is explicitly marked as complete
      return profile.isProfileComplete === true;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  }

  // Check if user is new (doesn't have a profile in database)
  async isNewUser(email: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(email);
      return profile === null;
    } catch (error) {
      console.error('Error checking if user is new:', error);
      return true; // Assume new user if error occurs
    }
  }

  // Update user profile
  async updateUserProfile(email: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const existingProfile = await this.getUserProfile(email);
      
      if (!existingProfile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        existingProfile.$id!,
        {
          ...profileData,
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

  // ADMIN METHODS
  
  // List all users (admin only)
  async listAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.limit(100) // Limit to 100 users, can be increased or paginated
        ]
      );
      return response.documents as unknown as UserProfile[];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, newRole: string): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          role: newRole,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Ban/unban user (admin only)
  async banUser(userId: string, banned: boolean = true): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          status: banned ? 'banned' : 'active',
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error banning/unbanning user:', error);
      throw error;
    }
  }

  // Delete user account (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Update user points (admin only)
  async updateUserPoints(userId: string, points: number): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          totalPoints: points,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  }

  // Update user rank (admin only)
  async updateUserRank(userId: string, rank: number): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          rank: rank,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user rank:', error);
      throw error;
    }
  }

  // Update user gamification stats (admin only)
  async updateUserGamification(userId: string, stats: {
    totalPoints?: number;
    notesUploaded?: number;
    notesDownloaded?: number;
    requestsFulfilled?: number;
    communityPosts?: number;
    rank?: number;
    level?: string;
  }): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          ...stats,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user gamification:', error);
      throw error;
    }
  }

  // Get user by ID (admin only)
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return response as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  // Update any user profile field (admin only)
  async adminUpdateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          ...profileData,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error updating user profile (admin):', error);
      throw error;
    }
  }

  // Set user role by email (for testing/debugging)
  async setUserRoleByEmail(email: string, role: 'admin' | 'manager' | 'intern' | 'student' | 'user'): Promise<UserProfile | null> {
    try {
      const profile = await this.getUserProfile(email);
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        profile.$id!,
        {
          role: role,
          updatedAt: new Date().toISOString()
        }
      );
      return updatedProfile as unknown as UserProfile;
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
