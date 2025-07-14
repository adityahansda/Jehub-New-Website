import { databases } from './appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import { databaseId, collections } from './appwriteConfig';

export interface UserActivity {
  $id?: string;
  userId: string;
  type: 'upload' | 'download' | 'request' | 'post' | 'upvote' | 'blog' | 'login';
  title: string;
  description?: string;
  points: number;
  relatedItemId?: string; // ID of note, post, etc.
  metadata?: {
    fileName?: string;
    fileSize?: number;
    noteTitle?: string;
    downloadCount?: number;
    [key: string]: any;
  };
  createdAt: string;
}

export interface DownloadedNote {
  $id?: string;
  userId: string;
  noteId: string;
  title: string;
  fileName: string;
  fileSize: number;
  downloadDate: string;
  points: number;
  metadata?: {
    subject?: string;
    branch?: string;
    semester?: string;
    uploader?: string;
    [key: string]: any;
  };
}

export const createUserActivity = async (activityData: {
  userId: string;
  type: UserActivity['type'];
  title: string;
  description?: string;
  points: number;
  relatedItemId?: string;
  metadata?: UserActivity['metadata'];
}): Promise<UserActivity> => {
  try {
    const now = new Date().toISOString();
    const activity = {
      ...activityData,
      createdAt: now,
    };
    
    const document = await databases.createDocument(
      databaseId,
      collections.activities,
      ID.unique(),
      activity,
      [
        Permission.read(Role.user(activityData.userId)),
        Permission.write(Role.user(activityData.userId)),
        Permission.read(Role.any()),
      ]
    );
    
    return document as unknown as UserActivity;
  } catch (error) {
    console.error('Error creating user activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId: string, limit: number = 10): Promise<UserActivity[]> => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.activities,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );
    
    return response.documents as unknown as UserActivity[];
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
};

export const recordLoginActivity = async (userId: string): Promise<void> => {
  try {
    await createUserActivity({
      userId,
      type: 'login',
      title: 'User logged in',
      description: 'User successfully logged into the system',
      points: 5,
      metadata: {
        loginTime: new Date().toISOString(),
        device: navigator.userAgent,
      }
    });
  } catch (error) {
    console.error('Error recording login activity:', error);
  }
};

export const recordDownloadActivity = async (downloadData: {
  userId: string;
  noteId: string;
  title: string;
  fileName: string;
  fileSize: number;
  points: number;
  metadata?: DownloadedNote['metadata'];
}): Promise<void> => {
  try {
    // Record in activities
    await createUserActivity({
      userId: downloadData.userId,
      type: 'download',
      title: `Downloaded: ${downloadData.title}`,
      description: `Downloaded note file: ${downloadData.fileName}`,
      points: downloadData.points,
      relatedItemId: downloadData.noteId,
      metadata: {
        fileName: downloadData.fileName,
        fileSize: downloadData.fileSize,
        noteTitle: downloadData.title,
        ...downloadData.metadata,
      }
    });
  } catch (error) {
    console.error('Error recording download activity:', error);
  }
};

export const getUserDownloadHistory = async (userId: string, limit: number = 20): Promise<UserActivity[]> => {
  try {
    const response = await databases.listDocuments(
      databaseId,
      collections.activities,
      [
        Query.equal('userId', userId),
        Query.equal('type', 'download'),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );
    
    return response.documents as unknown as UserActivity[];
  } catch (error) {
    console.error('Error fetching download history:', error);
    return [];
  }
};

export const updateLoginStreak = async (userId: string): Promise<void> => {
  try {
    // This would typically update the user's login streak in the user profile
    // Implementation depends on your specific requirements
    console.log('Updating login streak for user:', userId);
  } catch (error) {
    console.error('Error updating login streak:', error);
  }
};
