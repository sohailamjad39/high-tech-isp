// app/api/dashboard/billing/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Order from '@/app/models/Order';
import ServicePlan from '@/app/models/ServicePlan';
import Subscription from '@/app/models/Subscription';

export async function GET(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a customer
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Find all orders for the user
    const orders = await Order.find({ 
      customerId: session.user.id 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Get all subscriptions for the user to get plan details
    const subscriptions = await Subscription.find({ 
      customerId: session.user.id 
    }).populate('planId');
    
    // Create a map of subscription plan details
    const subscriptionMap = {};
    subscriptions.forEach(sub => {
      subscriptionMap[sub._id.toString()] = sub;
    });
    
    // Transform orders into billing records
    const billingRecords = await Promise.all(orders.map(async (order) => {
      // Find the plan details
      let planName = 'Unknown Plan';
      let planSpeed = 'N/A';
      
      if (order.planId) {
        const plan = await ServicePlan.findById(order.planId);
        if (plan) {
          planName = plan.name;
          planSpeed = `${plan.speedMbps.download} Mbps`;
        }
      }
      
      // Determine transaction type
      let transactionType = 'New Subscription';
      if (order.metadata?.changeType) {
        transactionType = order.metadata.changeType === 'upgrade' ? 'Plan Upgrade' : 
                         order.metadata.changeType === 'downgrade' ? 'Plan Downgrade' : 
                         'Plan Change';
      } else if (order.setupFee > 0) {
        transactionType = 'Setup Fee';
      }
      
      return {
        id: order._id.toString(),
        date: order.createdAt.toISOString(),
        description: `${transactionType} - ${planName}`,
        plan: planName,
        speed: planSpeed,
        amount: order.totals.grandTotal,
        type: transactionType,
        status: order.status,
        invoiceNumber: `INV-${order._id.toString().slice(-6).toUpperCase()}`,
        paymentMethod: order.gateway || 'Unknown'
      };
    }));
    
    // Get total count for pagination
    const totalCount = await Order.countDocuments({ customerId: session.user.id });
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      bills: billingRecords,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch billing data',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}