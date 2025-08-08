// Beta Access Settings Service
// Manages the beta access restrictions for different features

export interface BetaSettings {
  betaAccessEnabled: boolean;
  restrictedPages: string[];
  allowedRoles: string[];
}

// Default settings
const DEFAULT_BETA_SETTINGS: BetaSettings = {
  betaAccessEnabled: false, // Set to false to temporarily disable restrictions
  restrictedPages: [
    'Download Page',
    'Notification Page', 
    'Exam Updates',
    'Counselling Updates',
    'Leaderboard',
    'Upload Notes',
    'Download Notes',
    'Blog',
    'Events',
    'Resources',
    'Study Materials',
    'Question Papers',
    'Tutorials',
    'Projects',
    'Internships',
    'Job Portal',
    'Dashboard',
    'Admin Dashboard',
    'All Pages' // This means all pages are restricted by default
  ],
  allowedRoles: ['admin', 'team', 'intern', 'manager', 'betatest']
};

class BetaSettingsService {
  private settings: BetaSettings = { ...DEFAULT_BETA_SETTINGS };

  constructor() {
    // Load settings from localStorage or use defaults
    this.loadSettings();
  }

  private loadSettings(): void {
    try {
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('betaSettings');
        if (savedSettings) {
          this.settings = { ...DEFAULT_BETA_SETTINGS, ...JSON.parse(savedSettings) };
          return;
        }
      }
    } catch (error) {
      console.error('Error loading beta settings:', error);
    }
    
    this.settings = { ...DEFAULT_BETA_SETTINGS };
  }

  private saveSettings(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('betaSettings', JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('Error saving beta settings:', error);
    }
  }

  // Get current settings
  getSettings(): BetaSettings {
    return { ...this.settings };
  }

  // Check if beta access is enabled
  isBetaAccessEnabled(): boolean {
    return this.settings.betaAccessEnabled;
  }

  // Enable/disable beta access
  setBetaAccessEnabled(enabled: boolean): void {
    this.settings.betaAccessEnabled = enabled;
    this.saveSettings();
  }

  // Check if a page is restricted
  isPageRestricted(pageName: string): boolean {
    if (!this.settings.betaAccessEnabled) {
      return false;
    }
    return this.settings.restrictedPages.includes(pageName);
  }

  // Check if a user role has access
  hasRoleAccess(userRole: string | undefined): boolean {
    if (!this.settings.betaAccessEnabled) {
      return true;
    }
    
    if (!userRole) {
      return false;
    }

    return this.settings.allowedRoles.includes(userRole.toLowerCase());
  }

  // Add a page to restricted list
  addRestrictedPage(pageName: string): void {
    if (!this.settings.restrictedPages.includes(pageName)) {
      this.settings.restrictedPages.push(pageName);
      this.saveSettings();
    }
  }

  // Remove a page from restricted list
  removeRestrictedPage(pageName: string): void {
    const index = this.settings.restrictedPages.indexOf(pageName);
    if (index > -1) {
      this.settings.restrictedPages.splice(index, 1);
      this.saveSettings();
    }
  }

  // Add an allowed role
  addAllowedRole(role: string): void {
    const lowerRole = role.toLowerCase();
    if (!this.settings.allowedRoles.includes(lowerRole)) {
      this.settings.allowedRoles.push(lowerRole);
      this.saveSettings();
    }
  }

  // Remove an allowed role
  removeAllowedRole(role: string): void {
    const lowerRole = role.toLowerCase();
    const index = this.settings.allowedRoles.indexOf(lowerRole);
    if (index > -1) {
      this.settings.allowedRoles.splice(index, 1);
      this.saveSettings();
    }
  }

  // Reset settings to defaults
  resetSettings(): void {
    this.settings = { ...DEFAULT_BETA_SETTINGS };
    this.saveSettings();
  }

  // Update all settings
  updateSettings(newSettings: Partial<BetaSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }
}

// Export singleton instance
export const betaSettingsService = new BetaSettingsService();

// Export for admin panel components
export default BetaSettingsService;
