import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/auth';
import { userProfileService, UserProfile } from '../services/userProfile';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // User profile from database (if available)
  isVerified: boolean; // Whether user is verified in database
  loading: boolean;
  profileLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>; // Refresh user profile data
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // If user is authenticated, fetch their profile from database
      if (currentUser && currentUser.email) {
        await fetchUserProfile(currentUser.email);
      }
    } catch (error) {
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (email: string) => {
    try {
      setProfileLoading(true);
      const profile = await userProfileService.getUserProfile(email);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };


  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
      // OAuth redirects to success/failure URL, so no need to set user here
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      
      // Also refresh the database profile
      if (currentUser && currentUser.email) {
        await fetchUserProfile(currentUser.email);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      setUser(null);
      setUserProfile(null);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    isVerified: userProfile?.isVerified ?? false,
    loading,
    profileLoading,
    loginWithGoogle,
    logout,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
