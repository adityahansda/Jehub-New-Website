import { useState, useEffect, useCallback } from 'react';
import { Bundle, bundlesService } from '../services/bundlesService';

interface BundlesHookReturn {
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  createBundle: (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>) => Promise<Bundle>;
  updateBundle: (bundleId: string, updateData: Partial<Bundle>) => Promise<Bundle>;
  deleteBundle: (bundleId: string) => Promise<void>;
  refreshBundles: () => Promise<void>;
}

/**
 * Hook for managing published bundles
 */
export function usePublishedBundles(): BundlesHookReturn {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bundles from service
  const loadBundles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bundlesData = await bundlesService.getPublishedBundles();
      setBundles(bundlesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bundles';
      setError(errorMessage);
      console.error('Error loading published bundles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBundles();
  }, [loadBundles]);

  // Create a new bundle
  const createBundle = useCallback(async (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> => {
    try {
      setError(null);
      const newBundle = await bundlesService.createBundle(bundleData, false);
      setBundles(prev => [newBundle, ...prev]);
      return newBundle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update a bundle
  const updateBundle = useCallback(async (bundleId: string, updateData: Partial<Bundle>): Promise<Bundle> => {
    try {
      setError(null);
      const updatedBundle = await bundlesService.updateBundle(bundleId, updateData, false);
      setBundles(prev => 
        prev.map(bundle => 
          (bundle.id === bundleId || bundle.$id === bundleId) ? updatedBundle : bundle
        )
      );
      return updatedBundle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a bundle
  const deleteBundle = useCallback(async (bundleId: string): Promise<void> => {
    try {
      setError(null);
      await bundlesService.deleteBundle(bundleId, false);
      setBundles(prev => 
        prev.filter(bundle => bundle.id !== bundleId && bundle.$id !== bundleId)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Refresh bundles
  const refreshBundles = useCallback(async (): Promise<void> => {
    await loadBundles();
  }, [loadBundles]);

  return {
    bundles,
    loading,
    error,
    createBundle,
    updateBundle,
    deleteBundle,
    refreshBundles
  };
}

/**
 * Hook for managing admin bundles (includes drafts and unpublished)
 */
export function useAdminBundles(): BundlesHookReturn {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bundles from service
  const loadBundles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bundlesData = await bundlesService.getAdminBundles();
      setBundles(bundlesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin bundles';
      setError(errorMessage);
      console.error('Error loading admin bundles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBundles();
  }, [loadBundles]);

  // Create a new bundle
  const createBundle = useCallback(async (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> => {
    try {
      setError(null);
      const newBundle = await bundlesService.createBundle(bundleData, true);
      setBundles(prev => [newBundle, ...prev]);
      return newBundle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update a bundle
  const updateBundle = useCallback(async (bundleId: string, updateData: Partial<Bundle>): Promise<Bundle> => {
    try {
      setError(null);
      const updatedBundle = await bundlesService.updateBundle(bundleId, updateData, true);
      setBundles(prev => 
        prev.map(bundle => 
          (bundle.id === bundleId || bundle.$id === bundleId) ? updatedBundle : bundle
        )
      );
      return updatedBundle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete a bundle
  const deleteBundle = useCallback(async (bundleId: string): Promise<void> => {
    try {
      setError(null);
      await bundlesService.deleteBundle(bundleId, true);
      setBundles(prev => 
        prev.filter(bundle => bundle.id !== bundleId && bundle.$id !== bundleId)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Refresh bundles
  const refreshBundles = useCallback(async (): Promise<void> => {
    await loadBundles();
  }, [loadBundles]);

  return {
    bundles,
    loading,
    error,
    createBundle,
    updateBundle,
    deleteBundle,
    refreshBundles
  };
}

/**
 * Hook for searching bundles
 */
export function useBundleSearch(isAdmin: boolean = false) {
  const [results, setResults] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBundles = useCallback(async (
    query: string, 
    filters?: {
      category?: string;
      access?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await bundlesService.searchBundles(query, filters, isAdmin);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('Error searching bundles:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchBundles,
    clearSearch
  };
}

/**
 * Hook for getting bundle statistics
 */
export function useBundleStats(isAdmin: boolean = false) {
  const [stats, setStats] = useState({
    totalBundles: 0,
    publishedBundles: 0,
    draftBundles: 0,
    totalRevenue: 0,
    totalSales: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await bundlesService.getBundleStats(isAdmin);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bundle stats';
      setError(errorMessage);
      console.error('Error loading bundle stats:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats
  };
}

/**
 * Hook for getting featured bundles
 */
export function useFeaturedBundles(limit: number = 6) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedBundles = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredBundles = await bundlesService.getFeaturedBundles(limit);
        setBundles(featuredBundles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load featured bundles';
        setError(errorMessage);
        console.error('Error loading featured bundles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBundles();
  }, [limit]);

  return { bundles, loading, error };
}

/**
 * Hook for getting popular bundles
 */
export function usePopularBundles(limit: number = 6) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPopularBundles = async () => {
      try {
        setLoading(true);
        setError(null);
        const popularBundles = await bundlesService.getPopularBundles(limit);
        setBundles(popularBundles);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load popular bundles';
        setError(errorMessage);
        console.error('Error loading popular bundles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPopularBundles();
  }, [limit]);

  return { bundles, loading, error };
}

/**
 * Hook for getting a single bundle by ID
 */
export function useBundle(bundleId: string, isAdmin: boolean = false) {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBundle = async () => {
      if (!bundleId) {
        setBundle(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const bundleData = await bundlesService.getBundleById(bundleId, isAdmin);
        setBundle(bundleData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bundle';
        setError(errorMessage);
        console.error('Error loading bundle:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBundle();
  }, [bundleId, isAdmin]);

  return { bundle, loading, error };
}
