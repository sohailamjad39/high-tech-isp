// src/middleware.js
import { NextResponse } from 'next/server';

/**
 * Simplified middleware for Turbopack compatibility
 * The error occurs due to module resolution issues in Turbopack
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need protection
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/public/') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/coverage') ||
      pathname.startsWith('/api/plans') ||
      pathname.startsWith('/api/offices') ||
      pathname.startsWith('/api/contact')) {
    return NextResponse.next();
  }

  // Routes that should only be accessible when logged out (guest-only routes)
  const guestOnlyRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot',
    '/auth/reset',
    '/auth/verify'
  ];

  // Routes that require authentication (authenticated-only routes)
  const authenticatedOnlyRoutes = [
    '/dashboard',
    '/dashboard/',
    '/admin',
    '/admin/',
    '/tech',
    '/tech/',
    '/logout',
    '/profile',
    '/settings',
    '/billing',
    '/subscriptions',
    '/tickets',
    '/appointments',
    '/usage'
  ];

  // Check for NextAuth session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token');

  // Handle guest-only routes (auth pages)
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (sessionCookie) {
      // User is authenticated, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // Handle authenticated-only routes
  if (authenticatedOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (!sessionCookie) {
      // User is not authenticated, redirect to login with callback URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  
  // For all other routes, allow access
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     * - API routes that don't need auth protection
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth|api/coverage|api/plans|api/offices|api/contact).*)',
    
    // Include all API routes that need protection
    '/api/:path*',
    
    // Explicitly include auth, dashboard, admin, tech, and other protected routes
    '/auth/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/tech/:path*',
    '/logout',
    '/profile/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/subscriptions/:path*',
    '/tickets/:path*',
    '/appointments/:path*',
    '/usage/:path*'
  ]
};