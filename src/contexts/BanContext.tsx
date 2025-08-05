import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { banService, BanInfo } from '../services/banService';

interface BanContextType {
  isBanned: boolean;
  banInfo: BanInfo | null;
  loading: boolean;
  checkBanStatus: () => Promise<void>;
}

const BanContext = createContext<BanContextType | undefined>(undefined);

export const useBan = () => {
  const context = useContext(BanContext);
  if (context === undefined) {
    throw new Error('useBan must be used within a BanProvider');
  }
  return context;
};

interface BanProviderProps {
  children: React.ReactNode;
}

export const BanProvider: React.FC<BanProviderProps> = ({ children }) => {
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkBanStatus = async () => {
    try {
      setLoading(true);
      const result = await banService.isUserBanned();
      
      if (result.isBanned && result.banInfo) {
        setIsBanned(true);
        setBanInfo(result.banInfo);
        
        // Redirect to ban page if not already there
        if (router.pathname !== '/ban') {
          router.push('/ban');
        }
      } else {
        setIsBanned(false);
        setBanInfo(null);
        
        // If user is on ban page but not banned, redirect to home
        if (router.pathname === '/ban') {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Error checking ban status:', error);
      setIsBanned(false);
      setBanInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBanStatus();
  }, [router.pathname]);

  // Don't render children if banned and not on ban page
  if (isBanned && router.pathname !== '/ban') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  const value: BanContextType = {
    isBanned,
    banInfo,
    loading,
    checkBanStatus,
  };

  return <BanContext.Provider value={value}>{children}</BanContext.Provider>;
};
