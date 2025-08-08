import { UserProfile } from '../services/userService';

export type UserRole = 'student' | 'admin' | 'manager' | 'intern' | 'team' | 'betatest' | 'user';

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

  // Convert role to lowercase for case-insensitive comparison
  const role = userProfile.role.toLowerCase();

  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'manager':
      return '/admin-dashboard'; // Managers also use admin dashboard but with limited access
    case 'intern':
      return '/admin-dashboard'; // Interns also use admin dashboard but with limited access
    case 'team':
      return '/admin-dashboard'; // Team members also use admin dashboard but with limited access
    case 'betatest':
      return '/dashboard'; // Beta testers use regular dashboard but have access to all pages
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
    'admin': 6,
    'manager': 5,
    'team': 4,
    'intern': 3,
    'betatest': 3, // Same level as intern for beta access
    'student': 2,
    'user': 1
  };
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedRole = role.toLowerCase() as UserRole;
  return priorities[normalizedRole] || 1;
}

/**
 * Checks if user has required role or higher
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRolePriority(userRole) >= getRolePriority(requiredRole);
}
