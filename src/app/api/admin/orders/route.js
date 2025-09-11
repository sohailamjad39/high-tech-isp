// app/api/admin/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Order from '@/app/models/Order';
import User from '@/app/models/User';
import ServicePlan from '@/app/models/ServicePlan';

// Helper function for case-insensitive string matching
function matchesSearch(text, search) {
  if (!text || !search) return false;
  return text.toString().toLowerCase().includes(search.toLowerCase());
}

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
    
    // Build base query object
    let query = {};
    
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
    
    // Sort by createdAt descending (newest first)
    const sort = { createdAt: -1 };
    
    // For non-search requests, use direct database queries with pagination
    if (!search) {
      const [orders, totalCount] = await Promise.all([
        Order.find(query)
          .populate('customerId', 'name email phone')
          .populate('planId', 'name speedMbps priceMonthly priceYearly currency')
          .sort(sort)
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
    }
    
    // For search, we need to handle different types of searches
    // First, find matching customers using MongoDB regex (only for text fields)
    const customerMatches = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }).select('_id name email phone');
    
    const customerIds = customerMatches.map(c => c._id.toString());
    
    // Find matching plans
    const planMatches = await ServicePlan.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id name');
    
    const planIds = planMatches.map(p => p._id.toString());
    
    // Initialize the order query with proper structure
    const orderQuery = {
      $and: [
        query, // Apply other filters (status, planId, customerId)
        {
          $or: [] // Initialize as empty array
        }
      ]
    };
    
    // Add customer matches to the $or array if available
    if (customerIds.length > 0) {
      orderQuery.$and[1].$or.push({ customerId: { $in: customerIds } });
    }
    
    // Add plan matches to the $or array if available
    if (planIds.length > 0) {
      orderQuery.$and[1].$or.push({ planId: { $in: planIds } });
    }
    
    // For order ID search, we need to be careful about ObjectId casting
    // Instead of trying to match partial IDs in the database query,
    // we'll fetch potential matches and filter client-side
    
    // Execute the query to get potential matches
    let allOrders = [];
    
    try {
      // Try to find orders with exact or partial ID matches
      // We'll use a regex search on the _id field for partial matching
      const idQuery = {
        _id: { $regex: search, $options: 'i' }
      };
      
      // Combine with our existing query structure
      if (orderQuery.$and[1].$or.length > 0) {
        // If we have other search conditions, add the ID condition
        orderQuery.$and[1].$or.push(idQuery);
        
        allOrders = await Order.find(orderQuery)
          .populate('customerId', 'name email phone')
          .populate('planId', 'name speedMbps priceMonthly priceYearly currency')
          .sort(sort);
      } else {
        // If no other conditions, just search by ID
        allOrders = await Order.find({ ...query, ...idQuery })
          .populate('customerId', 'name email phone')
          .populate('planId', 'name speedMbps priceMonthly priceYearly currency')
          .sort(sort);
      }
    } catch (error) {
      // If there's an error with the ObjectId cast, fall back to fetching all orders
      // and filtering client-side
      console.warn('Error with order ID search, falling back to full scan:', error);
      
      allOrders = await Order.find(query)
        .populate('customerId', 'name email phone')
        .populate('planId', 'name speedMbps priceMonthly priceYearly currency')
        .sort(sort);
    }
    
    // Apply additional client-side filtering for comprehensive search
    const filteredOrders = allOrders.filter(order => {
      // Check if order ID matches (substring match on the full ID)
      if (order._id.toString().toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      
      // Check if customer data matches
      if (order.customerId) {
        if (matchesSearch(order.customerId.name, search)) return true;
        if (matchesSearch(order.customerId.email, search)) return true;
        if (matchesSearch(order.customerId.phone, search)) return true;
      }
      
      // Check if plan data matches
      if (order.planId) {
        if (matchesSearch(order.planId.name, search)) return true;
      }
      
      return false;
    });
    
    // Apply pagination to filtered results
    const paginatedOrders = filteredOrders.slice(skip, skip + limit);
    
    // Format orders for response
    const formattedOrders = paginatedOrders.map(order => ({
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
    const totalCount = filteredOrders.length;
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