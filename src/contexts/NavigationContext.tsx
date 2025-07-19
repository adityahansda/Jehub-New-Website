import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface NavigationContextType {
  direction: 'forward' | 'backward';
  isNavigating: boolean;
  isMobile: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  direction: 'forward',
  isNavigating: false,
  isMobile: false,
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [routeHistory, setRouteHistory] = useState<string[]>([]);
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track route changes and determine direction
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      setIsNavigating(true);
      
      // Determine if this is a back navigation
      const currentIndex = routeHistory.indexOf(router.asPath);
      const targetIndex = routeHistory.indexOf(url);
      
      if (targetIndex !== -1 && targetIndex < currentIndex) {
        setDirection('backward');
      } else {
        setDirection('forward');
      }
    };

    const handleRouteChangeComplete = (url: string) => {
      setIsNavigating(false);
      
      // Update route history
      setRouteHistory(prev => {
        const newHistory = [...prev];
        const existingIndex = newHistory.indexOf(url);
        
        if (existingIndex !== -1) {
          // Remove all routes after the current one (for back navigation)
          return newHistory.slice(0, existingIndex + 1);
        } else {
          // Add new route to history
          return [...newHistory, url];
        }
      });
    };

    const handleRouteChangeError = () => {
      setIsNavigating(false);
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      setDirection('backward');
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    window.addEventListener('popstate', handlePopState);

    // Initialize route history
    if (routeHistory.length === 0) {
      setRouteHistory([router.asPath]);
    }

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, routeHistory]);

  return (
    <NavigationContext.Provider value={{ direction, isNavigating, isMobile }}>
      {children}
    </NavigationContext.Provider>
  );
};
