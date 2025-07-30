import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, SHARES_COLLECTION_ID } from '../appwrite/config';
import {
  ShareRecord,
  ShareTemplate,
  ShareAnalytics,
  ShareSettings,
  CreateShareRequest,
  ShareResponse,
  ShareStats,
  SharePlatform
} from '../types/share';

// Share Service Class
export class ShareService {
  
  // Create a new share
  static async createShare(request: CreateShareRequest, userId: string, userName: string): Promise<ShareResponse> {
    try {
      const shareId = ID.unique();
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      
      const shareData = {
        shareId,
        resourceType: request.resourceType,
        resourceId: request.resourceId,
        resourceTitle: request.resourceTitle,
        resourceUrl: request.resourceUrl,
        sharerId: userId,
        sharerName: userName,
        platform: request.platform,
        shareMessage: request.customMessage || this.generateDefaultMessage(request),
        customData: request.customData || {},
        isPublic: request.isPublic ?? true,
        expiresAt: request.expiresAt,
        accessCount: 0,
        tags: request.tags || [],
        status: 'active' as const
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        ID.unique(),
        shareData
      );

      // Track the share creation
      await this.trackShareAnalytics({
        shareId,
        platform: request.platform,
        action: 'created'
      });

      return {
        shareId,
        shareUrl,
        message: shareData.shareMessage,
        expiresAt: request.expiresAt
      };
    } catch (error) {
      console.error('Error creating share:', error);
      throw new Error('Failed to create share');
    }
  }

