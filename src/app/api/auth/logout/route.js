// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      // If no session, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Create response with cleared cookies
    const response = NextResponse.redirect(new URL('/logout/confirmed', request.url));
    
    // Clear the NextAuth session cookie
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    });
    
    // Clear the CSRF token if it exists
    response.cookies.set('next-auth.csrf-token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}