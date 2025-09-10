// app/api/dashboard/subscription/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Subscription from '@/app/models/Subscription';
import ServicePlan from '@/app/models/ServicePlan';
import { connectToDatabase } from '@/app/lib/db';

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
    
    // Find the user's active subscription - sort by createdAt to get the latest one
    const subscription = await Subscription.findOne({ 
      customerId: session.user.id,
      status: { $in: ['trial', 'active', 'past_due', 'paused'] }
    }).sort({ createdAt: -1 }); // Sort by createdAt descending to get the latest subscription
    
    // Get the plan details directly from ServicePlan if subscription exists
    let planData = null;
    if (subscription && subscription.planId) {
      const plan = await ServicePlan.findById(subscription.planId);
      
      if (plan) {
        planData = {
          _id: plan._id.toString(),
          name: plan.name,
          slug: plan.slug,
          speedMbps: {
            download: plan.speedMbps.download,
            upload: plan.speedMbps.upload
          },
          dataCapGB: plan.dataCapGB,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency,
          contractMonths: plan.contractMonths,
          features: plan.features,
          description: plan.description,
          active: plan.active,
          tags: plan.tags || [],
          priority: plan.priority,
          trialDays: plan.trialDays,
          setupFee: plan.setupFee,
          equipmentIncluded: plan.equipmentIncluded
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      subscription: subscription ? {
        id: subscription._id.toString(),
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        pausedUntil: subscription.pausedUntil,
        cancelledAt: subscription.cancelledAt,
        gateway: subscription.gateway,
        plan: planData
      } : null
    });
    
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch subscription data',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}