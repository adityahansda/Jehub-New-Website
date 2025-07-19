import { UserRole } from '../lib/authUtils';

export const getRoleBasedRedirectPath = (userRole: UserRole | null): string => {
  if (!userRole) {
    return '/';
  }

  // Admin users go to admin dashboard
  if (userRole.isAdmin) {
    return '/admin-dashboard';
  }
  
  // Campus captains (managers) go to team dashboard
  if (userRole.isManager) {
    return '/team-dashboard';
  }
  
  // Interns go to team dashboard as well (they might have team responsibilities)
  if (userRole.isIntern) {
    return '/team-dashboard';
  }
  
  // Students and regular users go to profile page
  if (userRole.isStudent) {
    return '/profile';
  }
  
  // Default fallback to profile for any other case
  return '/profile';
};

export const getWelcomeMessage = (userRole: UserRole | null): string => {
  if (!userRole) {
    return 'Welcome!';
  }

  switch (userRole.role) {
    case 'admin':
      return 'Welcome to Admin Dashboard!';
    case 'manager':
      return 'Welcome, Campus Captain!';
    case 'intern':
      return 'Welcome to Team Dashboard!';
    case 'student':
      return 'Welcome to your Profile!';
    default:
      return 'Welcome!';
  }
};
