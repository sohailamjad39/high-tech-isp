// app/api/auth/forgot/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const { email } = await request.json();
    
    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      status: 'active' 
    });
    
    // If user doesn't exist, return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset?token=${resetToken}`;
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'HIGH TECH ISP <no-reply@high-tech-isp.com>',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2f83aa 0%, #3f88cc 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">HIGH TECH ISP</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #2f83aa 0%, #3f88cc 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;" />
            
            <p style="color: #999; font-size: 12px;">
              If the button above doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="color: #2f83aa;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 5px 0;">HIGH TECH ISP</p>
            <p style="margin: 5px 0;">123 Tech Avenue, Innovation City, IC 12345</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} HIGH TECH ISP. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json(
      { message: 'Password reset instructions sent if account exists' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email. Please try again later.' },
      { status: 500 }
    );
  }
}