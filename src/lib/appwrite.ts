import { Client, Databases, Account, Storage, Messaging } from 'appwrite';
import { appwriteConfig } from './appwriteConfig';

const client = new Client();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

// Only log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('Appwrite configuration:', {
    endpoint,
    projectId,
    hasEndpoint: !!endpoint,
    hasProjectId: !!projectId
  });
}

if (!endpoint || !projectId) {
  throw new Error(`Missing Appwrite configuration: endpoint=${endpoint}, projectId=${projectId}`);
}

client
    .setEndpoint(endpoint)
    .setProject(projectId);

// Set locale to ensure proper error messages
client.setLocale('en');

// Configure client for better authentication handling
// Set standard headers for proper API communication
client.headers['X-Requested-With'] = 'XMLHttpRequest';

// Enable cookie fallback for cross-site (third-party) cookie restrictions
// This helps when the Appwrite endpoint is on a different domain than the app
// and the browser blocks third-party cookies by default.
// @ts-ignore - Method exists in newer Appwrite SDKs
if (typeof (client as any).setCookieFallback === 'function') {
  (client as any).setCookieFallback(true);
}

// Create account instance with error handling
export const account = new Account(client);

// Wrap account methods to handle authentication errors gracefully
export const safeAccount = {
  get: async () => {
    try {
      return await account.get();
    } catch (error: any) {
      // Don't log 401 errors as they're expected when not authenticated
      if (error.code !== 401) {
        console.error('Appwrite account error:', error);
        // Log CORS related errors for debugging
        if (error.message && error.message.includes('CORS')) {
          console.error('CORS error detected. Check Appwrite platform settings for allowed origins.');
          console.error('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
        }
      }
      // Return null instead of throwing for 401 errors
      if (error.code === 401) {
        return null;
      }
      throw error;
    }
  },

  // Add method to get current session (handles 401 gracefully)
  getSession: async (sessionId: string = 'current') => {
    try {
      return await account.getSession(sessionId);
    } catch (error: any) {
      if (error.code !== 401) {
        console.error('Appwrite session error:', error);
      }
      return null;
    }
  },

  // Add method to list sessions
  listSessions: async () => {
    try {
      const result = await account.listSessions();
      // Normalize to array for callers
      if (Array.isArray(result)) return result;
      if (result && Array.isArray((result as any).sessions)) return (result as any).sessions;
      return [];
    } catch (error: any) {
      if (error.code !== 401) {
        console.error('Appwrite list sessions error:', error);
      }
      return [];
    }
  },
  
          createOAuth2Session: async (provider: any, successUrl: string, failureUrl: string) => {
    try {
      return await account.createOAuth2Session(provider, successUrl, failureUrl);
    } catch (error: any) {
      console.error('OAuth session creation error:', error);
      throw error;
    }
  },
  
          deleteSessions: async () => {
          try {
            return await account.deleteSessions();
          } catch (error: any) {
            console.error('Session deletion error:', error);
            throw error;
          }
        },

        
        deleteSession: async (sessionId: string) => {
          try {
            return await account.deleteSession(sessionId);
          } catch (error: any) {
            console.error('Session deletion error:', error);
            throw error;
          }
        },
        
        createRecovery: async (email: string, url: string) => {
          try {
            return await account.createRecovery(email, url);
          } catch (error: any) {
            console.error('Recovery creation error:', error);
            throw error;
          }
        },
        
        updateRecovery: async (userId: string, secret: string, password: string) => {
          try {
            return await account.updateRecovery(userId, secret, password);
          } catch (error: any) {
            console.error('Recovery update error:', error);
            throw error;
          }
        },
        
        updatePassword: async (password: string, oldPassword: string) => {
          try {
            return await account.updatePassword(password, oldPassword);
          } catch (error: any) {
            console.error('Password update error:', error);
            throw error;
          }
        },
        
        updateEmail: async (email: string, password: string) => {
          try {
            return await account.updateEmail(email, password);
          } catch (error: any) {
            console.error('Email update error:', error);
            throw error;
          }
        },
        
        createVerification: async (url: string) => {
          try {
            return await account.createVerification(url);
          } catch (error: any) {
            console.error('Verification creation error:', error);
            throw error;
          }
        },
        
        // Email/Password Authentication Methods
        create: async (userId: string, email: string, password: string, name?: string) => {
          try {
            return await account.create(userId, email, password, name);
          } catch (error: any) {
            console.error('Account creation error:', error);
            throw error;
          }
        },
        
        createEmailPasswordSession: async (email: string, password: string) => {
          try {
            return await account.createEmailPasswordSession(email, password);
          } catch (error: any) {
            console.error('Email/Password session creation error:', error);
            throw error;
          }
        },
        
        updateVerification: async (userId: string, secret: string) => {
          try {
            return await account.updateVerification(userId, secret);
          } catch (error: any) {
            console.error('Verification update error:', error);
            throw error;
          }
        }
};

export const databases = new Databases(client);
export const storage = new Storage(client);
export const messaging = new Messaging(client);

export default client;
