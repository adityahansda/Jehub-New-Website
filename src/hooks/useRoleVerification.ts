import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

export type UserRole = 'admin' | 'manager' | 'intern' | 'student' | 'user';

export interface RoleHierarchy {
  admin: number;
  manager: number;
  intern: number;
  student: number;
  user: number;
}

export const roleHierarchy: RoleHierarchy = {
  admin: 5,
  manager: 4,
  intern: 3,
  student: 2,
  user: 1
};

export interface RoleVerificationResult {
  userRole: UserRole | null;
  hasAccess: (requiredRole: UserRole) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isIntern: boolean;
  isStudent: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for user role verification and permission checking
 * 
 * @returns RoleVerificationResult object containing user role info and permission methods
 * 
 * @example
 * ```tsx
 * const { userRole, hasAccess, isAdmin, loading } = useRoleVerification();
 * 
 * if (loading) return <div>Loading...</div>;
 * 
 * if (isAdmin) {
 *   return <AdminPanel />;
 * }
 * 
 * if (hasAccess('manager')) {
 *   return <ManagerDashboard />;
 * }
 * 
 * return <UserDashboard />;
 * ```
 */
export const useRoleVerification = (): RoleVerificationResult => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (authLoading) return;

      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First try to get role from userProfile context
        if (userProfile?.role) {
          setUserRole(userProfile.role as UserRole);
          setLoading(false);
          return;
        }

        // Fallback: fetch user profile to get role
        const profile = await userService.getUserProfile(user.email);
        const currentRole = (profile?.role || 'user') as UserRole;
        setUserRole(currentRole);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError('Failed to verify user role');
        setUserRole('user'); // Default fallback role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, userProfile, authLoading]);

  // Permission checking function
  const hasAccess = (requiredRole: UserRole): boolean => {
    if (!userRole) return false;
    
    const userRoleLevel = roleHierarchy[userRole] || 1;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 1;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  return {
    userRole,
    hasAccess,
    isAdmin: userRole === 'admin',
    isManager: hasAccess('manager'),
    isIntern: hasAccess('intern'),
    isStudent: hasAccess('student'),
    loading,
    error
  };
};

/**
 * Utility function to check if a user role can access a specific feature
 * 
 * @param userRole - Current user's role
 * @param requiredRole - Required role for access
 * @returns boolean indicating if access is granted
 */
export const canAccess = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  
  const userRoleLevel = roleHierarchy[userRole] || 1;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 1;
  
  return userRoleLevel >= requiredRoleLevel;
};

/**
 * Get user role display name with proper formatting
 * 
 * @param role - User role
 * @returns Formatted role display name
 */
export const getRoleDisplayName = (role: UserRole | null): string => {
  if (!role) return 'Unknown';
  
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    intern: 'Intern',
    student: 'Student',
    user: 'User'
  };
  
  return roleNames[role] || 'Unknown';
};

/**
 * Get role badge color class for UI styling
 * 
 * @param role - User role
 * @returns CSS class string for role badge styling
 */
export const getRoleBadgeClass = (role: UserRole | null): string => {
  const roleClasses: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    intern: 'bg-orange-100 text-orange-800 border-orange-200',
    student: 'bg-green-100 text-green-800 border-green-200',
    user: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return role ? roleClasses[role] : 'bg-gray-100 text-gray-800 border-gray-200';
};
