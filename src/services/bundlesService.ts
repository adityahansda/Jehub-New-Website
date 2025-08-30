// Bundle-related types
export interface BundleNote {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  type: string;
  size: string;
}

export interface BundleVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
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
  access: string; // 'free', 'premium', 'purchase'
  notes: BundleNote[];
  videos: BundleVideo[];
  instructor: string;
  tags: string[];
  status: string; // 'draft', 'published', 'archived'
  notesCount: number;
  videosCount?: number;
  totalDownloads?: number;
  rating?: number;
  reviews?: number;
  level?: string;
  duration?: string;
  revenue?: number;
  totalSales?: number;
  targetSales?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
}

class BundlesService {
  private readonly STORAGE_KEY_PUBLISHED = 'jehub_published_bundles';
  private readonly STORAGE_KEY_ADMIN = 'jehub_admin_bundles';

  /**
   * Get all published bundles
   */
  async getPublishedBundles(): Promise<Bundle[]> {
    try {
      if (typeof window === 'undefined') {
        return this.getMockBundles();
      }
      
      const stored = localStorage.getItem(this.STORAGE_KEY_PUBLISHED);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return mock data if no stored data exists
      const mockBundles = this.getMockBundles();
      await this.savePublishedBundles(mockBundles);
      return mockBundles;
    } catch (error) {
      console.error('Error loading published bundles:', error);
      return this.getMockBundles();
    }
  }

  /**
   * Get all admin bundles (including drafts)
   */
  async getAdminBundles(): Promise<Bundle[]> {
    try {
      if (typeof window === 'undefined') {
        return this.getMockAdminBundles();
      }
      
      const stored = localStorage.getItem(this.STORAGE_KEY_ADMIN);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return mock data if no stored data exists
      const mockBundles = this.getMockAdminBundles();
      await this.saveAdminBundles(mockBundles);
      return mockBundles;
    } catch (error) {
      console.error('Error loading admin bundles:', error);
      return this.getMockAdminBundles();
    }
  }

