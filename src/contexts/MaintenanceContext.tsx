import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PageStatus {
  id: number;
  name: string;
  path: string;
  enabled: boolean;
  maintenance: boolean;
}

interface MaintenanceContextType {
  pages: PageStatus[];
  globalMaintenance: boolean;
  setPages: React.Dispatch<React.SetStateAction<PageStatus[]>>;
  setGlobalMaintenance: React.Dispatch<React.SetStateAction<boolean>>;
  updatePageStatus: (pageId: number, updates: Partial<PageStatus>) => void;
  isPageInMaintenance: (path: string) => boolean;
  isPageEnabled: (path: string) => boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const useMaintenanceContext = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within a MaintenanceProvider');
  }
  return context;
};

interface MaintenanceProviderProps {
  children: ReactNode;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ children }) => {
  const [pages, setPages] = useState<PageStatus[]>([
    { id: 1, name: 'Notes Upload', path: '/notes-upload', enabled: true, maintenance: false },
    { id: 2, name: 'Notes Download', path: '/notes-download', enabled: true, maintenance: false },
    { id: 3, name: 'Community', path: '/community', enabled: false, maintenance: true },
    { id: 4, name: 'Leaderboard', path: '/leaderboard', enabled: true, maintenance: false },
    { id: 5, name: 'User Dashboard', path: '/dashboard', enabled: true, maintenance: false },
    { id: 6, name: 'Profile Settings', path: '/profile', enabled: true, maintenance: false },
    { id: 7, name: 'Team Page', path: '/team', enabled: true, maintenance: false },
    { id: 8, name: 'Contact Us', path: '/contact', enabled: true, maintenance: false },
  ]);

  const [globalMaintenance, setGlobalMaintenance] = useState(false);

  // Load maintenance state from localStorage on component mount
  useEffect(() => {
    const savedPages = localStorage.getItem('maintenance-pages');
    const savedGlobalMaintenance = localStorage.getItem('global-maintenance');
    
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (error) {
        console.error('Error loading maintenance pages from localStorage:', error);
      }
    }
    
    if (savedGlobalMaintenance) {
      setGlobalMaintenance(savedGlobalMaintenance === 'true');
    }
  }, []);

  // Save maintenance state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('maintenance-pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('global-maintenance', globalMaintenance.toString());
  }, [globalMaintenance]);

  const updatePageStatus = (pageId: number, updates: Partial<PageStatus>) => {
    setPages(prev => 
      prev.map(page => 
        page.id === pageId ? { ...page, ...updates } : page
      )
    );
  };

  const isPageInMaintenance = (path: string): boolean => {
    if (globalMaintenance) return true;
    const page = pages.find(p => p.path === path);
    return page ? page.maintenance : false;
  };

  const isPageEnabled = (path: string): boolean => {
    const page = pages.find(p => p.path === path);
    return page ? page.enabled : true;
  };

  const value: MaintenanceContextType = {
    pages,
    globalMaintenance,
    setPages,
    setGlobalMaintenance,
    updatePageStatus,
    isPageInMaintenance,
    isPageEnabled,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};
