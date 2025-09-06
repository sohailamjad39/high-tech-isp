// app/api/auth/session/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * API endpoint to get current session
 * Used by client components to check authentication status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      user: session?.user || null,
      isAuthenticated: !!session
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}