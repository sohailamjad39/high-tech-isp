// app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Order from '@/app/models/Order';
import User from '@/app/models/User';
import ServicePlan from '@/app/models/ServicePlan';
import Addon from '@/app/models/Addon';
import Address from '@/app/models/Address';

export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin privileges
    if (!session || !['admin', 'ops'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Await params to access id property (Next.js 15+ requirement)
    const { id: orderId } = await params;
    
    // Validate ID format
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Find the order by ID with populated data
    const order = await Order.findById(orderId)
      .populate('customerId', 'name email phone lastLoginAt preferences')
      .populate('planId')
      .populate('addons.addonId')
      .populate('addressId')
      .populate('coverageAreaId', 'name coverageType status')
      .lean();
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get addons details
    const addons = order.addons.map(item => ({
      ...item.addonId.toObject(),
      priceAtPurchase: item.priceAtPurchase
    }));
    
    return NextResponse.json({
      success: true,
      order: {
        ...order,
        addons
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });
    
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch order details',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}