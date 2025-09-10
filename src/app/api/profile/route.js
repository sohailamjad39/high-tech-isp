// app/api/profile/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';
import Address from '@/app/models/Address';

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
    
    // Get user's address if it exists
    let address = null;
    if (user.addressId) {
      address = await Address.findById(user.addressId);
    }
    
    // Convert to plain object and format dates
    const userObj = user.toObject();
    
    // Add address to user object if it exists
    if (address) {
      userObj.address = address.toObject();
      // Remove MongoDB internal fields from address
      delete userObj.address._id;
      delete userObj.address.__v;
    }
    
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
    
    // Update address if provided
    if (body.address) {
      // Find or create address
      let address;
      if (user.addressId) {
        // Update existing address
        address = await Address.findById(user.addressId);
        if (address) {
          // Update address fields
          address.label = body.address.label;
          address.line1 = body.address.line1;
          address.line2 = body.address.line2;
          address.city = body.address.city;
          address.state = body.address.state;
          address.postalCode = body.address.postalCode;
          address.country = body.address.country;
          address.verified = body.address.verified || address.verified;
          address.verificationMethod = body.address.verificationMethod || address.verificationMethod;
          address.verificationDate = body.address.verificationDate || address.verificationDate;
          
          await address.save();
        }
      } else {
        // Create new address
        address = new Address({
          label: body.address.label,
          line1: body.address.line1,
          line2: body.address.line2,
          city: body.address.city,
          state: body.address.state,
          postalCode: body.address.postalCode,
          country: body.address.country,
          isPrimary: true
        });
        
        // Save the address first
        await address.save();
        
        // Link address to user only after saving
        user.addressId = address._id;
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
    
    // Include address in response
    if (user.addressId) {
      const address = await Address.findById(user.addressId);
      if (address) {
        userObj.address = address.toObject();
        delete userObj.address._id;
        delete userObj.address.__v;
      }
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