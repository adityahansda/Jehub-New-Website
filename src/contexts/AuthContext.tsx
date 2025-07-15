import React, { createContext, useContext, useEffect, useState } from 'react';
import { account } from '../lib/appwrite';
import { Models, ID } from 'appwrite';
import { createUserProfile, UserProfile, updateUserProfile } from '../lib/userService';
import { recordLoginActivity, updateLoginStreak } from '../lib/activityService';
import { getUserRole, UserRole } from '../lib/authUtils';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  userRole: UserRole | null;
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
