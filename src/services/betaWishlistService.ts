import { serverDatabases as databases } from '../lib/appwrite-server';
import { appwriteConfig } from '../lib/appwriteConfig';
import { Query, ID } from 'node-appwrite';

export interface BetaWishlistEntry {
  name: string;
  branch: string;
  yearsOfStudy: string;
  degree: string;
  collegeName: string;
  email: string;
  telegramId: string;
  referCode?: string;
  status?: string;
  isPremium?: boolean;
  hidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BetaWishlistDocument extends BetaWishlistEntry {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

class BetaWishlistService {
  private databaseId = appwriteConfig.databaseId;
  private collectionId = appwriteConfig.collections.betaWishlist;

  /**
   * Add a new beta wishlist entry
   */
  async addEntry(entry: BetaWishlistEntry): Promise<BetaWishlistDocument> {
    try {
      const document = await databases.createDocument(
        this.databaseId,
        this.collectionId,
        ID.unique(),
        {
          name: entry.name?.trim() || '',
          branch: entry.branch?.trim() || '',
          yearsOfStudy: entry.yearsOfStudy?.trim() || '',
          degree: entry.degree?.trim() || '',
          collegeName: entry.collegeName?.trim() || '',
          email: entry.email?.toLowerCase().trim() || '',
          telegramId: entry.telegramId?.trim() || '',
          referCode: entry.referCode?.trim() || '',
          status: entry.status || 'pending',
          isPremium: entry.isPremium || false,
          hidden: entry.hidden || false,
          createdAt: entry.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return document as unknown as BetaWishlistDocument;
    } catch (error) {
      console.error('Error adding beta wishlist entry:', error);
      throw new Error(`Failed to add beta wishlist entry: ${error}`);
    }
  }

  /**
   * Check if email already exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('email', email.toLowerCase().trim())]
      );

      return response.documents.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false; // Return false on error to allow registration attempt
    }
  }

  /**
   * Check if Telegram ID already exists
   */
  async checkTelegramIdExists(telegramId: string): Promise<{ exists: boolean; existingUser?: any }> {
    try {
      // Clean the telegram ID for comparison
      const cleanTelegramId = telegramId.startsWith('@') ? telegramId.substring(1) : telegramId;
      
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.equal('telegramId', cleanTelegramId)]
      );

      if (response.documents.length > 0) {
        const existingUser = response.documents[0];
        return {
          exists: true,
          existingUser: {
            name: existingUser.name,
            email: existingUser.email,
            telegramId: existingUser.telegramId,
            collegeName: existingUser.collegeName,
            createdAt: existingUser.createdAt || existingUser.$createdAt
          }
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking Telegram ID existence:', error);
      return { exists: false }; // Return false on error to allow registration attempt
    }
  }

  /**
   * Get all beta wishlist entries
   */
  async getAllEntries(): Promise<BetaWishlistDocument[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [
          Query.orderDesc('$createdAt'),
          Query.limit(1000) // Adjust limit as needed
        ]
      );

      return response.documents as unknown as BetaWishlistDocument[];
    } catch (error) {
      console.error('Error getting beta wishlist entries:', error);
      return [];
    }
  }

  /**
   * Get entries by college
   */
  async getEntriesByCollege(): Promise<{ [collegeName: string]: BetaWishlistDocument[] }> {
    try {
      const entries = await this.getAllEntries();
      
      return entries.reduce((acc: { [key: string]: BetaWishlistDocument[] }, entry) => {
        const collegeName = entry.collegeName || 'Unknown';
        if (!acc[collegeName]) {
          acc[collegeName] = [];
        }
        acc[collegeName].push(entry);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error getting entries by college:', error);
      return {};
    }
  }

  /**
   * Update entry visibility
   */
  async updateEntryVisibility(entryId: string, hidden: boolean): Promise<void> {
    try {
      await databases.updateDocument(
        this.databaseId,
        this.collectionId,
        entryId,
        {
          hidden,
          updatedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error updating entry visibility:', error);
      throw new Error(`Failed to update entry visibility: ${error}`);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byCollege: { [college: string]: number };
    byDegree: { [degree: string]: number };
    byStatus: { [status: string]: number };
  }> {
    try {
      const entries = await this.getAllEntries();
      
      const stats = {
        total: entries.length,
        byCollege: {} as { [college: string]: number },
        byDegree: {} as { [degree: string]: number },
        byStatus: {} as { [status: string]: number }
      };

      entries.forEach(entry => {
        // Count by college
        const college = entry.collegeName || 'Unknown';
        stats.byCollege[college] = (stats.byCollege[college] || 0) + 1;

        // Count by degree
        const degree = entry.degree || 'Unknown';
        stats.byDegree[degree] = (stats.byDegree[degree] || 0) + 1;

        // Count by status
        const status = entry.status || 'pending';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        byCollege: {},
        byDegree: {},
        byStatus: {}
      };
    }
  }

  /**
   * Search entries by criteria
   */
  async searchEntries(searchTerm: string): Promise<BetaWishlistDocument[]> {
    try {
      // Note: Appwrite doesn't have full-text search, so we'll get all entries
      // and filter them locally for now
      const allEntries = await this.getAllEntries();
      
      const searchLower = searchTerm.toLowerCase();
      
      return allEntries.filter(entry => 
        entry.name.toLowerCase().includes(searchLower) ||
        entry.email.toLowerCase().includes(searchLower) ||
        entry.collegeName.toLowerCase().includes(searchLower) ||
        entry.branch.toLowerCase().includes(searchLower) ||
        entry.telegramId.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }

  /**
   * Check if collection exists and is accessible
   */
  async isCollectionAccessible(): Promise<boolean> {
    try {
      await databases.listDocuments(
        this.databaseId,
        this.collectionId,
        [Query.limit(1)]
      );
      return true;
    } catch (error) {
      console.error('Beta wishlist collection is not accessible:', error);
      return false;
    }
  }
}

export const betaWishlistService = new BetaWishlistService();
