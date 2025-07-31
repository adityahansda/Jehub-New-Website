import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle old note preview URLs (e.g., /notes/preview/noteId)
  if (pathname.startsWith('/notes/preview/')) {
    const segments = pathname.split('/')
    const noteId = segments[3] // Extract the ID from the URL
    
    // Check if it's just an ID (not a slug)
    if (noteId && !noteId.includes('--') && noteId.length > 10) {
      // This is likely a direct ID access, keep it for now
      // You can redirect to a "generating SEO URL" page if needed
      return NextResponse.next()
    }
  }

  return NextResponse.next()
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
}
