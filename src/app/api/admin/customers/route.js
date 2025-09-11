// app/api/admin/customers/route.js
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
    
    // Check if user is authenticated and has admin privileges
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build query object
    // Include all roles except specifically excluded ones
    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add role filter (allow admins to see all roles including visitors)
    if (role && ['customer', 'tech', 'support', 'ops', 'admin', 'visitor'].includes(role)) {
      query.role = role;
    }
    
    // Execute queries
    const [customers, totalCount] = await Promise.all([
      User.find(query)
        .select('-passwordHash -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    
    // Format customers for response
    const formattedCustomers = customers.map(customer => ({
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      status: customer.status,
      emailVerifiedAt: customer.emailVerifiedAt,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString()
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch customers',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}