// app/api/success/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';
import ServicePlan from '@/app/models/ServicePlan';
import Order from '@/app/models/Order';
import Subscription from '@/app/models/Subscription';

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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const planId = searchParams.get('plan_id');
    const userId = searchParams.get('user_id');
    const setupFee = parseFloat(searchParams.get('setup_fee') || '0');
    
    if (!sessionId || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Verify the user ID matches the session
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Get Stripe session to verify payment status
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
    
    // Find the user and plan
    const user = await User.findById(userId);
    const plan = await ServicePlan.findById(planId);
    
    if (!user || !plan) {
      return NextResponse.json(
        { error: 'User or plan not found' },
        { status: 404 }
      );
    }
    
    // Check if order already exists
    const existingOrder = await Order.findOne({ gatewaySessionId: sessionId });
    if (existingOrder) {
      // Return existing order data
      return NextResponse.json({
        success: true,
        order: {
          id: existingOrder._id.toString(),
          planName: plan.name,
          total: plan.priceMonthly + setupFee,
          status: existingOrder.status,
          createdAt: existingOrder.createdAt
        }
      });
    }
    
    // Calculate totals
    const grandTotal = plan.priceMonthly + setupFee;
    
    // Create order with default installation slot
    const order = await Order.create({
      customerId: userId,
      planId: planId,
      addressId: null,
      installationSlot: {
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        end: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)   // 8 days from now
      },
      status: 'paid',
      paymentStatus: 'succeeded',
      totals: {
        subtotal: plan.priceMonthly,
        tax: 0,
        discount: 0,
        grandTotal: grandTotal
      },
      gateway: 'stripe',
      gatewaySessionId: sessionId
    });
    
    // Create subscription if we have subscription details
    if (stripeSession.subscription) {
      try {
        // Add a small delay to ensure Stripe has processed the subscription
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscription = await stripe.subscriptions.retrieve(stripeSession.subscription);
        
        // Fix: Convert Unix timestamps to valid Date objects
        let currentPeriodStart = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
        let currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Validate dates
        if (isNaN(currentPeriodStart.getTime())) {
          console.warn('Invalid currentPeriodStart, using current date');
          currentPeriodStart = new Date();
        }
        
        if (isNaN(currentPeriodEnd.getTime())) {
          console.warn('Invalid currentPeriodEnd, using 30 days from now');
          currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
        
        await Subscription.create({
          customerId: userId,
          planId: planId,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: currentPeriodStart,
          currentPeriodEnd: currentPeriodEnd,
          gateway: 'stripe',
          gatewayCustomerId: subscription.customer,
          gatewaySubscriptionId: subscription.id
        });
        
        console.log('Subscription created successfully');
      } catch (subError) {
        console.error('Error creating subscription:', subError);
        // Continue processing even if subscription creation fails
      }
    }
    
    // Update user role if needed
    if (user.role === 'visitor') {
      user.role = 'customer';
      await user.save();
      
      // Log that we've updated the user role
      console.log(`User ${userId} role updated from visitor to customer`);
    }
    
    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        planName: plan.name,
        total: grandTotal,
        status: order.status,
        createdAt: order.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error processing success:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process order',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}