/**
 * Development Configuration
 * 
 * This file contains development settings that can be easily toggled
 * without modifying multiple files.
 */

// 🔧 DEVELOPMENT BYPASS SETTINGS
export const DEV_CONFIG = {
  // Set to true to bypass authentication completely
  BYPASS_AUTH: false,

  // Set to true to enable verbose logging
  VERBOSE_LOGGING: false,

  // Set to true to disable middleware protection
  DISABLE_MIDDLEWARE_PROTECTION: false,

  // Default user data for testing (when auth is bypassed)
  DEFAULT_USER: {
    name: 'Development User',
    email: 'dev@jehub.com',
    $id: 'dev-user-123',
    $createdAt: new Date().toISOString(),
  }
};

// Helper function to check if we're in development mode
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Helper function to check if auth bypass is enabled
export const isAuthBypassed = () => {
  return isDevelopment() && DEV_CONFIG.BYPASS_AUTH;
};

console.log('🔧 Development Config Loaded:', {
  authBypass: isAuthBypassed(),
  verboseLogging: DEV_CONFIG.VERBOSE_LOGGING,
  environment: process.env.NODE_ENV
});
