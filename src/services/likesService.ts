import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const NOTES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const LIKES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID || 'likes_collection';

export interface UserLike {
  $id?: string;
  userId: string;
  userEmail: string;
  noteId: string;
  likedAt: string;
  $createdAt?: string;
  $updatedAt?: string;
}

class LikesService {
  /**
   * Toggle like for a note by a user
   */
  async toggleLike(userId: string, userEmail: string, noteId: string): Promise<{
    success: boolean;
    isLiked: boolean;
    newLikeCount: number;
    error?: string;
  }> {
    try {
      // Check if user has already liked this note
      const existingLike = await this.getUserLikeForNote(userId, noteId);
      
      if (existingLike) {
        // User has liked it, so unlike it
        return await this.unlikeNote(userId, userEmail, noteId);
      } else {
        // User hasn't liked it, so like it
        return await this.likeNote(userId, userEmail, noteId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return {
        success: false,
        isLiked: false,
        newLikeCount: 0,
        error: error instanceof Error ? error.message : 'Failed to toggle like'
      };
    }
  }

  /**
   * Like a note
   */
  async likeNote(userId: string, userEmail: string, noteId: string): Promise<{
    success: boolean;
    isLiked: boolean;
    newLikeCount: number;
    error?: string;
  }> {
    try {
      // First, get the current note to get the current like count
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      const currentLikes = note.likes || 0;
      const newLikeCount = currentLikes + 1;

      // Create the like record
      await databases.createDocument(
        DATABASE_ID,
        LIKES_COLLECTION_ID,
        'unique()',
        {
          userId,
          userEmail,
          noteId,
          likedAt: new Date().toISOString(),
        }
      );

      // Update the note's like count
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { likes: newLikeCount }
      );

      return {
        success: true,
        isLiked: true,
        newLikeCount
      };
    } catch (error) {
      console.error('Error liking note:', error);
      
      // If likes collection doesn't exist, try to create it
      if (error instanceof Error && error.message.includes('Collection not found')) {
        console.log('Likes collection not found, falling back to simple like update');
        return await this.fallbackLikeUpdate(noteId, true);
      }
      
      return {
        success: false,
        isLiked: false,
        newLikeCount: 0,
        error: error instanceof Error ? error.message : 'Failed to like note'
      };
    }
  }

  /**
   * Unlike a note
   */
  async unlikeNote(userId: string, userEmail: string, noteId: string): Promise<{
    success: boolean;
    isLiked: boolean;
    newLikeCount: number;
    error?: string;
  }> {
    try {
      // First, get the current note to get the current like count
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      const currentLikes = note.likes || 0;
      const newLikeCount = Math.max(0, currentLikes - 1); // Ensure it doesn't go below 0

      // Find and delete the like record
      const existingLike = await this.getUserLikeForNote(userId, noteId);
      if (existingLike && existingLike.$id) {
        await databases.deleteDocument(DATABASE_ID, LIKES_COLLECTION_ID, existingLike.$id);
      }

      // Update the note's like count
      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { likes: newLikeCount }
      );

      return {
        success: true,
        isLiked: false,
        newLikeCount
      };
    } catch (error) {
      console.error('Error unliking note:', error);
      
      // If likes collection doesn't exist, try fallback
      if (error instanceof Error && error.message.includes('Collection not found')) {
        console.log('Likes collection not found, falling back to simple like update');
        return await this.fallbackLikeUpdate(noteId, false);
      }
      
      return {
        success: false,
        isLiked: true,
        newLikeCount: 0,
        error: error instanceof Error ? error.message : 'Failed to unlike note'
      };
    }
  }

  /**
   * Check if a user has liked a specific note
   */
  async getUserLikeForNote(userId: string, noteId: string): Promise<UserLike | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LIKES_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('noteId', noteId),
          Query.limit(1)
        ]
      );

      return response.documents.length > 0 ? (response.documents[0] as unknown) as UserLike : null;
    } catch (error) {
      console.error('Error checking user like:', error);
      return null;
    }
  }

  /**
   * Get all likes by a user
   */
  async getUserLikes(userId: string, limit: number = 100): Promise<UserLike[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LIKES_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as UserLike[];
    } catch (error) {
      console.error('Error fetching user likes:', error);
      return [];
    }
  }

  /**
   * Get all likes for a specific note
   */
  async getNoteLikes(noteId: string, limit: number = 100): Promise<UserLike[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LIKES_COLLECTION_ID,
        [
          Query.equal('noteId', noteId),
          Query.orderDesc('$createdAt'),
          Query.limit(limit)
        ]
      );

      return response.documents as unknown as UserLike[];
    } catch (error) {
      console.error('Error fetching note likes:', error);
      return [];
    }
  }

  /**
   * Get user's liked note IDs (for quick checking)
   */
  async getUserLikedNoteIds(userId: string): Promise<string[]> {
    try {
      const likes = await this.getUserLikes(userId);
      return likes.map(like => like.noteId);
    } catch (error) {
      console.error('Error fetching user liked note IDs:', error);
      return [];
    }
  }

  /**
   * Fallback method when likes collection doesn't exist
   * Just updates the note's like count directly
   */
  private async fallbackLikeUpdate(noteId: string, isLiking: boolean): Promise<{
    success: boolean;
    isLiked: boolean;
    newLikeCount: number;
    error?: string;
  }> {
    try {
      const note = await databases.getDocument(DATABASE_ID, NOTES_COLLECTION_ID, noteId);
      const currentLikes = note.likes || 0;
      const newLikeCount = isLiking ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      await databases.updateDocument(
        DATABASE_ID,
        NOTES_COLLECTION_ID,
        noteId,
        { likes: newLikeCount }
      );

      return {
        success: true,
        isLiked: isLiking,
        newLikeCount
      };
    } catch (error) {
      console.error('Error in fallback like update:', error);
      return {
        success: false,
        isLiked: false,
        newLikeCount: 0,
        error: error instanceof Error ? error.message : 'Failed to update like'
      };
    }
  }

  /**
   * Sync likes from localStorage to database for authenticated users
   * Useful when user signs in and we want to sync their local likes
   */
  async syncLocalLikesToDatabase(userId: string, userEmail: string, localLikedNoteIds: string[]): Promise<{
    synced: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let synced = 0;

    console.log('Syncing local likes to database:', localLikedNoteIds);

    for (const noteId of localLikedNoteIds) {
      try {
        // Check if this like already exists in database
        const existingLike = await this.getUserLikeForNote(userId, noteId);
        
        if (!existingLike) {
          // Like doesn't exist in database, create it
          const result = await this.likeNote(userId, userEmail, noteId);
          if (result.success) {
            synced++;
          } else {
            errors.push(`Failed to sync like for note ${noteId}: ${result.error}`);
          }
        }
      } catch (error) {
        console.error(`Error syncing like for note ${noteId}:`, error);
        errors.push(`Error syncing note ${noteId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { synced, errors };
  }
}

export const likesService = new LikesService();
