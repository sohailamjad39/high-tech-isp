// app/api/admin/plan/[id]/edit/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import ServicePlan from '@/app/models/ServicePlan';

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
    
    const { id } = params;
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    // Find the plan by ID
    const plan = await ServicePlan.findById(id);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      );
    }
    
    // Return the plan data
    return NextResponse.json({
      success: true,
      plan: plan.toObject()
    });
    
  } catch (error) {
    console.error('Error fetching service plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    
    const { id } = params;
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }
    
    // Find the existing plan
    const existingPlan = await ServicePlan.findById(id);
    
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      );
    }
    
    // Prepare updated data
    const updatedData = {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.speedMbps && {
        speedMbps: {
          download: Number(body.speedMbps.download),
          upload: Number(body.speedMbps.upload)
        }
      }),
      ...(body.dataCapGB !== undefined && { dataCapGB: body.dataCapGB !== null ? Number(body.dataCapGB) : null }),
      ...(body.priceMonthly !== undefined && { priceMonthly: Number(body.priceMonthly) }),
      ...(body.priceYearly !== undefined && { priceYearly: Number(body.priceYearly) }),
      ...(body.currency !== undefined && { currency: body.currency.toUpperCase() }),
      ...(body.contractMonths !== undefined && { contractMonths: Number(body.contractMonths) }),
      ...(body.features !== undefined && { features: Array.isArray(body.features) ? body.features : [] }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.active !== undefined && { active: Boolean(body.active) }),
      ...(body.gatewayPriceIds && {
        gatewayPriceIds: {
          stripe: {
            monthly: body.gatewayPriceIds.stripe?.monthly || '',
            yearly: body.gatewayPriceIds.stripe?.yearly || ''
          }
        }
      }),
      ...(body.tags !== undefined && { tags: Array.isArray(body.tags) ? body.tags : [] }),
      ...(body.priority !== undefined && { priority: Number(body.priority) }),
      ...(body.trialDays !== undefined && { trialDays: Number(body.trialDays) }),
      ...(body.setupFee !== undefined && { setupFee: Number(body.setupFee) }),
      ...(body.equipmentIncluded !== undefined && { equipmentIncluded: Boolean(body.equipmentIncluded) })
    };
    
    // Validate data against schema constraints
    const validationErrors = [];
    
    // Name validation
    if (updatedData.name !== undefined) {
      if (typeof updatedData.name !== 'string') {
        validationErrors.push('Name must be a string');
      } else if (updatedData.name.length === 0) {
        validationErrors.push('Name cannot be empty');
      } else if (updatedData.name.length > 100) {
        validationErrors.push('Name cannot exceed 100 characters');
      }
    }
    
    // Slug validation
    if (updatedData.slug !== undefined) {
      if (typeof updatedData.slug !== 'string') {
        validationErrors.push('Slug must be a string');
      } else if (updatedData.slug.length === 0) {
        validationErrors.push('Slug cannot be empty');
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(updatedData.slug)) {
        validationErrors.push('Slug must be lowercase and contain only letters, numbers, and hyphens');
      }
    }
    
    // Check for duplicate slug (if slug is being updated)
    if (updatedData.slug && updatedData.slug !== existingPlan.slug) {
      const existingWithSlug = await ServicePlan.findOne({ slug: updatedData.slug, _id: { $ne: id } });
      if (existingWithSlug) {
        validationErrors.push('A plan with this slug already exists. Slugs must be unique.');
      }
    }
    
    // Speed validations
    if (updatedData.speedMbps) {
      if (updatedData.speedMbps.download < 1 || updatedData.speedMbps.download > 10000) {
        validationErrors.push('Download speed must be between 1 and 10,000 Mbps');
      }
      
      if (updatedData.speedMbps.upload < 1 || updatedData.speedMbps.upload > 10000) {
        validationErrors.push('Upload speed must be between 1 and 10,000 Mbps');
      }
    }
    
    // Price validations
    if (updatedData.priceMonthly !== undefined && updatedData.priceMonthly < 0) {
      validationErrors.push('Monthly price cannot be negative');
    }
    
    if (updatedData.priceYearly !== undefined && updatedData.priceYearly < 0) {
      validationErrors.push('Yearly price cannot be negative');
    }
    
    // Currency validation
    if (updatedData.currency !== undefined && updatedData.currency.length !== 3) {
      validationErrors.push('Currency code must be exactly 3 characters');
    }
    
    // Contract months validation
    if (updatedData.contractMonths !== undefined && 
        (updatedData.contractMonths < 0 || updatedData.contractMonths > 36)) {
      validationErrors.push('Contract length must be between 0 and 36 months');
    }
    
    // Data cap validation
    if (updatedData.dataCapGB !== undefined && updatedData.dataCapGB !== null && updatedData.dataCapGB < 0) {
      validationErrors.push('Data cap cannot be negative');
    }
    
    // Priority validation
    if (updatedData.priority !== undefined && 
        (updatedData.priority < 0 || updatedData.priority > 11)) {
      validationErrors.push('Priority must be between 0 and 11');
    }
    
    // Trial days validation
    if (updatedData.trialDays !== undefined && 
        (updatedData.trialDays < 0 || updatedData.trialDays > 30)) {
      validationErrors.push('Trial days must be between 0 and 30');
    }
    
    // Setup fee validation
    if (updatedData.setupFee !== undefined && updatedData.setupFee < 0) {
      validationErrors.push('Setup fee cannot be negative');
    }
    
    // Tags validation
    if (updatedData.tags !== undefined) {
      const validTags = ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'];
      const invalidTags = updatedData.tags.filter(tag => !validTags.includes(tag));
      if (invalidTags.length > 0) {
        validationErrors.push(`Invalid tags: ${invalidTags.join(', ')}. Valid tags are: ${validTags.join(', ')}`);
      }
    }
    
    // Description length validation
    if (updatedData.description !== undefined && 
        updatedData.description && 
        updatedData.description.length > 500) {
      validationErrors.push('Description cannot exceed 500 characters');
    }
    
    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'One or more fields failed validation',
          errors: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Update the plan
    Object.assign(existingPlan, updatedData);
    
    let updatedPlan;
    try {
      updatedPlan = await existingPlan.save();
    } catch (dbError) {
      // Handle specific database errors
      if (dbError.code === 11000) {
        return NextResponse.json(
          { 
            error: 'Duplicate entry',
            message: 'A plan with this slug already exists. Slugs must be unique.'
          },
          { status: 409 }
        );
      }
      
      // Handle other database errors
      console.error('Database error when updating plan:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Failed to update service plan'
        },
        { status: 500 }
      );
    }
    
    // Return success response with the updated plan
    return NextResponse.json({
      success: true,
      message: 'Service plan updated successfully',
      plan: updatedPlan.toObject()
    });
    
  } catch (error) {
    console.error('Error updating service plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}