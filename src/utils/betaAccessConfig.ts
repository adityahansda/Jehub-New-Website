// Beta Access Configuration
// Manages which pages should be restricted and which should be open

export interface PageConfig {
  pageName: string;
  betaRestricted: boolean;
  description?: string;
  category?: 'core' | 'features' | 'admin' | 'experimental';
}

// Define which pages should be in beta and which should be open to all users
export const PAGE_CONFIGS: PageConfig[] = [
  // Core pages that should always be accessible
  { 
    pageName: 'Dashboard', 
    betaRestricted: false, 
    description: 'User dashboard - always accessible',
    category: 'core'
  },
  { 
    pageName: 'Login', 
    betaRestricted: false, 
    description: 'Login page - always accessible',
    category: 'core'
  },
  { 
    pageName: 'Signup', 
    betaRestricted: false, 
    description: 'Signup page - always accessible',
    category: 'core'
  },
  { 
    pageName: 'Home', 
    betaRestricted: false, 
    description: 'Homepage - always accessible',
    category: 'core'
  },
  
  // Features that could be beta restricted
  { 
    pageName: 'Download Notes', 
    betaRestricted: true, 
    description: 'Notes download feature',
    category: 'features'
  },
  { 
    pageName: 'Upload Notes', 
    betaRestricted: true, 
    description: 'Notes upload feature',
    category: 'features'
  },
  { 
    pageName: 'Download Notes', 
    betaRestricted: true, 
    description: 'Notes download feature',
    category: 'features'
  },
  { 
    pageName: 'Leaderboard', 
    betaRestricted: true, 
    description: 'Community leaderboard',
    category: 'features'
  },
  { 
    pageName: 'Notification Page', 
    betaRestricted: true, 
    description: 'User notifications',
    category: 'features'
  },
  { 
    pageName: 'Blog', 
    betaRestricted: true, 
    description: 'Blog and articles',
    category: 'features'
  },
  { 
    pageName: 'Events', 
    betaRestricted: true, 
    description: 'Events and announcements',
    category: 'features'
  },
  { 
    pageName: 'Internships', 
    betaRestricted: true, 
    description: 'Internship opportunities',
    category: 'features'
  },
  { 
    pageName: 'Job Portal', 
    betaRestricted: true, 
    description: 'Job opportunities portal',
    category: 'features'
  },
  { 
    pageName: 'Exam Updates', 
    betaRestricted: true, 
    description: 'Exam updates and notifications',
    category: 'features'
  },
  { 
    pageName: 'Counselling Updates', 
    betaRestricted: true, 
    description: 'Counselling updates and notifications',
    category: 'features'
  },
  
  // Admin pages (always have their own protection)
  { 
    pageName: 'Admin Dashboard', 
    betaRestricted: false, 
    description: 'Admin dashboard has own protection',
    category: 'admin'
  },
  
  // Experimental features
  { 
    pageName: 'Study Materials', 
    betaRestricted: true, 
    description: 'Enhanced study materials',
    category: 'experimental'
  },
  { 
    pageName: 'Question Papers', 
    betaRestricted: true, 
    description: 'Question papers database',
    category: 'experimental'
  },
  { 
    pageName: 'Tutorials', 
    betaRestricted: true, 
    description: 'Interactive tutorials',
    category: 'experimental'
  },
  { 
    pageName: 'Projects', 
    betaRestricted: true, 
    description: 'Projects showcase',
    category: 'experimental'
  }
];

// Beta access configuration class
export class BetaAccessConfig {
  
  /**
   * Check if a page should be beta restricted
   */
  static isPageBetaRestricted(pageName: string): boolean {
    const config = PAGE_CONFIGS.find(p => p.pageName === pageName);
    return config?.betaRestricted ?? false; // Default to not restricted
  }
  
  /**
   * Get all beta restricted pages
   */
  static getBetaRestrictedPages(): PageConfig[] {
    return PAGE_CONFIGS.filter(p => p.betaRestricted);
  }
  
  /**
   * Get all open pages
   */
  static getOpenPages(): PageConfig[] {
    return PAGE_CONFIGS.filter(p => !p.betaRestricted);
  }
  
  /**
   * Get pages by category
   */
  static getPagesByCategory(category: PageConfig['category']): PageConfig[] {
    return PAGE_CONFIGS.filter(p => p.category === category);
  }
  
  /**
   * Check if user role has beta access
   */
  static userHasBetaAccess(userRole?: string): boolean {
    if (!userRole) return false;
    
    const betaRoles = ['admin', 'team', 'intern', 'manager', 'betatest'];
    return betaRoles.includes(userRole.toLowerCase());
  }
  
  /**
   * Get all allowed beta roles
   */
  static getBetaRoles(): string[] {
    return ['admin', 'team', 'intern', 'manager', 'betatest'];
  }
  
  /**
   * Check if beta access is enabled for the application
   */
  static isBetaAccessEnabled(): boolean {
    // Can be controlled by environment variables or settings
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('betaAccessEnabled');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    }
    
    // Default based on environment or configuration
    return true; // Beta access is enabled by default
  }
  
  /**
   * Enable or disable beta access
   */
  static setBetaAccessEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('betaAccessEnabled', JSON.stringify(enabled));
    }
  }
}

export default BetaAccessConfig;
