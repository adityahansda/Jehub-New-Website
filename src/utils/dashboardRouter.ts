// Dashboard routing utilities
// This utility helps determine the appropriate dashboard URL based on user role

export interface UserProfile {
  role?: string;
  id?: string;
  [key: string]: any;
}

/**
 * Get the appropriate dashboard URL based on user profile
 * @param userProfile - User profile object with role information
 * @returns Dashboard URL string
 */
export function getDashboardUrl(userProfile?: UserProfile): string {
  if (!userProfile) {
    return '/dashboard';
  }

  const role = (userProfile.role || 'user').toLowerCase();
  
  switch (role) {
    case 'admin':
    case 'manager':
    case 'intern':
      return '/admin';
    case 'student':
    case 'user':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user has required role for accessing a resource
 * @param userProfile - User profile object with role information
 * @param requiredRoles - Array of required roles
 * @returns Boolean indicating if user has required role
 */
export function hasRequiredRole(userProfile?: UserProfile, requiredRoles: string[] = []): boolean {
  if (!userProfile || requiredRoles.length === 0) {
    return true;
  }

  const userRole = (userProfile.role || 'user').toLowerCase();
  return requiredRoles.map(role => role.toLowerCase()).includes(userRole);
}

/**
 * Get user role display name
 * @param userProfile - User profile object with role information
 * @returns Formatted role display name
 */
export function getRoleDisplayName(userProfile?: UserProfile): string {
  if (!userProfile) {
    return 'User';
  }

  const role = userProfile.role || 'user';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
