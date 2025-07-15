import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { Models, ID } from 'appwrite';
import { createUserProfile, UserProfile, updateUserProfile } from '../lib/userService';
import { recordLoginActivity, updateLoginStreak } from '../lib/activityService';
import { getUserRole, UserRole } from '../lib/authUtils';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  userRole: UserRole | null;
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
  refreshUserRole: () => Promise<void>;
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
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
      const role = await getUserRole(userData);
      setUserRole(role);
    } catch (error: any) {
      // 401 errors are expected for anonymous users - don't log them
      if (error.code !== 401 && error.code !== 403) {
        console.error('Error checking user session:', error);
      }
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserRole = async () => {
    if (user) {
      try {
        const role = await getUserRole(user);
        setUserRole(role);
      } catch (error) {
        console.error('Error refreshing user role:', error);
      }
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
      
      // Check if user profile exists, create if missing
      try {
        const profile = await getUserProfile(userData.$id);
        if (!profile) {
          console.log('Creating missing user profile...');
          await createUserProfile({
            userId: userData.$id,
            name: userData.name,
            email: userData.email,
          });
        }
      } catch (profileError) {
        console.error('Error checking/creating user profile:', profileError);
      }
      
      setUser(userData);
      const role = await getUserRole(userData);
      setUserRole(role);
      
      // Set loading to false before recording activity
      setLoading(false);
      
      // Record login activity and update streak (don't block on this)
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
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    let userAccount = null;
    let sessionCreated = false;
    
    try {
      setError(null);
      setLoading(true);
      
      // First, clear any existing session
      try {
        await account.deleteSession('current');
      } catch (error) {
        // No existing session, continue
      }
      
      // Step 1: Create new user account
      userAccount = await account.create(ID.unique(), email, password, name);
      console.log('User account created successfully:', userAccount);
      
      // Step 2: Create session for the new user
      await account.createEmailPasswordSession(email, password);
      sessionCreated = true;
      console.log('Session created successfully');
      
      // Step 3: Get user data
      const userData = await account.get();
      
      // Step 4: Try to create user profile
      try {
        await createUserProfile({
          userId: userData.$id,
          name: userData.name,
          email: userData.email,
        });
        console.log('User profile created successfully');
      } catch (profileError: any) {
        console.error('Profile creation failed:', profileError);
        
        // Rollback: Delete the user account if profile creation fails
        try {
          console.log('Rolling back user account creation...');
          
          // Delete the current session first
          if (sessionCreated) {
            await account.deleteSession('current');
          }
          
          // Note: Appwrite doesn't provide a direct way to delete user accounts from client side
          // The account will remain in Appwrite but without a profile in our database
          // This is a limitation of Appwrite's client-side API
          
          console.log('Rollback completed');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        
        // Throw the original profile creation error
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      // Step 5: Set user state only after everything succeeds
      setUser(userData);
      const role = await getUserRole(userData);
      setUserRole(role);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 409) {
        errorMessage = 'User with this email already exists';
      } else if (error.code === 400) {
        errorMessage = 'Invalid email or password format';
      } else if (error.code === 401) {
        errorMessage = 'Registration not allowed. Please check your Appwrite project settings';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Ensure user state is cleared on any error
      setUser(null);
      setUserRole(null);
      
      throw new Error(errorMessage);
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
    let userAccount = null;
    let sessionCreated = false;
    
    try {
      setError(null);
      setLoading(true);
      
      // First, clear any existing session
      try {
        await account.deleteSession('current');
      } catch (error) {
        // No existing session, continue
      }
      
      // Step 1: Create user account
      userAccount = await account.create(ID.unique(), userData.email, userData.password, userData.name);
      console.log('User account created successfully:', userAccount);
      
      // Step 2: Create session
      await account.createEmailPasswordSession(userData.email, userData.password);
      sessionCreated = true;
      console.log('Session created successfully');
      
      // Step 3: Get user data
      const authenticatedUser = await account.get();
      
      // Step 4: Create user profile in database (this must succeed)
      try {
        await createUserProfile({
          userId: authenticatedUser.$id,
          name: userData.name,
          email: userData.email,
          college: userData.college,
          branch: userData.branch,
          semester: userData.semester,
        });
        console.log('User profile created successfully');
      } catch (profileError: any) {
        console.error('Profile creation failed:', profileError);
        
        // Rollback: Delete the user account if profile creation fails
        try {
          console.log('Rolling back user account creation...');
          
          // Delete the current session first
          if (sessionCreated) {
            await account.deleteSession('current');
          }
          
          // Note: Appwrite doesn't provide a direct way to delete user accounts from client side
          // The account will remain in Appwrite but without a profile in our database
          // This is a limitation of Appwrite's client-side API
          
          console.log('Rollback completed');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        
        // Throw the original profile creation error
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      // Step 5: Set user state only after everything succeeds
      setUser(authenticatedUser);
      const role = await getUserRole(authenticatedUser);
      setUserRole(role);
      
    } catch (error: any) {
      console.error('Registration with profile error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 409) {
        errorMessage = 'User with this email already exists';
      } else if (error.code === 400) {
        errorMessage = 'Invalid email or password format';
      } else if (error.code === 401) {
        errorMessage = 'Registration not allowed. Please check your Appwrite project settings';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Ensure user state is cleared on any error
      setUser(null);
      setUserRole(null);
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await account.deleteSession('current');
      setUser(null);
      setUserRole(null);
    } catch (error: any) {
      setError(error.message || 'Logout failed');
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    login,
    register,
    registerWithProfile,
    logout,
    loading,
    error,
    refreshUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
