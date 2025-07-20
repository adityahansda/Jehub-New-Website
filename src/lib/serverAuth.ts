import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import { Client, Account } from 'appwrite';
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
  try {
    // Handle NextRequest (middleware)
    if ('cookies' in request && request.cookies) {
      const cookies = request.cookies as any; // Type assertion for Next.js cookies
      if (cookies && typeof cookies.get === 'function') {
        const sessionCookie = cookies.get('session');
        return sessionCookie?.value || null;
      }
    }

    // Handle NextApiRequest (API routes)
    if ('headers' in request && request.headers) {
      const headers = request.headers as any; // Type assertion for headers
      const cookieHeader = headers.cookie;
      if (typeof cookieHeader === 'string') {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>);
        
        return cookies.session || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting session from request:', error);
    return null;
  }
};

// Verify user session and role on server-side - DISABLED
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

  console.log('ServerAuth: Authentication system disabled - returning default result');
  return defaultResult;
};

// API route wrapper for role-based protection - DISABLED
export const withRoleProtection = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>,
  requiredRole: 'admin' | 'manager' | 'intern' | 'student' | 'user'
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('ServerAuth: Authentication disabled - denying protected route access');
    return res.status(503).json({
      error: 'Authentication system is currently disabled',
      code: 'AUTH_DISABLED',
    });
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
