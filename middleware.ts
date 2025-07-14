import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin-dashboard',
  '/notes-upload',
  '/profile',
  '/settings',
  '/admin-pdf-validation',
  '/team-dashboard',
];

// Routes that should redirect authenticated users away
const authRoutes = [
  '/login',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the user has an auth session cookie
  // Appwrite uses session cookies in the format: a_session_<projectId>_<hash>
  const hasAuth = request.cookies.getAll().some(cookie => 
    cookie.name.startsWith('a_session_686d35da003a55dfcc11')
  );
  
  // Log middleware activity for debugging (can be removed in production)
  // console.log(`Middleware: ${pathname}, hasAuth: ${hasAuth}, cookies: ${request.cookies.getAll().map(c => c.name).join(', ')}`);
  
  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Handle auth routes (login, signup) - redirect if already authenticated
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (hasAuth) {
      // Check if there's a redirect parameter to send user to original destination
      const redirectUrl = request.nextUrl.searchParams.get('redirect');
      if (redirectUrl) {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
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
