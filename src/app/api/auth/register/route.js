// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import {connectToDatabase} from '../../../lib/db';
import User from '../../../models/User';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { name, email, phone, password } = body;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { 
          errors: {
            submit: 'All fields are required'
          } 
        },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          errors: {
            email: 'Please enter a valid email address'
          } 
        },
        { status: 400 }
      );
    }
    
    // Validate phone format (basic international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { 
          errors: {
            phone: 'Please enter a valid phone number'
          } 
        },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          errors: {
            password: 'Password must be at least 8 characters long'
          } 
        },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { 
          errors: {
            email: 'Email address is already registered'
          } 
        },
        { status: 409 }
      );
    }
    
    // Check if phone already exists
    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return NextResponse.json(
        { 
          errors: {
            phone: 'Phone number is already registered'
          } 
        },
        { status: 409 }
      );
    }
    
    // Create new user with default role 'visitor'
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: cleanPhone,
      passwordHash: password,
      role: 'visitor',
      status: 'active'
    });
    
    // Save user to database
    await user.save();
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Registration successful. Please log in.',
        userId: user._id
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      
      return NextResponse.json(
        { errors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { 
          errors: {
            [field]: `${field === 'email' ? 'Email' : 'Phone number'} is already registered`
          } 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        errors: {
          submit: 'Something went wrong. Please try again.'
        } 
      },
      { status: 500 }
    );
  }
}