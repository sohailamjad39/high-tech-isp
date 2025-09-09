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

export async function PUT(request) {
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
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findById(session.user?.id || session.user?.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user fields
    user.name = body.name;
    
    if (body.email && body.email !== user.email) {
      user.email = body.email;
      user.emailVerified = false;
      user.emailVerifiedAt = null;
    }
    
    if (body.phone !== undefined) {
      user.phone = body.phone;
    }
    
    // Update preferences if provided
    if (body.preferences) {
      if (!user.preferences) {
        user.preferences = {};
      }
      
      if (body.preferences.notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...body.preferences.notifications
        };
      }
      
      if (body.preferences.language) {
        user.preferences.language = body.preferences.language;
      }
    }
    
    // Update last updated timestamp
    user.updatedAt = new Date();
    
    // Save updated user
    await user.save();
    
    // Convert to plain object and format dates for response
    const userObj = user.toObject();
    
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
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}