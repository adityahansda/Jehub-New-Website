import { useState, useEffect } from 'react';
import { Bundle, bundlesService } from '../services/bundlesService';

// Interface for bundle hook return value
interface UseBundlesReturn {
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  createBundle: (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>) => Promise<Bundle>;
  updateBundle: (id: string, updates: Partial<Bundle>) => Promise<Bundle>;
  deleteBundle: (id: string) => Promise<boolean>;
  refreshBundles: () => Promise<void>;
}

// Hook for managing published bundles
export function usePublishedBundles(): UseBundlesReturn {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load published bundles
  const loadBundles = async () => {
    try {
      setLoading(true);
      setError(null);
      const publishedBundles = await bundlesService.getPublishedBundles();
      setBundles(publishedBundles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load published bundles');
      console.error('Error loading published bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new bundle
  const createBundle = async (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> => {
    try {
      const newBundle = await bundlesService.createBundle({
        ...bundleData,
        status: 'published' // Published bundles hook only handles published bundles
      });
      setBundles(prev => [newBundle, ...prev]);
      return newBundle;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Update existing bundle
  const updateBundle = async (id: string, updates: Partial<Bundle>): Promise<Bundle> => {
    try {
      const updatedBundle = await bundlesService.updateBundle(id, updates);
      setBundles(prev => prev.map(bundle => bundle.id === id ? updatedBundle : bundle));
      return updatedBundle;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Delete bundle
  const deleteBundle = async (id: string): Promise<boolean> => {
    try {
      const success = await bundlesService.deleteBundle(id);
      if (success) {
        setBundles(prev => prev.filter(bundle => bundle.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Refresh bundles
  const refreshBundles = async () => {
    await loadBundles();
  };

  // Load bundles on mount
  useEffect(() => {
    loadBundles();
  }, []);

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

// Hook for managing admin bundles (including drafts)
export function useAdminBundles(): UseBundlesReturn {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load all bundles (admin view)
  const loadBundles = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBundles = await bundlesService.getBundles();
      setBundles(allBundles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bundles');
      console.error('Error loading admin bundles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new bundle
  const createBundle = async (bundleData: Omit<Bundle, 'id' | '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> => {
    try {
      const newBundle = await bundlesService.createBundle(bundleData);
      setBundles(prev => [newBundle, ...prev]);
      return newBundle;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Update existing bundle
  const updateBundle = async (id: string, updates: Partial<Bundle>): Promise<Bundle> => {
    try {
      const updatedBundle = await bundlesService.updateBundle(id, updates);
      setBundles(prev => prev.map(bundle => bundle.id === id ? updatedBundle : bundle));
      return updatedBundle;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Delete bundle
  const deleteBundle = async (id: string): Promise<boolean> => {
    try {
      const success = await bundlesService.deleteBundle(id);
      if (success) {
        setBundles(prev => prev.filter(bundle => bundle.id !== id));
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete bundle';
      setError(error);
      throw new Error(error);
    }
  };

  // Refresh bundles
  const refreshBundles = async () => {
    await loadBundles();
  };

  // Load bundles on mount
  useEffect(() => {
    loadBundles();
  }, []);

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

// Hook for searching bundles
export function useBundleSearch(query: string) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchBundles = async () => {
      if (!query.trim()) {
        setBundles([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await bundlesService.searchBundles(query);
        setBundles(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search bundles');
        console.error('Error searching bundles:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchBundles, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { bundles, loading, error };
}

// Hook for getting bundles by category
export function useBundlesByCategory(category: string) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBundlesByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoryBundles = await bundlesService.getBundlesByCategory(category);
        setBundles(categoryBundles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bundles by category');
        console.error('Error loading bundles by category:', err);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      loadBundlesByCategory();
    }
  }, [category]);

  return { bundles, loading, error };
}
