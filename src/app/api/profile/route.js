// app/api/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';

export async function GET(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find user - ensure we're using the correct session structure
    const user = await User.findById(session.user?.id || session.user?.email).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Convert to plain object and format dates
    const userObj = user.toObject();
    
    // Ensure all date fields are properly formatted
    userObj.createdAt = user.createdAt?.toISOString();
    userObj.updatedAt = user.updatedAt?.toISOString();
    
    if (userObj.emailVerifiedAt) {
      userObj.emailVerifiedAt = user.emailVerifiedAt.toISOString();
    }
    
    if (userObj.lastLoginAt) {
      userObj.lastLoginAt = user.lastLoginAt.toISOString();
    }
    
    return NextResponse.json({
      success: true,
      user: userObj
    });
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}