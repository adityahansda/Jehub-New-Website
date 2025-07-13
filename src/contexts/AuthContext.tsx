import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { Models, ID } from 'appwrite';
import { createUserProfile, UserProfile, updateUserProfile } from '../lib/userService';
import { recordLoginActivity, updateLoginStreak } from '../lib/activityService';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  registerWithProfile: (userData: {
    email: string;
    password: string;
    name: string;
    college?: string;
    branch?: string;
    semester?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if there's already an active session
      try {
        const currentUser = await account.get();
        if (currentUser) {
          // User is already logged in, delete current session first
          await account.deleteSession('current');
        }
      } catch (error) {
        // No active session, continue with login
      }
      
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser(userData);
      
      // Record login activity and update streak
      try {
        await recordLoginActivity(userData.$id);
        await updateLoginStreak(userData.$id);
        
        // Update last login date in user profile
        await updateUserProfile(userData.$id, {
          lastLoginDate: new Date().toISOString(),
        });
      } catch (activityError) {
        console.error('Error recording login activity:', activityError);
        // Don't throw error as login was successful
      }
    } catch (error: any) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser(userData);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithProfile = async (userData: {
    email: string;
    password: string;
    name: string;
    college?: string;
    branch?: string;
    semester?: string;
  }) => {
    try {
      setError(null);
      setLoading(true);
      
      // Create user account
      const userAccount = await account.create(ID.unique(), userData.email, userData.password, userData.name);
      
      // Create session
      await account.createEmailPasswordSession(userData.email, userData.password);
      
      // Get user data
      const authenticatedUser = await account.get();
      setUser(authenticatedUser);
      
      // Create user profile in database
      await createUserProfile({
        userId: authenticatedUser.$id,
        name: userData.name,
        email: userData.email,
        college: userData.college,
        branch: userData.branch,
        semester: userData.semester,
      });
      
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await account.deleteSession('current');
      setUser(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    registerWithProfile,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
