import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { deviceTrackingService } from './src/services/deviceTrackingService';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: Temporarily disabled IP ban checking until collections are created
  // Check if IP is banned (for all requests except static files and some API routes)
  /*
  if (
    !pathname.startsWith('/_next/') &&
    !pathname.includes('.') &&
    !pathname.startsWith('/api/ip') && // Don't block IP checking endpoint
    !pathname.startsWith('/api/admin') // Don't block admin endpoints
  ) {
    try {
      // Get client IP
      const forwarded = request.headers.get('x-forwarded-for');
      const realIP = request.headers.get('x-real-ip');
      const cfConnectingIP = request.headers.get('cf-connecting-ip');
      
      const clientIP = cfConnectingIP || realIP || (forwarded ? forwarded.split(',')[0].trim() : request.ip || 'unknown');
      
      if (clientIP && clientIP !== 'unknown') {
        const isBanned = await deviceTrackingService.isIPBanned(clientIP);
        if (isBanned) {
          // Redirect banned IPs to access denied page
          const accessDeniedUrl = new URL('/auth/access-denied', request.url);
          accessDeniedUrl.searchParams.set('reason', 'ip_banned');
          return NextResponse.redirect(accessDeniedUrl);
        }
      }
    } catch (error) {
      // Log error but don't block request if IP checking fails
      console.error('Error checking if IP is banned:', error);
    }
  }
  */

  // Define public pages that are accessible to everyone (without authentication)
  const publicPages = [
    '/',
    '/about',
    '/notes-download',
    '/team',
    '/terms',
    '/privacy',
    '/contact',
  ];

  // Define authentication-related pages
  const authPages = [
    '/login',
    '/signup',
    '/auth/signup',
    '/auth/oauth-success',
    '/auth/oauth-failure',
    '/auth/verification-failed',
  ];

  // Define admin-only pages
  const adminPages = ['/admin', '/admin-dashboard'];

  // Define team member pages (require team role or higher)
  const teamPages = [
    '/notes-upload',
    '/notes/upload',
    '/notes-request',
    '/notes/request',
    '/telegram-members',
  ];

  // Define pages that require any authentication
  const protectedPages = [
    '/dashboard',
    '/dashboard-modern',
    '/settings',
    '/notifications',
    '/features',
    '/groups',
    '/internships',
    '/events',
    '/blog',
    '/leaderboard',
    '/join-team',
    '/counselling-updates',
    '/exam-updates',
    '/pageindex',
    '/misc',
  ];

  // Static files and API routes - allow through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Allow access to public pages
  if (
    publicPages.includes(pathname) ||
    publicPages.some((page) => pathname.startsWith(page))
  ) {
    return NextResponse.next();
  }

  // Get authentication info from cookies or headers
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'default';
  const sessionCookie = request.cookies.get('a_session_' + projectId);
  const userCookie = request.cookies.get('user');

  // Allow auth pages always
  if (authPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Check admin access for admin pages
  if (
    pathname.startsWith('/admin') ||
    adminPages.some((page) => pathname.startsWith(page))
  ) {
    const result = tryAccessControl(
      userCookie,
      ['admin', 'manager', 'intern'],
      request
    );
    if (result) return result;
  }

  // Check team access for team pages
  if (teamPages.some((page) => pathname.startsWith(page))) {
    // In development, also provide fallback if user cookie exists
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasUserCookie = userCookie && userCookie.value;

    if (isDevelopment && hasUserCookie) {
      // In development, if user has any valid cookie, allow team access as fallback
      try {
        const userData = JSON.parse(userCookie.value);
        const userRole = userData.role || 'user';

        // Allow team access for team role (case insensitive) or higher roles
        const allowedRoles = ['admin', 'manager', 'intern', 'team'];
        const hasAccess = allowedRoles.some(
          (allowedRole) =>
            allowedRole.toLowerCase() === userRole.toLowerCase()
        );

        if (!hasAccess) {
          const accessDeniedUrl = new URL('/auth/access-denied', request.url);
          return NextResponse.redirect(accessDeniedUrl);
        }
      } catch (error) {
        const accessDeniedUrl = new URL('/auth/access-denied', request.url);
        return NextResponse.redirect(accessDeniedUrl);
      }
    } else {
      // Production or no user cookie - use normal access control
      const result = tryAccessControl(
        userCookie,
        ['admin', 'manager', 'intern', 'team', 'Team'],
        request
      );
      if (result) return result;
    }
  }

  // For protected pages (including dashboard), check for authentication
  if (protectedPages.some((page) => pathname.startsWith(page))) {
    // Look for any Appwrite session cookie pattern
    const hasAppwriteSession = Array.from(request.cookies.getAll()).some(
      (cookie) => cookie.name.startsWith('a_session_')
    );

    // In development, also check for user cookie as fallback
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasUserCookie = userCookie && userCookie.value;

    // Allow access if:
    // 1. Has Appwrite session cookie, OR
    // 2. In development and has user cookie (fallback for session issues)
    const hasValidAuth =
      hasAppwriteSession || sessionCookie || (isDevelopment && hasUserCookie);

    if (!hasValidAuth) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For non-public pages, check for any authentication
  if (
    !publicPages.includes(pathname) &&
    !publicPages.some((page) => pathname.startsWith(page))
  ) {
    const hasAppwriteSession = Array.from(request.cookies.getAll()).some(
      (cookie) => cookie.name.startsWith('a_session_')
    );

    if (!hasAppwriteSession && !sessionCookie) {
      const accessDeniedUrl = new URL('/auth/access-denied', request.url);
      return NextResponse.redirect(accessDeniedUrl);
    }
  }

  return NextResponse.next();
}

function tryAccessControl(
  userCookie: any,
  allowedRoles: string[],
  request: NextRequest
) {
  try {
    if (!userCookie) {
      const accessDeniedUrl = new URL('/auth/access-denied', request.url);
      return NextResponse.redirect(accessDeniedUrl);
    }

    const userData = JSON.parse(userCookie.value);
    const userRole = userData.role || 'user';

    // Case-insensitive role checking
    const hasAccess = allowedRoles.some(
      (allowedRole) =>
        allowedRole.toLowerCase() === userRole.toLowerCase()
    );

    if (!hasAccess) {
      const accessDeniedUrl = new URL('/auth/access-denied', request.url);
      return NextResponse.redirect(accessDeniedUrl);
    }

    return null; // Allow access
  } catch (error) {
    console.error('Access control error:', error);
    const accessDeniedUrl = new URL('/auth/access-denied', request.url);
    return NextResponse.redirect(accessDeniedUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
