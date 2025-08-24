import { useState, useEffect, useCallback } from 'react';
import { Bundle, BundleFilters, bundlesService } from '../services/bundlesService';
import { bundlesRealTimeService, BundleRealtimeEvent } from '../services/bundlesRealTimeService';

interface UseBundlesOptions {
  filters?: BundleFilters;
  limit?: number;
  enableRealTime?: boolean;
}

interface UseBundlesReturn {
  bundles: Bundle[];
  loading: boolean;
  error: string | null;
  refreshBundles: () => Promise<void>;
  createBundle: (bundleData: Omit<Bundle, '$id' | '$createdAt' | '$updatedAt'>) => Promise<Bundle>;
  updateBundle: (bundleId: string, updateData: Partial<Bundle>) => Promise<Bundle>;
  deleteBundle: (bundleId: string) => Promise<void>;
  deleteBundles: (bundleIds: string[]) => Promise<void>;
  getBundleById: (bundleId: string) => Promise<Bundle>;
}

export const useBundles = (options: UseBundlesOptions = {}): UseBundlesReturn => {
  const { filters, limit = 25, enableRealTime = false } = options;
  
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bundles from Appwrite
  const loadBundles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let bundlesData: Bundle[];
      
      if (filters?.status === 'published') {
        // Use published bundles method for public pages
        bundlesData = await bundlesService.getPublishedBundles(filters, limit);
      } else {
        // Use general getBundles method for admin pages
        bundlesData = await bundlesService.getBundles(filters, limit);
      }
      
      setBundles(bundlesData);
    } catch (err) {
      console.error('Error loading bundles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, [filters, limit]);

  // Refresh bundles
  const refreshBundles = useCallback(async () => {
    await loadBundles();
  }, [loadBundles]);

  // Create bundle
  const createBundle = useCallback(async (bundleData: Omit<Bundle, '$id' | '$createdAt' | '$updatedAt'>): Promise<Bundle> => {
    try {
      const newBundle = await bundlesService.createBundle(bundleData);
      
      // If real-time is disabled, manually update the local state
      if (!enableRealTime) {
        setBundles(prev => [newBundle, ...prev]);
      }
      
      return newBundle;
    } catch (err) {
      console.error('Error creating bundle:', err);
      throw err;
    }
  }, [enableRealTime]);

  // Update bundle
  const updateBundle = useCallback(async (bundleId: string, updateData: Partial<Bundle>): Promise<Bundle> => {
    try {
      const updatedBundle = await bundlesService.updateBundle(bundleId, updateData);
      
      // If real-time is disabled, manually update the local state
      if (!enableRealTime) {
        setBundles(prev => prev.map(bundle => 
          bundle.$id === bundleId ? updatedBundle : bundle
        ));
      }
      
      return updatedBundle;
    } catch (err) {
      console.error('Error updating bundle:', err);
      throw err;
    }
  }, [enableRealTime]);

  // Delete single bundle
  const deleteBundle = useCallback(async (bundleId: string): Promise<void> => {
    try {
      await bundlesService.deleteBundle(bundleId);
      
      // If real-time is disabled, manually update the local state
      if (!enableRealTime) {
        setBundles(prev => prev.filter(bundle => bundle.$id !== bundleId));
      }
    } catch (err) {
      console.error('Error deleting bundle:', err);
      throw err;
    }
  }, [enableRealTime]);

  // Delete multiple bundles
  const deleteBundles = useCallback(async (bundleIds: string[]): Promise<void> => {
    try {
      await bundlesService.deleteBundles(bundleIds);
      
      // If real-time is disabled, manually update the local state
      if (!enableRealTime) {
        setBundles(prev => prev.filter(bundle => !bundleIds.includes(bundle.$id!)));
      }
    } catch (err) {
      console.error('Error deleting bundles:', err);
      throw err;
    }
  }, [enableRealTime]);

  // Get bundle by ID
  const getBundleById = useCallback(async (bundleId: string): Promise<Bundle> => {
    try {
      return await bundlesService.getBundleById(bundleId);
    } catch (err) {
      console.error('Error getting bundle by ID:', err);
      throw err;
    }
  }, []);

  // Handle real-time events
  const handleRealtimeEvent = useCallback((event: BundleRealtimeEvent) => {
    console.log('Bundle real-time event:', event);
    
    switch (event.event) {
      case 'create':
        if (event.bundle) {
          setBundles(prev => {
            // Check if bundle already exists to avoid duplicates
            const exists = prev.some(bundle => bundle.$id === event.bundle!.$id);
            if (exists) return prev;
            return [event.bundle!, ...prev];
          });
        }
        break;
        
      case 'update':
        if (event.bundle) {
          setBundles(prev => prev.map(bundle => 
            bundle.$id === event.bundle!.$id ? event.bundle! : bundle
          ));
        }
        break;
        
      case 'delete':
        if (event.bundleId) {
          setBundles(prev => prev.filter(bundle => bundle.$id !== event.bundleId));
        }
        break;
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    let subscriptionId: string | null = null;
    
    if (enableRealTime) {
      try {
        subscriptionId = bundlesRealTimeService.subscribeToBundles(handleRealtimeEvent);
        console.log('🔄 Bundle real-time subscription active:', subscriptionId);
      } catch (err) {
        console.error('Error setting up real-time subscription:', err);
      }
    }
    
    return () => {
      if (subscriptionId && enableRealTime) {
        bundlesRealTimeService.unsubscribe(subscriptionId);
        console.log('🔄 Bundle real-time subscription cleaned up');
      }
    };
  }, [enableRealTime, handleRealtimeEvent]);

  // Load bundles on mount and when dependencies change
  useEffect(() => {
    loadBundles();
  }, [loadBundles]);

  return {
    bundles,
    loading,
    error,
    refreshBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    deleteBundles,
    getBundleById
  };
};

// Hook specifically for published bundles (Study Bundles page)
export const usePublishedBundles = (filters?: Omit<BundleFilters, 'status'>, enableRealTime = true) => {
  return useBundles({
    filters: { ...filters, status: 'published' },
    enableRealTime
  });
};

// Hook specifically for admin bundle management
export const useAdminBundles = (filters?: BundleFilters, enableRealTime = true) => {
  return useBundles({
    filters,
    enableRealTime
  });
};

export default useBundles;
