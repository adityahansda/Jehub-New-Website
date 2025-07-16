import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navigation from './Navigation';
import Footer from './Footer';
import MobileHeader from './mobile/MobileHeader';
import MobileNavigation from './mobile/MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Check if current page is home page
  const isHomePage = router.pathname === '/';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {isMobile ? (
        <>
          {/* Only show MobileHeader on home page */}
          {isHomePage && <MobileHeader user={user} notificationCount={0} />}
          <MobileNavigation />
        </>
      ) : (
        /* Show Navigation on desktop */
        <Navigation />
      )}
      <main className={`${isHomePage && isMobile ? 'pt-1' : 'pt-16'} ${isMobile ? 'pb-20' : ''}`}>
        {children}
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default Layout;
