// app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Order from '@/app/models/Order';
import User from '@/app/models/User';
import ServicePlan from '@/app/models/ServicePlan';

export async function GET(request) {
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const planId = searchParams.get('planId');
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build query object
    let query = {};
    
    // Add search filter (search by order ID, customer name, email, phone, plan name)
    if (search) {
      // First find matching customers
      const customerMatches = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const customerIds = customerMatches.map(c => c._id);
      
      // Find matching plans
      const planMatches = await ServicePlan.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const planIds = planMatches.map(p => p._id);
      
      // Combine all possible matches
      query.$or = [
        { _id: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerIds } },
        { planId: { $in: planIds } }
      ];
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Add plan filter
    if (planId) {
      query.planId = planId;
    }
    
    // Add customer filter
    if (customerId) {
      query.customerId = customerId;
    }
    
    // Execute queries with population
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('customerId', 'name email phone')
        .populate('planId', 'name speedMbps.priceMonthly priceYearly currency')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);
    
    // Format orders for response
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      orderId: order._id.toString().substring(0, 8).toUpperCase(), // Short ID for display
      customerId: order.customerId?._id?.toString() || null,
      customerName: order.customerId?.name || 'Unknown',
      customerEmail: order.customerId?.email || 'Unknown',
      planId: order.planId?._id?.toString() || null,
      planName: order.planId?.name || 'Unknown',
      downloadSpeed: order.planId?.speedMbps?.download || 0,
      uploadSpeed: order.planId?.speedMbps?.upload || 0,
      monthlyPrice: order.planId?.priceMonthly || 0,
      yearlyPrice: order.planId?.priceYearly || 0,
      currency: order.planId?.currency || 'USD',
      status: order.status,
      paymentStatus: order.paymentStatus,
      totals: order.totals,
      installationSlot: order.installationSlot,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      fetchedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}