  // Get a share by ID
  static async getShare(shareId: string): Promise<ShareRecord | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [Query.equal('shareId', shareId)]
      );

      if (response.documents.length === 0) {
        return null;
      }

      const share = response.documents[0] as unknown as ShareRecord;
      
      // Update access count
      await this.updateAccessCount(share.$id);
      
      return share;
    } catch (error) {
      console.error('Error getting share:', error);
      return null;
    }
  }

  // Get all shares for a user
  static async getUserShares(userId: string): Promise<ShareRecord[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [
          Query.equal('sharerId', userId),
          Query.orderDesc('$createdAt'),
          Query.limit(100)
        ]
      );

      return response.documents as unknown as ShareRecord[];
    } catch (error) {
      console.error('Error getting user shares:', error);
      return [];
    }
  }

  // Update a share
  static async updateShare(shareId: string, updates: Partial<ShareRecord>): Promise<void> {
    try {
      // Find the document by shareId first
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [Query.equal('shareId', shareId)]
      );

      if (response.documents.length === 0) {
        throw new Error('Share not found');
      }

      const documentId = response.documents[0].$id;
      
      await databases.updateDocument(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        documentId,
        updates
      );
    } catch (error) {
      console.error('Error updating share:', error);
      throw new Error('Failed to update share');
    }
  }

  // Delete a share
  static async deleteShare(shareId: string): Promise<void> {
    try {
      // Find the document by shareId first
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [Query.equal('shareId', shareId)]
      );

      if (response.documents.length === 0) {
        throw new Error('Share not found');
      }

      const documentId = response.documents[0].$id;
      
      await databases.deleteDocument(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        documentId
      );
    } catch (error) {
      console.error('Error deleting share:', error);
      throw new Error('Failed to delete share');
    }
  }

  // Get share statistics
  static async getShareStats(userId?: string): Promise<ShareStats> {
    try {
      const queries = userId ? [Query.equal('sharerId', userId)] : [];
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [...queries, Query.limit(1000)]
      );

      const shares = response.documents as unknown as ShareRecord[];
      
      // Calculate statistics
      const totalShares = shares.length;
      const sharesByPlatform: Record<SharePlatform, number> = {} as Record<SharePlatform, number>;
      const sharesByResourceType: Record<string, number> = {};
      const resourceShares: Record<string, { title: string; count: number }> = {};

      shares.forEach(share => {
        // Count by platform
        sharesByPlatform[share.platform] = (sharesByPlatform[share.platform] || 0) + 1;
        
        // Count by resource type
        sharesByResourceType[share.resourceType] = (sharesByResourceType[share.resourceType] || 0) + 1;
        
        // Count by resource
        const key = `${share.resourceId}`;
        if (!resourceShares[key]) {
          resourceShares[key] = { title: share.resourceTitle, count: 0 };
        }
        resourceShares[key].count++;
      });

      const topSharedResources = Object.entries(resourceShares)
        .map(([resourceId, data]) => ({
          resourceId,
          resourceTitle: data.title,
          shareCount: data.count
        }))
        .sort((a, b) => b.shareCount - a.shareCount)
        .slice(0, 10);

      const recentShares = shares
        .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
        .slice(0, 20);

      const analyticsData = {
        views: shares.reduce((sum, share) => sum + share.accessCount, 0),
        clicks: shares.filter(share => share.lastAccessedAt).length,
        downloads: shares.filter(share => share.resourceType === 'pdf').length,
        uniqueUsers: new Set(shares.map(share => share.sharerId)).size
      };

      return {
        totalShares,
        sharesByPlatform,
        sharesByResourceType,
        topSharedResources,
        recentShares,
        analyticsData
      };
    } catch (error) {
      console.error('Error getting share stats:', error);
      throw new Error('Failed to get share statistics');
    }
  }

  // Generate default share message
  private static generateDefaultMessage(request: CreateShareRequest): string {
    const baseUrl = window.location.origin;
    
    switch (request.resourceType) {
      case 'note':
        return `📚 Check out this study material: "${request.resourceTitle}"\n\n🎓 Get more engineering resources at Jharkhand Engineer's Hub!\n\n🔗 ${request.resourceUrl}\n\n#StudyMaterials #Engineering #JharkhandEngineersHub`;
      
      case 'pdf':
        return `📄 PDF Resource: "${request.resourceTitle}"\n\n📚 Access quality study materials at Jharkhand Engineer's Hub\n\n🔗 ${request.resourceUrl}\n\n#PDFResources #StudyMaterials #Engineering`;
      
      case 'link':
        return `🔗 Resource Link: "${request.resourceTitle}"\n\n🎓 Discover more at Jharkhand Engineer's Hub\n\n${request.resourceUrl}\n\n#Resources #Engineering #JharkhandEngineersHub`;
      
      default:
        return `📚 "${request.resourceTitle}"\n\n🎓 Shared from Jharkhand Engineer's Hub\n\n🔗 ${request.resourceUrl}`;
    }
  }

  // Update access count
  private static async updateAccessCount(documentId: string): Promise<void> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, SHARES_COLLECTION_ID, documentId);
      const currentCount = (doc as any).accessCount || 0;
      
      await databases.updateDocument(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        documentId,
        {
          accessCount: currentCount + 1,
          lastAccessedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error updating access count:', error);
    }
  }

  // Track share analytics (placeholder for analytics collection)
  private static async trackShareAnalytics(data: {
    shareId: string;
    platform: SharePlatform;
    action: string;
  }): Promise<void> {
    try {
      // This would normally be stored in a separate analytics collection
      console.log('Share analytics:', data);
      // TODO: Implement analytics collection when needed
    } catch (error) {
      console.error('Error tracking share analytics:', error);
    }
  }

  // Clean up expired shares
  static async cleanupExpiredShares(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(
        DATABASE_ID,
        SHARES_COLLECTION_ID,
        [
          Query.lessThan('expiresAt', now),
          Query.equal('status', 'active')
        ]
      );

      let cleanedCount = 0;
      for (const doc of response.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          SHARES_COLLECTION_ID,
          doc.$id,
          { status: 'expired' }
        );
        cleanedCount++;
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired shares:', error);
      return 0;
    }
  }

  // Generate share URL with tracking
  static generateTrackableUrl(shareId: string, platform: SharePlatform): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareId}?utm_source=${platform}&utm_medium=share&utm_campaign=custom_sharing`;
  }

  // Validate share permissions
  static async validateShareAccess(shareId: string, userId?: string): Promise<boolean> {
    try {
      const share = await this.getShare(shareId);
      
      if (!share) return false;
      if (share.status !== 'active') return false;
      if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
        // Update status to expired
        await this.updateShare(shareId, { status: 'expired' });
        return false;
      }
      
      // Check if share is public or user is the owner
      if (share.isPublic || (userId && share.sharerId === userId)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error validating share access:', error);
      return false;
    }
  }
}

export default ShareService;
