// app/api/dashboard/subscription/pause/route.js
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
    
    // Toggle pause status
    if (subscription.status === 'paused') {
      // Resume service
      subscription.status = 'active';
      subscription.pausedUntil = null;
    } else {
      // Pause service
      subscription.status = 'paused';
      subscription.pausedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Pause for 30 days
    }
    
    // Save the updated subscription
    await subscription.save();
    
    return NextResponse.json({
      success: true,
      message: subscription.status === 'paused' ? 'Service paused successfully' : 'Service resumed successfully'
    });
    
  } catch (error) {
    console.error('Error updating subscription pause status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update subscription',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}