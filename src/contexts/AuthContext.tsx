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
  refreshAuth: () => Promise<void>;
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
      // Authentication disabled - always return null user
      console.log('AuthContext: Authentication system disabled');
      setUser(null);
      setUserRole(null);
    } catch (error: any) {
      console.log('AuthContext: Authentication disabled, ignoring error');
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserRole = async () => {
    console.log('AuthContext: Authentication disabled - refreshUserRole called');
    // Always set null since authentication is disabled
    setUserRole(null);
  };

  const refreshAuth = async () => {
    console.log('AuthContext: Authentication disabled - refreshAuth called');
    setUser(null);
    setUserRole(null);
  };

  const logout = async () => {
    console.log('AuthContext: Authentication disabled - logout called');
    setError(null);
    setUser(null);
    setUserRole(null);
    // No error thrown for logout
  };

  const value = {
    user,
    userRole,
    logout,
    loading,
    error,
    refreshUserRole,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
