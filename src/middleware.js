// src/middleware.js
import { NextResponse } from "next/server";

/**
 * Simplified middleware for Turbopack compatibility
 * The error occurs due to module resolution issues in Turbopack
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/coverage") ||
    pathname.startsWith("/api/plans") ||
    pathname.startsWith("/api/offices") ||
    pathname.startsWith("/api/contact")
  ) {
    return NextResponse.next();
  }

  // Routes that should only be accessible when logged out (guest-only routes)
  const guestOnlyRoutes = [
    "/auth/login",
    "/register",
    "/auth/forgot",
    "/auth/reset",
    "/auth/verify",
  ];

  // Routes that require authentication (authenticated-only routes)
  const authenticatedOnlyRoutes = [
    "/dashboard",
    "/dashboard/",
    "/admin",
    "/admin/",
    "/tech",
    "/tech/",
    "/logout",
    "/profile",
    "/settings",
    "/billing",
    "/subscriptions",
    "/tickets",
    "/appointments",
    "/usage",
    "/plans/checkout",
  ];

  // Admin-only routes - only accessible by users with 'admin' role
  const adminOnlyRoutes = [
    "/admin",
    "/admin/",
    "/admin/dashboard",
    "/admin/customers",
    "/admin/orders",
    "/admin/subscriptions",
    "/admin/billing",
    "/admin/tickets",
    "/admin/installations",
    "/admin/technicians",
    "/admin/plans",
    "/admin/addons",
    "/admin/coverage",
    "/admin/offices",
    "/admin/network",
    "/admin/outages",
    "/admin/cms",
    "/admin/promo-codes",
    "/admin/reports",
    "/admin/audit",
    "/admin/settings",
    "/api/admin"
  ];

  // Routes that admin should NOT access (customer dashboard routes)
  const adminRestrictedRoutes = [
    "/dashboard",
    "/dashboard/",
    "/dashboard/subscription",
    "/dashboard/billing",
    "/dashboard/usage",
    "/dashboard/appointments",
    "/dashboard/tickets",
    "/dashboard/profile",
    "/dashboard/notifications"
  ];

  // Check for NextAuth session cookie
  const sessionCookie = request.cookies.get("next-auth.session-token");

  // Handle guest-only routes (auth pages)
  if (guestOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (sessionCookie) {
      // User is authenticated, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Handle authenticated-only routes
  if (authenticatedOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie) {
      // User is not authenticated, redirect to login with callback URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, verify role-based access
    try {
      // Fetch session data to get user role
      const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
          'cookie': `${sessionCookie.name}=${sessionCookie.value}`
        },
        next: { revalidate: 0 } // Don't cache
      });
      
      const sessionData = await sessionResponse.json();
      
      if (sessionResponse.ok && sessionData.user) {
        const userRole = sessionData.user.role;
        
        // Special handling for visitors trying to access dashboard
        if (userRole === 'visitor' && pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/plans', request.url));
        }
        
        // Prevent admin from accessing customer dashboard routes
        if (userRole === 'admin' && adminRestrictedRoutes.some(route => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        
        // Admin-only routes access control
        if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
          if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
          // Admin can access admin routes, continue
        }
        
        // Role-based access control for other routes
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        if (pathname.startsWith('/tech') && !['tech', 'admin', 'ops'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        if (pathname.startsWith('/dashboard') && !['customer', 'admin', 'support', 'tech', 'ops'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        // Customer-specific routes
        if (pathname.startsWith('/dashboard/billing') && !['customer', 'admin'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        if (pathname.startsWith('/dashboard/usage') && !['customer', 'admin', 'tech'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        if (pathname.startsWith('/dashboard/appointments') && !['customer', 'admin', 'tech'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        if (pathname.startsWith('/dashboard/tickets') && !['customer', 'admin', 'support'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        
        // Support staff routes
        if (pathname.startsWith('/support') && !['support', 'admin'].includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      console.error('Error verifying user role:', error);
      // If we can't verify the role, deny access
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
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
    "/((?!_next/static|_next/image|favicon.ico|public/|api/auth|api/coverage|api/plans|api/offices|api/contact).*)",

    // Include all API routes that need protection
    "/api/:path*",

    // Explicitly include auth, dashboard, admin, tech, and other protected routes
    "/auth/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/tech/:path*",
    "/logout",
    "/profile/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/subscriptions/:path*",
    "/tickets/:path*",
    "/appointments/:path*",
    "/usage/:path*",
  ],
};