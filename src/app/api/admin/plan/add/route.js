// app/api/admin/plan/add/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import ServicePlan from '@/app/models/ServicePlan';

export async function POST(request) {
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
    
    // Validate required fields
    const requiredFields = ['name', 'slug', 'speedMbps', 'priceMonthly', 'priceYearly', 'contractMonths'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: `The following fields are required: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      );
    }
    
    // Validate speedMbps structure
    if (!body.speedMbps.download || !body.speedMbps.upload) {
      return NextResponse.json(
        { 
          error: 'Invalid speed configuration',
          message: 'Both download and upload speeds are required in speedMbps object'
        },
        { status: 400 }
      );
    }
    
    // Create new service plan
    const newPlanData = {
      name: body.name,
      slug: body.slug,
      speedMbps: {
        download: Number(body.speedMbps.download),
        upload: Number(body.speedMbps.upload)
      },
      dataCapGB: body.dataCapGB !== undefined ? Number(body.dataCapGB) : null,
      priceMonthly: Number(body.priceMonthly),
      priceYearly: Number(body.priceYearly),
      currency: body.currency ? body.currency.toUpperCase() : 'USD',
      contractMonths: Number(body.contractMonths),
      features: Array.isArray(body.features) ? body.features : [],
      description: body.description || '',
      active: body.active !== undefined ? Boolean(body.active) : true,
      gatewayPriceIds: {
        stripe: {
          monthly: body.gatewayPriceIds?.stripe?.monthly || '',
          yearly: body.gatewayPriceIds?.stripe?.yearly || ''
        }
      },
      tags: Array.isArray(body.tags) ? body.tags : [],
      priority: body.priority !== undefined ? Number(body.priority) : 0,
      trialDays: body.trialDays !== undefined ? Number(body.trialDays) : 0,
      setupFee: body.setupFee !== undefined ? Number(body.setupFee) : 0,
      equipmentIncluded: body.equipmentIncluded !== undefined ? Boolean(body.equipmentIncluded) : false
    };
    
    // Validate data against schema constraints
    const validationErrors = [];
    
    // Name validation
    if (newPlanData.name.length > 100) {
      validationErrors.push('Name cannot exceed 100 characters');
    }
    
    // Slug validation
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newPlanData.slug)) {
      validationErrors.push('Slug must be lowercase and contain only letters, numbers, and hyphens');
    }
    
    // Speed validations
    if (newPlanData.speedMbps.download < 1 || newPlanData.speedMbps.download > 10000) {
      validationErrors.push('Download speed must be between 1 and 10,000 Mbps');
    }
    
    if (newPlanData.speedMbps.upload < 1 || newPlanData.speedMbps.upload > 10000) {
      validationErrors.push('Upload speed must be between 1 and 10,000 Mbps');
    }
    
    // Price validations
    if (newPlanData.priceMonthly < 0) {
      validationErrors.push('Monthly price cannot be negative');
    }
    
    if (newPlanData.priceYearly < 0) {
      validationErrors.push('Yearly price cannot be negative');
    }
    
    // Currency validation
    if (newPlanData.currency.length !== 3) {
      validationErrors.push('Currency code must be exactly 3 characters');
    }
    
    // Contract months validation
    if (newPlanData.contractMonths < 0 || newPlanData.contractMonths > 36) {
      validationErrors.push('Contract length must be between 0 and 36 months');
    }
    
    // Data cap validation
    if (newPlanData.dataCapGB !== null && newPlanData.dataCapGB < 0) {
      validationErrors.push('Data cap cannot be negative');
    }
    
    // Priority validation
    if (newPlanData.priority < 0 || newPlanData.priority > 11) {
      validationErrors.push('Priority must be between 0 and 11');
    }
    
    // Trial days validation
    if (newPlanData.trialDays < 0 || newPlanData.trialDays > 30) {
      validationErrors.push('Trial days must be between 0 and 30');
    }
    
    // Setup fee validation
    if (newPlanData.setupFee < 0) {
      validationErrors.push('Setup fee cannot be negative');
    }
    
    // Tags validation
    const validTags = ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'];
    if (Array.isArray(newPlanData.tags)) {
      const invalidTags = newPlanData.tags.filter(tag => !validTags.includes(tag));
      if (invalidTags.length > 0) {
        validationErrors.push(`Invalid tags: ${invalidTags.join(', ')}. Valid tags are: ${validTags.join(', ')}`);
      }
    }
    
    // Description length validation
    if (newPlanData.description && newPlanData.description.length > 500) {
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
    
    // Create the new service plan
    let newPlan;
    try {
      newPlan = new ServicePlan(newPlanData);
      await newPlan.save();
    } catch (dbError) {
      // Handle unique constraint violations
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
      console.error('Database error when creating plan:', dbError);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Failed to create service plan'
        },
        { status: 500 }
      );
    }
    
    // Return success response with the created plan
    return NextResponse.json({
      success: true,
      message: 'Service plan created successfully',
      plan: newPlan.toObject()
    }, {
      status: 201
    });
    
  } catch (error) {
    console.error('Error creating service plan:', error);
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