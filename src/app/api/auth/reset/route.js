// app/api/auth/reset/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const { token, password } = await request.json();
    
    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, and a number' },
        { status: 400 }
      );
    }
    
    // Find user with reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }
    
    // Check if new password is the same as old password
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password cannot be the same as your previous password' },
        { status: 400 }
      );
    }
    
    // Update user password and clear reset token
    // The password will be automatically hashed by the User schema pre-save hook
    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Update last password change timestamp
    user.lastPasswordChange = new Date();
    
    // Save user
    await user.save();
    
    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}