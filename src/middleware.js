// src/middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Fixed middleware for Vercel deployment with Next.js 15
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and public API routes
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

  // Routes that should only be accessible when logged out
  const guestOnlyRoutes = [
    "/auth/login",
    "/register",
    "/auth/forgot",
    "/auth/reset",
    "/auth/verify",
  ];

  // Routes that require authentication
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

  // Admin-only routes
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

  // Routes that admin should NOT access
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

  try {
    // Use next-auth/jwt to decode the token directly
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Handle guest-only routes
    if (guestOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (token) {
        // User is authenticated, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    // Handle authenticated-only routes
    if (authenticatedOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (!token) {
        // User is not authenticated, redirect to login
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // User is authenticated, verify role-based access
      const userRole = token.role;
      
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

    // For all other routes, allow access
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // If there's an error processing the token, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

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
  // Opt out of static generation for middleware
  unstable_allowDynamic: [
    '/node_modules/next-auth/**',
    '/node_modules/jsonwebtoken/**',
  ],
};