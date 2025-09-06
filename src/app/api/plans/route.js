// app/api/plans/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import ServicePlan from '@/app/models/ServicePlan';

export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Fetch active plans from database, sorted by priority
    const plans = await ServicePlan.find({ active: true })
      .sort({ priority: 1 })
      .lean(); // Use lean() for better performance
    
    // Transform the data to ensure consistent format
    const formattedPlans = plans.map(plan => ({
      _id: plan._id.toString(),
      name: plan.name,
      slug: plan.slug,
      speedMbps: plan.speedMbps,
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
    }));
    
    return NextResponse.json({
      success: true,
      plans: formattedPlans,
      count: formattedPlans.length
    });
    
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch plans',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}