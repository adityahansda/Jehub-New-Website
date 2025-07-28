import { useState, useEffect, useCallback } from 'react';
import { ShareService } from '../lib/shareService';
import {
  ShareRecord,
  CreateShareRequest,
  ShareResponse,
  ShareStats,
  UseShareReturn
} from '../types/share';

export const useShare = (userId?: string): UseShareReturn => {
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user shares
  const loadShares = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userShares = await ShareService.getUserShares(userId);
      setShares(userShares);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shares');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new share
  const createShare = useCallback(async (request: CreateShareRequest): Promise<ShareResponse> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      // Get user name (you might want to pass this from context or props)
      const userName = 'User'; // This should come from user context/state
      
      const response = await ShareService.createShare(request, userId, userName);
      
      // Refresh shares list
      await loadShares();
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create share';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, loadShares]);

  // Get a specific share
  const getShare = useCallback(async (shareId: string): Promise<ShareRecord | null> => {
    try {
      return await ShareService.getShare(shareId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get share');
      return null;
    }
  }, []);

  // Update a share
  const updateShare = useCallback(async (shareId: string, updates: Partial<ShareRecord>): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await ShareService.updateShare(shareId, updates);
      
      // Update local state
      setShares(prevShares => 
        prevShares.map(share => 
          share.shareId === shareId 
            ? { ...share, ...updates, $updatedAt: new Date().toISOString() }
            : share
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update share');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a share
  const deleteShare = useCallback(async (shareId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await ShareService.deleteShare(shareId);
      
      // Remove from local state
      setShares(prevShares => prevShares.filter(share => share.shareId !== shareId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete share');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get share statistics
  const getShareStats = useCallback(async (): Promise<ShareStats> => {
    try {
      return await ShareService.getShareStats(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get share statistics');
      throw err;
    }
  }, [userId]);

  // Refresh shares
  const refreshShares = useCallback(async (): Promise<void> => {
    await loadShares();
  }, [loadShares]);

  // Load shares on mount
  useEffect(() => {
    if (userId) {
      loadShares();
    }
  }, [loadShares, userId]);

  return {
    shares,
    loading,
    error,
    createShare,
    getShare,
    updateShare,
    deleteShare,
    getShareStats,
    refreshShares
  };
};

// Hook for share utilities
export const useShareUtils = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Generate QR code for sharing
  const generateQRCode = useCallback(async (shareUrl: string): Promise<string> => {
    setGenerating(true);
    
    try {
      // Using a free QR code API service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      setQrCodeUrl(qrUrl);
      return qrUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  }, []);

  // Copy text to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      return false;
    }
  }, []);

  // Check if Web Share API is supported
  const isNativeShareSupported = useCallback((): boolean => {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }, []);

  // Native share
  const nativeShare = useCallback(async (data: {
    title: string;
    text: string;
    url: string;
  }): Promise<boolean> => {
    if (!isNativeShareSupported()) {
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      console.error('Error with native share:', err);
      return false;
    }
  }, [isNativeShareSupported]);

  return {
    qrCodeUrl,
    generating,
    generateQRCode,
    copyToClipboard,
    isNativeShareSupported,
    nativeShare
  };
};

// Hook for share validation and access control
export const useShareAccess = () => {
  const [validating, setValidating] = useState(false);

  const validateAccess = useCallback(async (shareId: string, userId?: string): Promise<boolean> => {
    setValidating(true);
    
    try {
      return await ShareService.validateShareAccess(shareId, userId);
    } catch (err) {
      console.error('Error validating share access:', err);
      return false;
    } finally {
      setValidating(false);
    }
  }, []);

  const cleanupExpiredShares = useCallback(async (): Promise<number> => {
    try {
      return await ShareService.cleanupExpiredShares();
    } catch (err) {
      console.error('Error cleaning up expired shares:', err);
      return 0;
    }
  }, []);

  return {
    validating,
    validateAccess,
    cleanupExpiredShares
  };
};

export default useShare;
