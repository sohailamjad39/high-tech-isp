// app/api/dashboard/subscription/cancel/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Subscription from '@/app/models/Subscription';

export async function POST(request) {
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
    
    // Find the user's subscription
    const subscription = await Subscription.findOne({ 
      customerId: session.user.id,
      status: { $in: ['trial', 'active', 'past_due', 'paused'] }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No active subscription found' 
        },
        { status: 404 }
      );
    }
    
    // Update subscription status
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    
    // Save the updated subscription
    await subscription.save();
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel subscription',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}