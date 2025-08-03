import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '../services/auth';
import { userService, UserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isVerified: boolean; // New field to track database verification
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordRecovery: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  forceRefreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100); // Small delay to prevent conflicts with OAuth flow
    
    return () => clearTimeout(timer);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        // Ensure registration is verified in the database
        const isRegistered = await authService.isUserRegistered(currentUser.email);
        setIsVerified(isRegistered);
        
        if (isRegistered) {
          const profile = await userService.getUserProfile(currentUser.email);
          setUserProfile(profile);
          
          // Set user cookie if authenticated but cookie missing (for middleware)
          if (typeof window !== 'undefined' && profile) {
            const userData = {
              $id: currentUser.$id,
              name: currentUser.name,
              email: currentUser.email,
              role: profile.role
            };
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
          }
        } else {
          // Keep user data but clear profile and cookie - they need to complete registration
          setUserProfile(null);
          console.log('User not verified in database, keeping OAuth data but clearing profile');
          // Clear user cookie if not verified
          if (typeof window !== 'undefined') {
            document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
      }
    } catch (error) {
      console.log('No active session');
      setUser(null);
      setUserProfile(null);
      setIsVerified(false);
      // Clear user cookie if no session
      if (typeof window !== 'undefined') {
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await userService.getUserProfile(user.email);
        setUserProfile(profile);
        
        // Update isVerified status
        const isRegistered = await authService.isUserRegistered(user.email);
        setIsVerified(isRegistered);
        
        // Update cookie if user is verified
        if (isRegistered && profile && typeof window !== 'undefined') {
          const userData = {
            $id: user.$id,
            name: user.name,
            email: user.email,
            role: profile.role
          };
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
        }
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  // Force complete refresh of auth state
  const forceRefreshAuth = async () => {
    setLoading(true);
    try {
      await checkAuthStatus();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      // Fetch user profile after login
      const profile = await userService.getUserProfile(loggedInUser.email);
      setUserProfile(profile);
      
      // Set user cookie for middleware after successful login
      if (typeof window !== 'undefined' && loggedInUser && profile) {
        const userData = {
          $id: loggedInUser.$id,
          name: loggedInUser.name,
          email: loggedInUser.email,
          role: profile.role
        };
        document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Lax`;
        console.log('Set user cookie after login');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const newUser = await authService.register(email, password, name);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await authService.loginWithGoogle();
      // Note: After OAuth redirect, the user state will be updated in the OAuth success page
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
      setIsVerified(false);
      
      // Clear user cookie on logout
      if (typeof window !== 'undefined') {
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        console.log('Cleared user cookie on logout');
      }
    } catch (error) {
      throw error;
    }
  };

  const sendPasswordRecovery = async (email: string) => {
    try {
      await authService.sendPasswordRecovery(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isVerified,
    login,
    register,
    loginWithGoogle,
    logout,
    sendPasswordRecovery,
    refreshUserProfile,
    forceRefreshAuth,
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
