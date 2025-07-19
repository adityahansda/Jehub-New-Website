import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { account as serverAccount } from './appwrite-server';
import { Models } from 'appwrite';
import { getUserRole, UserRole } from './authUtils';

// Interface for server-side session verification
export interface ServerAuthResult {
  user: Models.User<Models.Preferences> | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  hasPermission: boolean;
}

// Extract session token from request
export const getSessionFromRequest = (request: NextRequest | NextApiRequest): string | null => {
  // Try to get session from cookies
  const cookieHeader = 'cookies' in request ? request.cookies : request.headers.cookie;
  
  if (!cookieHeader) return null;

  // Handle NextRequest (middleware)
  if ('get' in cookieHeader && typeof cookieHeader.get === 'function') {
    return cookieHeader.get('session')?.value || null;
  }

  // Handle NextApiRequest (API routes)
  if (typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies.session || null;
  }

  return null;
};

// Verify user session and role on server-side
export const verifyServerAuth = async (
  request: NextRequest | NextApiRequest,
  requiredRole?: 'admin' | 'manager' | 'intern' | 'student' | 'user'
): Promise<ServerAuthResult> => {
  const defaultResult: ServerAuthResult = {
    user: null,
    userRole: null,
    isAuthenticated: false,
    hasPermission: false,
  };

  try {
    const sessionToken = getSessionFromRequest(request);
    
    if (!sessionToken) {
      return defaultResult;
    }

    // Create a new account client instance to avoid conflicts
    const { account: serverAccount } = await import('./appwrite-server');
    
    // Set the session for server account
    serverAccount.setSession(sessionToken);
    
    // Get current user
    const user = await serverAccount.get();
    
    if (!user) {
      return defaultResult;
    }

    // Get user role
    const userRole = await getUserRole(user);

    const result: ServerAuthResult = {
      user,
      userRole,
      isAuthenticated: true,
      hasPermission: true, // Default to true if no role requirement
    };

    // Check role-based permission if required
    if (requiredRole) {
      const roleHierarchy = {
        admin: 5,
        manager: 4,
        intern: 3,
        student: 2,
        user: 1,
      };

      const userRoleLevel = roleHierarchy[userRole.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      result.hasPermission = userRoleLevel >= requiredRoleLevel;
    }

    return result;
  } catch (error) {
    console.error('Server auth verification error:', error);
    return defaultResult;
  }
};

// API route wrapper for role-based protection
export const withRoleProtection = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
  requiredRole: 'admin' | 'manager' | 'intern' | 'student' | 'user'
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const auth = await verifyServerAuth(req, requiredRole);

      if (!auth.isAuthenticated) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHENTICATED',
        });
      }

      if (!auth.hasPermission) {
        return res.status(403).json({
          error: `Access denied. Required role: ${requiredRole}. Your role: ${auth.userRole?.role}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRole,
          userRole: auth.userRole?.role,
        });
      }

      // Attach user info to request for use in handler
      (req as any).user = auth.user;
      (req as any).userRole = auth.userRole;

      return handler(req, res);
    } catch (error) {
      console.error('Role protection middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during authentication',
        code: 'AUTH_SERVER_ERROR',
      });
    }
  };
};

// Helper function to create role-specific API handlers
export const createRoleHandler = (
  requiredRole: 'admin' | 'manager' | 'intern' | 'student' | 'user'
) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>) => {
    return withRoleProtection(handler, requiredRole);
  };
};

// Pre-configured handlers for common roles
export const withAdminProtection = createRoleHandler('admin');
export const withManagerProtection = createRoleHandler('manager');
export const withInternProtection = createRoleHandler('intern');
export const withStudentProtection = createRoleHandler('student');
export const withUserProtection = createRoleHandler('user');
