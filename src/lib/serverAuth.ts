import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Client, Account, Databases, Query } from 'appwrite';

// Role hierarchy for permission checking
export const roleHierarchy = {
  admin: 5,
  manager: 4,
  intern: 3,
  student: 2,
  user: 1
};

export type UserRole = 'admin' | 'manager' | 'intern' | 'student' | 'user';

export interface AuthResult {
  isAuthenticated: boolean;
  hasPermission: boolean;
  user?: any;
  userRole?: UserRole;
  error?: string;
  requiredRole?: UserRole;
}

/**
 * Server-side authentication verification
 */
export async function verifyServerAuth(
  request: NextApiRequest | NextRequest,
  requiredRole?: UserRole
): Promise<AuthResult> {
  try {
    console.log('🔐 ServerAuth: Starting verification for required role:', requiredRole);
    
    // Get session cookie
    let sessionCookie: any;
    if (typeof request.cookies.get === 'function') {
      sessionCookie = request.cookies.get('appwrite-session');
    } else {
      sessionCookie = (request as any).cookies['appwrite-session'];
    }

    const session = typeof sessionCookie === 'object' ? sessionCookie?.value : sessionCookie;
    console.log('🍪 ServerAuth: Session found:', !!session);

    if (!session) {
      return {
        isAuthenticated: false,
        hasPermission: false,
        error: 'No session found',
        requiredRole
      };
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setSession(session);

    const account = new Account(client);
    const databases = new Databases(client);

    // Get current user
    const user = await account.get();
    console.log('👤 ServerAuth: User found:', user?.email);
    
    if (!user) {
      console.log('❌ ServerAuth: No user found in session');
      return {
        isAuthenticated: false,
        hasPermission: false,
        error: 'Invalid session',
        requiredRole
      };
    }

    // Get user profile to check role
    let userRole: UserRole = 'user';
    try {
      console.log('🔍 ServerAuth: Fetching user profile for:', user.email);
      const profileResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID!,
        [Query.equal('email', user.email)]
      );
      
      console.log('📄 ServerAuth: Profile documents found:', profileResponse.documents.length);

      if (profileResponse.documents.length > 0) {
        userRole = (profileResponse.documents[0].role as UserRole) || 'user';
        console.log('🎨 ServerAuth: User role from profile:', userRole);
      } else {
        console.log('⚠️ ServerAuth: No profile found, using default role: user');
      }
    } catch (profileError) {
      console.error('🚨 ServerAuth: Error fetching user profile:', profileError);
      console.log('🔄 ServerAuth: Continuing with default role: user');
    }

    // Check role permission if required
    const hasPermission = requiredRole 
      ? checkRolePermission(userRole, requiredRole)
      : true;
      
    console.log('🔑 ServerAuth: Permission check result:', {
      userRole,
      requiredRole,
      hasPermission,
      userLevel: roleHierarchy[userRole] || 1,
      requiredLevel: requiredRole ? roleHierarchy[requiredRole] || 1 : 'none'
    });

    return {
      isAuthenticated: true,
      hasPermission,
      user,
      userRole,
      requiredRole
    };
  } catch (error) {
    console.error('Server auth verification error:', error);
    return {
      isAuthenticated: false,
      hasPermission: false,
      error: 'Authentication failed',
      requiredRole
    };
  }
}

/**
 * Check if user role has permission for required role
 */
export function checkRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = roleHierarchy[userRole] || 1;
  const requiredLevel = roleHierarchy[requiredRole] || 1;
  return userLevel >= requiredLevel;
}

/**
 * Higher-order function for protecting API routes with admin role
 */
export function withAdminProtection<T extends NextApiRequest, U extends NextApiResponse>(
  handler: (req: T & { user: any; userRole: UserRole }, res: U) => Promise<void> | void
) {
  return async (req: T, res: U) => {
    const auth = await verifyServerAuth(req, 'admin');

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!auth.hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required role: admin. Your role: ${auth.userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'admin',
        userRole: auth.userRole
      });
    }

    // Add user info to request
    (req as any).user = auth.user;
    (req as any).userRole = auth.userRole;

    return handler(req as T & { user: any; userRole: UserRole }, res);
  };
}

/**
 * Higher-order function for protecting API routes with manager role
 */
export function withManagerProtection<T extends NextApiRequest, U extends NextApiResponse>(
  handler: (req: T & { user: any; userRole: UserRole }, res: U) => Promise<void> | void
) {
  return async (req: T, res: U) => {
    const auth = await verifyServerAuth(req, 'manager');

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!auth.hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required role: manager. Your role: ${auth.userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'manager',
        userRole: auth.userRole
      });
    }

    (req as any).user = auth.user;
    (req as any).userRole = auth.userRole;

    return handler(req as T & { user: any; userRole: UserRole }, res);
  };
}

/**
 * Higher-order function for protecting API routes with intern role
 */
export function withInternProtection<T extends NextApiRequest, U extends NextApiResponse>(
  handler: (req: T & { user: any; userRole: UserRole }, res: U) => Promise<void> | void
) {
  return async (req: T, res: U) => {
    const auth = await verifyServerAuth(req, 'intern');

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!auth.hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required role: intern. Your role: ${auth.userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'intern',
        userRole: auth.userRole
      });
    }

    (req as any).user = auth.user;
    (req as any).userRole = auth.userRole;

    return handler(req as T & { user: any; userRole: UserRole }, res);
  };
}

/**
 * Higher-order function for protecting API routes with student role
 */
export function withStudentProtection<T extends NextApiRequest, U extends NextApiResponse>(
  handler: (req: T & { user: any; userRole: UserRole }, res: U) => Promise<void> | void
) {
  return async (req: T, res: U) => {
    const auth = await verifyServerAuth(req, 'student');

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!auth.hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required role: student. Your role: ${auth.userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'student',
        userRole: auth.userRole
      });
    }

    (req as any).user = auth.user;
    (req as any).userRole = auth.userRole;

    return handler(req as T & { user: any; userRole: UserRole }, res);
  };
}

/**
 * Higher-order function for protecting API routes with basic user authentication
 */
export function withUserProtection<T extends NextApiRequest, U extends NextApiResponse>(
  handler: (req: T & { user: any; userRole: UserRole }, res: U) => Promise<void> | void
) {
  return async (req: T, res: U) => {
    const auth = await verifyServerAuth(req, 'user');

    if (!auth.isAuthenticated) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
    }

    if (!auth.hasPermission) {
      return res.status(403).json({
        error: `Access denied. Required role: user. Your role: ${auth.userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: 'user',
        userRole: auth.userRole
      });
    }

    (req as any).user = auth.user;
    (req as any).userRole = auth.userRole;

    return handler(req as T & { user: any; userRole: UserRole }, res);
  };
}

/**
 * Middleware helper for Next.js middleware.ts
 */
export async function verifyMiddlewareAuth(
  request: NextRequest,
  requiredRole?: UserRole
): Promise<AuthResult> {
  return verifyServerAuth(request, requiredRole);
}
