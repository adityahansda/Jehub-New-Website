import { databases, storage } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import { userService } from './userService';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '686d369e003c78073cc9';

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

class ProfilePictureService {
  
  /**
   * Fetch user info including profile picture from Google OAuth
   */
  async fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userInfo: GoogleUserInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      return null;
    }
  }

  /**
   * Save Google profile picture URL directly to user profile
   */
  async saveProfilePictureFromGoogle(
    userId: string, 
    email: string, 
    pictureUrl: string
  ): Promise<string | null> {
    try {
      // Check if profile picture already exists
      const existingProfile = await userService.getUserProfile(email);
      if (existingProfile?.profileImageUrl === pictureUrl) {
        console.log('Profile picture URL already up to date');
        return existingProfile.profileImageUrl;
      }

      // Update user profile with the Google profile picture URL
      await userService.updateUserProfile(email, {
        profileImageUrl: pictureUrl
      });

      console.log(`Profile picture URL saved for user ${email}`);
      return pictureUrl;
    } catch (error) {
      console.error('Error saving profile picture URL:', error);
      return null;
    }
  }

  /**
   * Get profile picture URL for a user
   */
  async getProfilePictureUrl(email: string): Promise<string | null> {
    try {
      const profile = await userService.getUserProfile(email);
      return profile?.profileImageUrl || null;
    } catch (error) {
      console.error('Error getting profile picture URL:', error);
      return null;
    }
  }

  /**
   * Generate initials for fallback avatar
   */
  generateInitials(name: string): string {
    if (!name) return 'U';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Delete old profile picture when updating
   */
  async deleteOldProfilePicture(oldImageUrl: string): Promise<void> {
    try {
      // Extract file ID from Appwrite URL
      const urlParts = oldImageUrl.split('/');
      const fileId = urlParts[urlParts.length - 1];
      
      if (fileId && oldImageUrl.includes('appwrite')) {
        await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
        console.log('Old profile picture deleted');
      }
    } catch (error) {
      console.error('Error deleting old profile picture:', error);
    }
  }

  /**
   * Update profile picture from a new URL (for re-syncing with Google)
   */
  async updateProfilePictureFromGoogle(
    userId: string,
    email: string,
    newPictureUrl: string
  ): Promise<string | null> {
    try {
      // Get current profile picture URL
      const currentUrl = await this.getProfilePictureUrl(email);
      
      // Save new profile picture
      const newUrl = await this.saveProfilePictureFromGoogle(userId, email, newPictureUrl);
      
      // Delete old profile picture if it exists and is different
      if (currentUrl && currentUrl !== newUrl && currentUrl.includes('appwrite')) {
        await this.deleteOldProfilePicture(currentUrl);
      }
      
      return newUrl;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return null;
    }
  }

  /**
   * Check if we need to update the profile picture (for periodic sync)
   */
  async shouldUpdateProfilePicture(email: string): Promise<boolean> {
    try {
      const profile = await userService.getUserProfile(email);
      if (!profile?.profileImageUrl) {
        return true; // No profile picture exists
      }

      // Check if it's been more than 30 days since last update
      const lastUpdate = profile.updatedAt || profile.joinDate;
      if (lastUpdate) {
        const daysSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate > 30;
      }

      return false;
    } catch (error) {
      console.error('Error checking if profile picture needs update:', error);
      return false;
    }
  }
}

export const profilePictureService = new ProfilePictureService();
