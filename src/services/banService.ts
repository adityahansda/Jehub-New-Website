import { databases } from '../lib/appwrite';
import { appwriteConfig } from '../lib/appwriteConfig';
import { Query, ID } from 'appwrite';

export interface BanInfo {
  $id?: string;
  ipAddress: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  isActive: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface UnbanRequest {
  $id?: string;
  userEmail: string;
  userName: string;
  banId: string;
  reason: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

class BanService {
  private readonly DATABASE_ID = appwriteConfig.databaseId;
  private readonly BANNED_DEVICES_COLLECTION = appwriteConfig.collections.bannedDevices;
  private readonly UNBAN_REQUESTS_COLLECTION = appwriteConfig.collections.unbanRequests;

  // Get client IP address
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('/api/ip');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  // Check if current user's IP is banned
  async isUserBanned(): Promise<{ isBanned: boolean; banInfo?: BanInfo }> {
    try {
      const ipAddress = await this.getClientIP();
      
      const bannedDevices = await databases.listDocuments(
        this.DATABASE_ID,
        this.BANNED_DEVICES_COLLECTION,
        [
          Query.equal('ipAddress', ipAddress),
          Query.equal('isActive', true),
          Query.limit(1)
        ]
      );

      if (bannedDevices.documents.length > 0) {
        return {
          isBanned: true,
          banInfo: bannedDevices.documents[0] as unknown as BanInfo
        };
      }

      return { isBanned: false };
    } catch (error) {
      console.error('Error checking ban status:', error);
      return { isBanned: false };
    }
  }

  // Submit unban request
  async submitUnbanRequest(
    userEmail: string,
    userName: string,
    banId: string,
    message: string
  ): Promise<void> {
    try {
      const requestData = {
        userEmail: String(userEmail),
        userName: String(userName),
        banId: String(banId),
        reason: 'User requested unban',
        message: String(message),
        requestedAt: new Date().toISOString(),
        status: 'pending' as const
      };

      // Check if there's already a pending request for this ban
      const existingRequests = await databases.listDocuments(
        this.DATABASE_ID,
        this.UNBAN_REQUESTS_COLLECTION,
        [
          Query.equal('banId', banId),
          Query.equal('status', 'pending'),
          Query.limit(1)
        ]
      );

      if (existingRequests.documents.length > 0) {
        throw new Error('You already have a pending unban request for this ban.');
      }

      await databases.createDocument(
        this.DATABASE_ID,
        this.UNBAN_REQUESTS_COLLECTION,
        ID.unique(),
        requestData
      );

      console.log('Unban request submitted successfully');
    } catch (error: any) {
      console.error('Error submitting unban request:', error);
      throw new Error(error.message || 'Failed to submit unban request');
    }
  }

  // Get user's unban requests
  async getUserUnbanRequests(userEmail: string): Promise<UnbanRequest[]> {
    try {
      const response = await databases.listDocuments(
        this.DATABASE_ID,
        this.UNBAN_REQUESTS_COLLECTION,
        [
          Query.equal('userEmail', userEmail),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]
      );

      return response.documents as unknown as UnbanRequest[];
    } catch (error) {
      console.error('Error getting unban requests:', error);
      return [];
    }
  }
}

export const banService = new BanService();
