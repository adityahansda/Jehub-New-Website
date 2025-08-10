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
      }
      throw error;
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
        
        getSession: async (sessionId: string) => {
          try {
            return await account.getSession(sessionId);
          } catch (error: any) {
            console.error('Session retrieval error:', error);
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
        }
};

export const databases = new Databases(client);
export const storage = new Storage(client);
export const messaging = new Messaging(client);

export default client;
