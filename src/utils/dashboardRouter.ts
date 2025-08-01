import { UserProfile } from '../services/userService';

export type UserRole = 'student' | 'admin' | 'manager' | 'intern' | 'user';

/**
 * Determines the appropriate dashboard URL based on user role
 * @param userProfile - The user profile containing role information
 * @returns The dashboard URL path
 */
export function getDashboardUrl(userProfile: UserProfile | null): string {
  // Default to student dashboard if no profile or role
  if (!userProfile || !userProfile.role) {
    return '/dashboard';
  }

  switch (userProfile.role) {
    case 'admin':
      return '/admin-dashboard';
    case 'manager':
      return '/admin-dashboard'; // Managers also use admin dashboard but with limited access
    case 'intern':
      return '/admin-dashboard'; // Interns also use admin dashboard but with limited access
    case 'student':
    case 'user':
    default:
      return '/dashboard';
  }
}

/**
 * Gets user role priority for access control
 * Higher numbers indicate higher privileges
 */
export function getRolePriority(role: UserRole): number {
  const priorities = {
    'admin': 5,
    'manager': 4,
    'intern': 3,
    'student': 2,
    'user': 1
  };
  
  return priorities[role] || 1;
}

/**
 * Checks if user has required role or higher
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRolePriority(userRole) >= getRolePriority(requiredRole);
}
