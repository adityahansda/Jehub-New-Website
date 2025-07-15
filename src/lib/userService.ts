import { databases } from './appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { databaseId, collections } from './appwriteConfig';
import { getDeterministicProfilePicture, isValidProfilePictureUrl } from './profileUtils';

export interface UserProfile {
  $id?: string; // Appwrite document ID
  userId: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  semester?: string;
  bio?: string;
  avatar?: string;
  joinDate: string;
  
  // User role and permissions
  role?: 'admin' | 'manager' | 'intern' | 'student' | 'user';
  
  // Statistics
  totalPoints: number;
  notesUploaded: number;
  notesDownloaded: number;
  requestsFulfilled: number;
  communityPosts: number;
  rank: number;
  level: string; // 'Beginner', 'Advanced', 'Expert', 'Scholar'
  
  // Activity tracking
  lastLoginDate?: string;
  dailyLoginStreak: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'upload' | 'download' | 'request' | 'post' | 'upvote' | 'blog' | 'login';
  title: string;
  description?: string;
  points: number;
  relatedItemId?: string; // ID of note, post, etc.
  createdAt: string;
}

export const createUserProfile = async (profileData: {
  userId: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  semester?: string;
}): Promise<UserProfile> => {
  try {
    const now = new Date().toISOString();
    const defaultProfile = {
      ...profileData,
      bio: '',
      avatar: getDeterministicProfilePicture(profileData.userId),
      joinDate: now,
      role: 'student' as const,
      totalPoints: 0,
      points: 0, // Add this missing field
      notesUploaded: 0,
      notesDownloaded: 0,
      requestsFulfilled: 0,
      communityPosts: 0,
      rank: 0,
      level: 'Beginner',
      lastLoginDate: now,
      dailyLoginStreak: 1,
      createdAt: now,
      updatedAt: now,
    };
    
    console.log('Using Appwrite configuration:', {
      databaseId,
      usersCollectionId: collections.users,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    });
    
    if (!databaseId || !collections.users) {
      throw new Error(`Missing configuration: databaseId=${databaseId}, usersCollectionId=${collections.users}`);
    }
    
    const document = await databases.createDocument(
      databaseId,
      collections.users,
      ID.unique(),
      defaultProfile,
      [
        Permission.read(Role.user(profileData.userId)),
        Permission.write(Role.user(profileData.userId)),
        Permission.read(Role.any()),
      ]
    );
    
    return document as unknown as UserProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.users,
      [
        Query.equal('userId', userId)
      ]
    );
    
    return response.documents.length > 0 ? response.documents[0] as unknown as UserProfile : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile || !profile.$id) {
      throw new Error('User profile not found');
    }

    // Validate avatar URL if provided
    if (updates.avatar !== undefined) {
      if (updates.avatar && !isValidProfilePictureUrl(updates.avatar)) {
        // If invalid URL provided, use deterministic profile picture
        updates.avatar = getDeterministicProfilePicture(userId);
      }
    }

    const document = await databases.updateDocument(
      databaseId,
      collections.users,
      profile.$id,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return document as unknown as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Fixes avatar URLs for users who have empty or invalid avatar URLs
 * This is a utility function to migrate existing users
 */
export const fixUserAvatars = async (): Promise<void> => {
  try {
    console.log('Starting avatar fix process...');
    
    // Get all users
    const response = await databases.listDocuments(
      databaseId,
      collections.users
    );
    
    const usersToUpdate = response.documents.filter((user: any) => 
      !user.avatar || user.avatar === '' || !isValidProfilePictureUrl(user.avatar)
    );
    
    console.log(`Found ${usersToUpdate.length} users with invalid avatars`);
    
    // Update each user with a valid avatar
    for (const user of usersToUpdate) {
      try {
        await databases.updateDocument(
          databaseId,
          collections.users,
          user.$id,
          {
            avatar: getDeterministicProfilePicture(user.userId),
            updatedAt: new Date().toISOString(),
          }
        );
        console.log(`Updated avatar for user: ${user.email}`);
      } catch (error) {
        console.error(`Failed to update avatar for user ${user.email}:`, error);
      }
    }
    
    console.log('Avatar fix process completed');
  } catch (error) {
    console.error('Error during avatar fix process:', error);
    throw error;
  }
};