  /**
   * Save published bundles to storage
   */
  async savePublishedBundles(bundles: Bundle[]): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY_PUBLISHED, JSON.stringify(bundles));
      }
    } catch (error) {
      console.error('Error saving published bundles:', error);
      throw error;
    }
  }

  /**
   * Save admin bundles to storage
   */
  async saveAdminBundles(bundles: Bundle[]): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY_ADMIN, JSON.stringify(bundles));
      }
    } catch (error) {
      console.error('Error saving admin bundles:', error);
      throw error;
    }
  }

  /**
   * Create a new bundle
   */
  async createBundle(bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>, isAdmin: boolean = false): Promise<Bundle> {
    try {
      const newBundle: Bundle = {
        ...bundleData,
        id: `bundle_${Date.now()}`,
        $id: `bundle_${Date.now()}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };

      if (isAdmin) {
        const adminBundles = await this.getAdminBundles();
        adminBundles.unshift(newBundle);
        await this.saveAdminBundles(adminBundles);
      } else {
        const publishedBundles = await this.getPublishedBundles();
        publishedBundles.unshift(newBundle);
        await this.savePublishedBundles(publishedBundles);
      }

      return newBundle;
    } catch (error) {
      console.error('Error creating bundle:', error);
      throw error;
    }
  }

  /**
   * Update a bundle
   */
  async updateBundle(bundleId: string, updateData: Partial<Bundle>, isAdmin: boolean = false): Promise<Bundle> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      const bundleIndex = bundles.findIndex(b => b.id === bundleId || b.$id === bundleId);
      
      if (bundleIndex === -1) {
        throw new Error('Bundle not found');
      }

      const updatedBundle = {
        ...bundles[bundleIndex],
        ...updateData,
        $updatedAt: new Date().toISOString(),
      };

      bundles[bundleIndex] = updatedBundle;
      
      if (isAdmin) {
        await this.saveAdminBundles(bundles);
      } else {
        await this.savePublishedBundles(bundles);
      }

      return updatedBundle;
    } catch (error) {
      console.error('Error updating bundle:', error);
      throw error;
    }
  }

  /**
   * Delete a bundle
   */
  async deleteBundle(bundleId: string, isAdmin: boolean = false): Promise<void> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      const filteredBundles = bundles.filter(b => b.id !== bundleId && b.$id !== bundleId);
      
      if (isAdmin) {
        await this.saveAdminBundles(filteredBundles);
      } else {
        await this.savePublishedBundles(filteredBundles);
      }
    } catch (error) {
      console.error('Error deleting bundle:', error);
      throw error;
    }
  }

  /**
   * Get bundle by ID
   */
  async getBundleById(bundleId: string, isAdmin: boolean = false): Promise<Bundle | null> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      return bundles.find(b => b.id === bundleId || b.$id === bundleId) || null;
    } catch (error) {
      console.error('Error getting bundle by ID:', error);
      return null;
    }
  }

  /**
   * Search bundles
   */
  async searchBundles(query: string, filters?: {
    category?: string;
    access?: string;
    minPrice?: number;
    maxPrice?: number;
  }, isAdmin: boolean = false): Promise<Bundle[]> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      
      return bundles.filter(bundle => {
        // Text search
        const matchesQuery = !query || 
          bundle.title.toLowerCase().includes(query.toLowerCase()) ||
          bundle.description.toLowerCase().includes(query.toLowerCase()) ||
          bundle.category.toLowerCase().includes(query.toLowerCase()) ||
          bundle.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        // Filters
        const matchesCategory = !filters?.category || bundle.category === filters.category;
        const matchesAccess = !filters?.access || bundle.access === filters.access;
        const matchesMinPrice = !filters?.minPrice || bundle.price >= filters.minPrice;
        const matchesMaxPrice = !filters?.maxPrice || bundle.price <= filters.maxPrice;

        return matchesQuery && matchesCategory && matchesAccess && matchesMinPrice && matchesMaxPrice;
      });
    } catch (error) {
      console.error('Error searching bundles:', error);
      return [];
    }
  }

  /**
   * Get bundles by category
   */
  async getBundlesByCategory(category: string, isAdmin: boolean = false): Promise<Bundle[]> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      return bundles.filter(bundle => bundle.category === category);
    } catch (error) {
      console.error('Error getting bundles by category:', error);
      return [];
    }
  }

  /**
   * Get featured bundles
   */
  async getFeaturedBundles(limit: number = 6): Promise<Bundle[]> {
    try {
      const bundles = await this.getPublishedBundles();
      return bundles
        .filter(bundle => bundle.isFeatured && bundle.status === 'published')
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting featured bundles:', error);
      return [];
    }
  }

  /**
   * Get popular bundles
   */
  async getPopularBundles(limit: number = 6): Promise<Bundle[]> {
    try {
      const bundles = await this.getPublishedBundles();
      return bundles
        .filter(bundle => bundle.isPopular && bundle.status === 'published')
        .sort((a, b) => (b.totalDownloads || 0) - (a.totalDownloads || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting popular bundles:', error);
      return [];
    }
  }

  /**
   * Get mock bundles for published bundles
   */
  private getMockBundles(): Bundle[] {
    return [
      {
        id: '1',
        title: 'Complete Data Structures & Algorithms',
        description: 'Comprehensive collection of DSA notes, practice problems, and implementation guides for competitive programming and technical interviews.',
        category: 'Computer Science',
        price: 299,
        originalPrice: 599,
        discount: 50,
        access: 'purchase',
        notes: [
          {
            id: 'note_1',
            title: 'Arrays & Strings Fundamentals',
            description: 'Learn array manipulation and string processing techniques',
            fileUrl: 'https://example.com/arrays.pdf',
            type: 'pdf',
            size: '2.4 MB'
          },
          {
            id: 'note_2',
            title: 'Linked Lists Complete Guide',
            description: 'Master linked list operations and implementations',
            fileUrl: 'https://example.com/linked-lists.pdf',
            type: 'pdf',
            size: '1.8 MB'
          }
        ],
        videos: [
          {
            id: 'video_1',
            title: 'DSA Introduction & Roadmap',
            description: 'Complete roadmap for learning DSA effectively',
            url: 'https://www.youtube.com/watch?v=0IAPZzGSbME',
            type: 'youtube',
            duration: '15:30'
          }
        ],
        instructor: 'Prof. Aditya Kumar',
        tags: ['DSA', 'Algorithms', 'Data Structures', 'Coding', 'Interviews'],
        status: 'published',
        notesCount: 12,
        videosCount: 8,
        totalDownloads: 1247,
        rating: 4.8,
        reviews: 89,
        level: 'Intermediate',
        duration: '6 weeks',
        isPopular: true,
        isFeatured: true,
        revenue: 372530,
        totalSales: 1247
      },
      {
        id: '2',
        title: 'Digital Electronics Mastery Bundle',
        description: 'Master digital electronics with logic gates, flip-flops, counters, and digital system design. Perfect for ECE students.',
        category: 'Electronics',
        price: 199,
        originalPrice: 399,
        discount: 50,
        access: 'purchase',
        notes: [
          {
            id: 'note_3',
            title: 'Logic Gates & Boolean Algebra',
            description: 'Fundamentals of logic gates and Boolean operations',
            fileUrl: 'https://example.com/logic-gates.pdf',
            type: 'pdf',
            size: '1.9 MB'
          }
        ],
        videos: [
          {
            id: 'video_2',
            title: 'Digital Electronics Basics',
            description: 'Introduction to digital electronics concepts',
            url: 'https://www.youtube.com/watch?v=example4',
            type: 'youtube',
            duration: '18:45'
          }
        ],
        instructor: 'Dr. Priya Sharma',
        tags: ['Digital Electronics', 'Logic Gates', 'Flip Flops', 'Counters'],
        status: 'published',
        notesCount: 8,
        videosCount: 6,
        totalDownloads: 856,
        rating: 4.6,
        reviews: 67,
        level: 'Beginner',
        duration: '4 weeks',
        isPopular: false,
        isFeatured: false,
        revenue: 170344,
        totalSales: 856
      },
      {
        id: '3',
        title: 'Mechanical Engineering Fundamentals',
        description: 'Core mechanical engineering concepts including thermodynamics, fluid mechanics, and strength of materials.',
        category: 'Mechanical',
        price: 0,
        access: 'free',
        notes: [
          {
            id: 'note_4',
            title: 'Thermodynamics Laws & Cycles',
            description: 'Complete thermodynamics theory and applications',
            fileUrl: 'https://example.com/thermodynamics.pdf',
            type: 'pdf',
            size: '3.5 MB'
          }
        ],
        videos: [
          {
            id: 'video_3',
            title: 'Thermodynamics Introduction',
            description: 'Introduction to thermodynamic principles',
            url: 'https://www.youtube.com/watch?v=example7',
            type: 'youtube',
            duration: '30:00'
          }
        ],
        instructor: 'Prof. Rajesh Singh',
        tags: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials'],
        status: 'published',
        notesCount: 15,
        videosCount: 12,
        totalDownloads: 2134,
        rating: 4.7,
        reviews: 156,
        level: 'Beginner',
        duration: '8 weeks',
        isPopular: true,
        isFeatured: true,
        revenue: 0,
        totalSales: 0
      }
    ];
  }

  /**
   * Get mock admin bundles (includes drafts and more detailed data)
   */
  private getMockAdminBundles(): Bundle[] {
    const publishedBundles = this.getMockBundles();
    
    // Add some draft bundles for admin view
    const draftBundles: Bundle[] = [
      {
        id: '4',
        title: 'Advanced Machine Learning Bundle',
        description: 'Deep learning, neural networks, and AI implementation guides',
        category: 'Computer Science',
        price: 499,
        originalPrice: 699,
        discount: 29,
        access: 'premium',
        notes: [],
        videos: [],
        instructor: 'Dr. AI Expert',
        tags: ['Machine Learning', 'AI', 'Neural Networks'],
        status: 'draft',
        notesCount: 0,
        videosCount: 0,
        totalDownloads: 0,
        rating: 0,
        reviews: 0,
        level: 'Advanced',
        duration: '12 weeks',
        isPopular: false,
        isFeatured: false,
        revenue: 0,
        totalSales: 0,
        targetSales: 500
      },
      {
        id: '5',
        title: 'Power Electronics & Control Systems',
        description: 'Comprehensive guide to power electronics and control system design',
        category: 'Electronics',
        price: 349,
        access: 'purchase',
        notes: [],
        videos: [],
        instructor: 'Prof. Power Systems',
        tags: ['Power Electronics', 'Control Systems', 'MATLAB'],
        status: 'draft',
        notesCount: 0,
        videosCount: 0,
        totalDownloads: 0,
        rating: 0,
        reviews: 0,
        level: 'Advanced',
        duration: '10 weeks',
        isPopular: false,
        isFeatured: false,
        revenue: 0,
        totalSales: 0,
        targetSales: 200
      }
    ];
    
    return [...draftBundles, ...publishedBundles];
  }

  /**
   * Get bundle statistics
   */
  async getBundleStats(isAdmin: boolean = false): Promise<{
    totalBundles: number;
    publishedBundles: number;
    draftBundles: number;
    totalRevenue: number;
    totalSales: number;
    averageRating: number;
  }> {
    try {
      const bundles = isAdmin ? await this.getAdminBundles() : await this.getPublishedBundles();
      
      const totalBundles = bundles.length;
      const publishedBundles = bundles.filter(b => b.status === 'published').length;
      const draftBundles = bundles.filter(b => b.status === 'draft').length;
      const totalRevenue = bundles.reduce((sum, b) => sum + (b.revenue || 0), 0);
      const totalSales = bundles.reduce((sum, b) => sum + (b.totalSales || 0), 0);
      
      const bundlesWithRatings = bundles.filter(b => b.rating && b.rating > 0);
      const averageRating = bundlesWithRatings.length > 0
        ? bundlesWithRatings.reduce((sum, b) => sum + (b.rating || 0), 0) / bundlesWithRatings.length
        : 0;

      return {
        totalBundles,
        publishedBundles,
        draftBundles,
        totalRevenue,
        totalSales,
        averageRating
      };
    } catch (error) {
      console.error('Error getting bundle stats:', error);
      return {
        totalBundles: 0,
        publishedBundles: 0,
        draftBundles: 0,
        totalRevenue: 0,
        totalSales: 0,
        averageRating: 0
      };
    }
  }
}

// Export singleton instance
export const bundlesService = new BundlesService();
