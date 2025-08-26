// Bundle Types and Service
export interface BundleNote {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  type: 'pdf' | 'doc' | 'ppt';
  size: string;
}

export interface BundleVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'youtube' | 'vimeo' | 'direct';
  duration: string;
}

export interface Bundle {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  access: 'free' | 'premium' | 'purchase';
  notes: BundleNote[];
  videos: BundleVideo[];
  instructor: string;
  tags: string | string[];
  status: 'draft' | 'published' | 'archived';
  notesCount: number;
  videosCount?: number;
  totalSales?: number;
  revenue?: number;
  targetSales?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  level?: string;
  duration?: string;
  rating?: number;
  reviews?: number;
  totalDownloads?: number;
}

// Mock Bundle Service
class BundleService {
  // Mock data store
  private bundles: Bundle[] = [];

  // Get all bundles
  async getBundles(): Promise<Bundle[]> {
    return this.bundles;
  }

  // Get bundle by ID
  async getBundleById(id: string): Promise<Bundle | null> {
    return this.bundles.find(bundle => bundle.id === id) || null;
  }

  // Create new bundle
  async createBundle(bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> {
    const newBundle: Bundle = {
      ...bundleData,
      id: `bundle_${Date.now()}`,
      $id: `bundle_${Date.now()}`,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };
    
    this.bundles.push(newBundle);
    return newBundle;
  }

  // Update bundle
  async updateBundle(id: string, updates: Partial<Bundle>): Promise<Bundle> {
    const bundleIndex = this.bundles.findIndex(bundle => bundle.id === id);
    
    if (bundleIndex === -1) {
      throw new Error('Bundle not found');
    }
    
    this.bundles[bundleIndex] = {
      ...this.bundles[bundleIndex],
      ...updates,
      $updatedAt: new Date().toISOString(),
    };
    
    return this.bundles[bundleIndex];
  }

  // Delete bundle
  async deleteBundle(id: string): Promise<boolean> {
    const bundleIndex = this.bundles.findIndex(bundle => bundle.id === id);
    
    if (bundleIndex === -1) {
      return false;
    }
    
    this.bundles.splice(bundleIndex, 1);
    return true;
  }

  // Get published bundles
  async getPublishedBundles(): Promise<Bundle[]> {
    return this.bundles.filter(bundle => bundle.status === 'published');
  }

  // Get draft bundles
  async getDraftBundles(): Promise<Bundle[]> {
    return this.bundles.filter(bundle => bundle.status === 'draft');
  }

  // Search bundles
  async searchBundles(query: string): Promise<Bundle[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.bundles.filter(bundle => {
      const tagsString = Array.isArray(bundle.tags) 
        ? bundle.tags.join(' ').toLowerCase() 
        : bundle.tags.toLowerCase();
      
      return bundle.title.toLowerCase().includes(lowercaseQuery) ||
        bundle.description.toLowerCase().includes(lowercaseQuery) ||
        bundle.category.toLowerCase().includes(lowercaseQuery) ||
        tagsString.includes(lowercaseQuery);
    });
  }

  // Get bundles by category
  async getBundlesByCategory(category: string): Promise<Bundle[]> {
    return this.bundles.filter(bundle => bundle.category === category);
  }

  // Get featured bundles
  async getFeaturedBundles(): Promise<Bundle[]> {
    return this.bundles.filter(bundle => bundle.isFeatured === true);
  }

  // Get popular bundles
  async getPopularBundles(): Promise<Bundle[]> {
    return this.bundles.filter(bundle => bundle.isPopular === true);
  }
}

// Export singleton instance
export const bundlesService = new BundleService();

// Export type for external use
export type { Bundle, BundleNote, BundleVideo };
