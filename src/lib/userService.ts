import { databases } from './appwrite';
import { ID, Query } from 'appwrite';

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
    
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;
    
    console.log('Environment variables:', {
      databaseId,
      usersCollectionId,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    });
    
    if (!databaseId || !usersCollectionId) {
      throw new Error(`Missing environment variables: databaseId=${databaseId}, usersCollectionId=${usersCollectionId}`);
    }
    
    const document = await databases.createDocument(
      databaseId,
      usersCollectionId,
      ID.unique(),
      defaultProfile
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
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string,
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
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID as string,
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
