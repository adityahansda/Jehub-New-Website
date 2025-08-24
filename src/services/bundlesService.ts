import { Client, Databases, Query, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BUNDLES_COLLECTION_ID!;

// Bundle interface
export interface Bundle {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  title: string;
  description: string;
  category: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  instructor?: string;
  tags?: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  access: 'free' | 'premium' | 'purchase';
  notesCount: number;
  videosCount?: number;
  totalDownloads?: number;
  totalSales?: number;
  revenue?: number;
  rating?: number;
  reviews?: number;
  views?: number;
  status: 'draft' | 'published' | 'archived';
  isPopular?: boolean;
  thumbnail?: string;
  notes?: string; // JSON string of note objects
  videos?: string; // JSON string of video objects
  createdBy?: string;
}

export interface BundleNote {
  title: string;
  type: string;
  size: string;
  description?: string;
  fileUrl?: string;
}

export interface BundleVideo {
  title: string;
  type: string;
  url: string;
  duration: string;
  description?: string;
}

export interface BundleFilters {
  category?: string;
  access?: 'free' | 'premium' | 'purchase';
  status?: 'draft' | 'published' | 'archived';
  isPopular?: boolean;
  search?: string;
}

class BundlesService {
  // Create a new bundle
  async createBundle(bundleData: Omit<Bundle, '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> {
    try {
      // Validate required fields
      if (!bundleData.title || !bundleData.description || !bundleData.category) {
        throw new Error('Title, description, and category are required');
      }

      const bundle = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          ...bundleData,
          // Set defaults
          price: bundleData.price || 0,
          notesCount: bundleData.notesCount || 0,
          access: bundleData.access || 'free',
          status: bundleData.status || 'draft',
          totalDownloads: bundleData.totalDownloads || 0,
          totalSales: bundleData.totalSales || 0,
          revenue: bundleData.revenue || 0,
          rating: bundleData.rating || 0,
          reviews: bundleData.reviews || 0,
          views: bundleData.views || 0,
          videosCount: bundleData.videosCount || 0,
          isPopular: bundleData.isPopular || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      return bundle as Bundle;
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw error;
    }
  }

  // Get all bundles with optional filters
  async getBundles(filters?: BundleFilters, limit: number = 25, offset: number = 0): Promise<Bundle[]> {
    try {
      const queries: any[] = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
      ];

      // Apply filters
      if (filters?.category) {
        queries.push(Query.equal('category', filters.category));
      }
      
      if (filters?.access) {
        queries.push(Query.equal('access', filters.access));
      }
      
      if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
      }
      
      if (filters?.isPopular) {
        queries.push(Query.equal('isPopular', filters.isPopular));
      }
      
      if (filters?.search) {
        queries.push(Query.search('title', filters.search));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        queries
      );

      return response.documents as Bundle[];
    } catch (error) {
      console.error('Error getting bundles:', error);
      throw error;
    }
  }

  // Get published bundles (for public study bundles page)
  async getPublishedBundles(filters?: Omit<BundleFilters, 'status'>, limit: number = 25): Promise<Bundle[]> {
    return this.getBundles({ ...filters, status: 'published' }, limit);
  }

  // Get bundle by ID
  async getBundleById(bundleId: string): Promise<Bundle> {
    try {
      const bundle = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        bundleId
      );

      return bundle as Bundle;
    } catch (error) {
      console.error('Error getting bundle by ID:', error);
      throw error;
    }
  }

  // Update bundle
  async updateBundle(bundleId: string, updateData: Partial<Bundle>): Promise<Bundle> {
    try {
      const updatedBundle = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        bundleId,
        {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      );

      return updatedBundle as Bundle;
    } catch (error) {
      console.error('Error updating bundle:', error);
      throw error;
    }
  }

  // Delete bundle
  async deleteBundle(bundleId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTION_ID,
        bundleId
      );
    } catch (error) {
      console.error('Error deleting bundle:', error);
      throw error;
    }
  }

  // Bulk delete bundles
  async deleteBundles(bundleIds: string[]): Promise<void> {
    try {
      const deletePromises = bundleIds.map(id => this.deleteBundle(id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error bulk deleting bundles:', error);
      throw error;
    }
  }

  // Update bundle statistics
  async updateBundleStats(bundleId: string, stats: {
    downloads?: number;
    sales?: number;
    revenue?: number;
    rating?: number;
    reviews?: number;
    views?: number;
  }): Promise<Bundle> {
    try {
      const bundle = await this.getBundleById(bundleId);
      
      const updatedStats: any = {};
      
      if (stats.downloads !== undefined) {
        updatedStats.totalDownloads = (bundle.totalDownloads || 0) + stats.downloads;
      }
      
      if (stats.sales !== undefined) {
        updatedStats.totalSales = (bundle.totalSales || 0) + stats.sales;
      }
      
      if (stats.revenue !== undefined) {
        updatedStats.revenue = (bundle.revenue || 0) + stats.revenue;
      }
      
      if (stats.rating !== undefined) {
        updatedStats.rating = stats.rating;
      }
      
      if (stats.reviews !== undefined) {
        updatedStats.reviews = (bundle.reviews || 0) + stats.reviews;
      }
      
      if (stats.views !== undefined) {
        updatedStats.views = (bundle.views || 0) + stats.views;
      }

      return this.updateBundle(bundleId, updatedStats);
    } catch (error) {
      console.error('Error updating bundle stats:', error);
      throw error;
    }
  }

  // Add notes to bundle
  async updateBundleNotes(bundleId: string, notes: BundleNote[]): Promise<Bundle> {
    try {
      const notesJson = JSON.stringify(notes);
      return this.updateBundle(bundleId, { 
        notes: notesJson,
        notesCount: notes.length
      });
    } catch (error) {
      console.error('Error updating bundle notes:', error);
      throw error;
    }
  }

  // Add videos to bundle (if videos attribute exists)
  async updateBundleVideos(bundleId: string, videos: BundleVideo[]): Promise<Bundle> {
    try {
      const videosJson = JSON.stringify(videos);
      return this.updateBundle(bundleId, { 
        videos: videosJson,
        videosCount: videos.length
      });
    } catch (error) {
      console.error('Error updating bundle videos:', error);
      throw error;
    }
  }

  // Get bundle notes (parse JSON)
  getBundleNotes(bundle: Bundle): BundleNote[] {
    try {
      if (!bundle.notes) return [];
      return JSON.parse(bundle.notes);
    } catch (error) {
      console.error('Error parsing bundle notes:', error);
      return [];
    }
  }

  // Get bundle videos (parse JSON)
  getBundleVideos(bundle: Bundle): BundleVideo[] {
    try {
      if (!bundle.videos) return [];
      return JSON.parse(bundle.videos);
    } catch (error) {
      console.error('Error parsing bundle videos:', error);
      return [];
    }
  }

  // Search bundles
  async searchBundles(searchTerm: string, limit: number = 25): Promise<Bundle[]> {
    return this.getBundles({ search: searchTerm, status: 'published' }, limit);
  }

  // Get bundles by category
  async getBundlesByCategory(category: string, limit: number = 25): Promise<Bundle[]> {
    return this.getBundles({ category, status: 'published' }, limit);
  }

  // Get popular bundles
  async getPopularBundles(limit: number = 10): Promise<Bundle[]> {
    return this.getBundles({ isPopular: true, status: 'published' }, limit);
  }

  // Get free bundles
  async getFreeBundles(limit: number = 25): Promise<Bundle[]> {
    return this.getBundles({ access: 'free', status: 'published' }, limit);
  }

  // Get premium bundles
  async getPremiumBundles(limit: number = 25): Promise<Bundle[]> {
    return this.getBundles({ access: 'premium', status: 'published' }, limit);
  }

  // Get bundle statistics
  async getBundleStatistics(): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    free: number;
    premium: number;
    purchase: number;
  }> {
    try {
      const [
        total,
        published, 
        draft,
        archived,
        free,
        premium,
        purchase
      ] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('status', 'published'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('status', 'draft'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('status', 'archived'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('access', 'free'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('access', 'premium'), Query.limit(1)]),
        databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.equal('access', 'purchase'), Query.limit(1)])
      ]);

      return {
        total: total.total,
        published: published.total,
        draft: draft.total,
        archived: archived.total,
        free: free.total,
        premium: premium.total,
        purchase: purchase.total
      };
    } catch (error) {
      console.error('Error getting bundle statistics:', error);
      throw error;
    }
  }
}

export const bundlesService = new BundlesService();
export default bundlesService;
