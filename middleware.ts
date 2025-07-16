import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin-dashboard',
  '/settings',
  '/admin-pdf-validation',
  '/team-dashboard',
];

// Routes that are conditionally protected (handled by component logic)
const conditionallyProtectedRoutes = [
  '/profile', // Allow access for mobile users, require auth for desktop
];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      // Redirect to login if no token found
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
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
