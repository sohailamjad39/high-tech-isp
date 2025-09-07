// app/api/plans/checkout/[slug]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ServicePlan from '@/app/models/ServicePlan';
import { connectToDatabase } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const unwrappedParams = await params;
    const slug = unwrappedParams.slug;
    
    const plan = await ServicePlan.findOne({ slug: slug, active: true });
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      plan: {
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
        equipmentIncluded: plan.equipmentIncluded,
        gatewayPriceIds: plan.gatewayPriceIds
      }
    });
    
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch plan',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const unwrappedParams = await params;
    const slug = unwrappedParams.slug;
    
    const plan = await ServicePlan.findOne({ slug: slug, active: true });
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Get or create price ID
    let priceId = await getPriceId(stripe, plan);
    
    // Create checkout session
    const sessionData = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
        ...(plan.setupFee > 0 ? [{
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: 'Setup Fee',
            },
            unit_amount: Math.round(plan.setupFee * 100),
          },
          quantity: 1,
        }] : [])
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan._id}&user_id=${session.user.id}&setup_fee=${plan.setupFee}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans/checkout/${slug}`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        planId: plan._id.toString(),
        planSlug: slug,
        setupFee: plan.setupFee.toString(),
      },
    });
    
    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      sessionUrl: sessionData.url
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create checkout session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get or create price ID
async function getPriceId(stripe, plan) {
  let priceId;
  
  // Try to use existing price ID
  if (plan.gatewayPriceIds?.stripe?.monthly) {
    try {
      await stripe.prices.retrieve(plan.gatewayPriceIds.stripe.monthly);
      priceId = plan.gatewayPriceIds.stripe.monthly;
    } catch (error) {
      console.warn(`Price ${plan.gatewayPriceIds.stripe.monthly} not found in Stripe`);
    }
  }
  
  // Create new price if needed
  if (!priceId) {
    const createdPrice = await stripe.prices.create({
      unit_amount: Math.round(plan.priceMonthly * 100),
      currency: plan.currency.toLowerCase(),
      recurring: { interval: 'month' },
      product_data: {
        name: plan.name,
      },
    });
    
    // Update plan with new price ID
    plan.gatewayPriceIds = plan.gatewayPriceIds || {};
    plan.gatewayPriceIds.stripe = plan.gatewayPriceIds.stripe || {};
    plan.gatewayPriceIds.stripe.monthly = createdPrice.id;
    
    // Clean up data
    const validTags = ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'];
    if (plan.tags && Array.isArray(plan.tags)) {
      plan.tags = plan.tags.filter(tag => validTags.includes(tag));
    }
    
    if (plan.priority > 11) plan.priority = 11;
    if (plan.priority < 0) plan.priority = 0;
    
    await plan.save();
    
    priceId = createdPrice.id;
  }
  
  return priceId;
}