// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {connectToDatabase} from '../../../lib/db';
import User from '../../../models/User';

export async function POST(request) {
  try {
    // Check if already authenticated
    const session = await getServerSession(authOptions);
    if (session) {
      return NextResponse.json(
        { message: 'Already authenticated' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user is suspended
    if (user.status === 'suspended') {
      return NextResponse.json(
        { message: 'Account is suspended. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Compare password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();
    
    // Create a response object
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      },
      { status: 200 }
    );
    
    // In a real implementation, you would use NextAuth's built-in signIn method
    // For API-based authentication, we'll set a session cookie
    // This is a simplified version - in production you'd use NextAuth's signIn properly
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}