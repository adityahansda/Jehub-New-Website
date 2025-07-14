import { Models } from 'appwrite';
import { getUserProfile } from './userService';

// Admin user IDs (replace with actual admin user IDs)
const ADMIN_USER_IDS = [
  // Add your admin user IDs here
  'admin_user_id_1',
  'admin_user_id_2',
];

// Admin email addresses (fallback method)
const ADMIN_EMAILS = [
  'admin@jehub.com',
  'aditya@jehub.com',
  // Add more admin emails as needed
];

export interface UserRole {
  isAdmin: boolean;
  isManager: boolean;
  isIntern: boolean;
  role: 'admin' | 'manager' | 'intern' | 'user';
}

export const getUserRole = async (user: Models.User<Models.Preferences> | null): Promise<UserRole> => {
  if (!user) {
    return {
      isAdmin: false,
      isManager: false,
      isIntern: false,
      role: 'user',
    };
  }

  // Check if user is admin by ID
  const isAdminById = ADMIN_USER_IDS.includes(user.$id);
  
  // Check if user is admin by email
  const isAdminByEmail = ADMIN_EMAILS.includes(user.email);
  
  // Check if user has admin role in their profile
  let isAdminByProfile = false;
  let isManagerByProfile = false;
  let isInternByProfile = false;
  
  try {
    const profile = await getUserProfile(user.$id);
    if (profile) {
      // Check if profile has role information (extend UserProfile interface if needed)
      const profileRole = (profile as any).role;
      isAdminByProfile = profileRole === 'admin';
      isManagerByProfile = profileRole === 'manager';
      isInternByProfile = profileRole === 'intern';
    }
  } catch (error) {
    console.error('Error fetching user profile for role check:', error);
  }

  const isAdmin = isAdminById || isAdminByEmail || isAdminByProfile;
  const isManager = isManagerByProfile || isAdmin;
  const isIntern = isInternByProfile || isManager;

  let role: 'admin' | 'manager' | 'intern' | 'user' = 'user';
  if (isAdmin) role = 'admin';
  else if (isManager) role = 'manager';
  else if (isIntern) role = 'intern';

  return {
    isAdmin,
    isManager,
    isIntern,
    role,
  };
};

export const checkUserPermission = async (
  user: Models.User<Models.Preferences> | null,
  requiredRole: 'admin' | 'manager' | 'intern' | 'user'
): Promise<boolean> => {
  if (!user) return false;

  const userRole = await getUserRole(user);
  
  const roleHierarchy = {
    admin: 4,
    manager: 3,
    intern: 2,
    user: 1,
  };

  return roleHierarchy[userRole.role] >= roleHierarchy[requiredRole];
};

export const requireAuth = (user: Models.User<Models.Preferences> | null): boolean => {
  return user !== null;
};

export const requireAdmin = async (user: Models.User<Models.Preferences> | null): Promise<boolean> => {
  return await checkUserPermission(user, 'admin');
};

export const requireManager = async (user: Models.User<Models.Preferences> | null): Promise<boolean> => {
  return await checkUserPermission(user, 'manager');
};

export const requireIntern = async (user: Models.User<Models.Preferences> | null): Promise<boolean> => {
  return await checkUserPermission(user, 'intern');
};
