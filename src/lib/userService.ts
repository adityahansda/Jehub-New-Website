import { databases } from './appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { databaseId, collections } from './appwriteConfig';

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
      avatar: '',
      joinDate: now,
      totalPoints: 0,
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
