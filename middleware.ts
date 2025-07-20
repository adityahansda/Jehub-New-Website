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
  
  console.log('Middleware: Authentication system disabled - allowing all routes');
  
  // Authentication disabled - allow all routes
  // Skip all authentication checks and redirects
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
