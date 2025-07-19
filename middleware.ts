import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes require strict role-based protection at middleware level
// Only include routes that absolutely need server-side verification
const strictlyProtectedRoutes = {
  admin: [
    '/admin-dashboard',
    '/admin-pdf-validation',
  ],
  manager: [
    '/team-dashboard',
  ],
};

// Basic protected routes (just need authentication, not specific roles)
const basicProtectedRoutes = ['/dashboard', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for specific pages to prevent redirects
  const skipRoutes = ['/login', '/signup', '/access-denied', '/verification-failed', '/', '/about', '/blog', '/coming-soon'];
  if (skipRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Check if route requires strict role-based protection (server-side verification)
  const requiredRole = getStrictlyRequiredRole(pathname);
  
  if (requiredRole) {
    // For strictly protected routes, just check if user has a session token
    // Detailed role verification will be done on the component level with loading states
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Let the component handle detailed role verification with loading states
    return NextResponse.next();
  }
  
  // Check basic authentication for other protected routes
  const isBasicProtectedRoute = basicProtectedRoutes.some(route => pathname.startsWith(route));
  
  if (isBasicProtectedRoute) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

// Helper function to determine if route needs strict server-side role verification
function getStrictlyRequiredRole(pathname: string): 'admin' | 'manager' | null {
  for (const [role, routes] of Object.entries(strictlyProtectedRoutes)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return role as 'admin' | 'manager';
    }
  }
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - _next/data (Next.js data fetching)
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|public/).*)',
  ],
};
