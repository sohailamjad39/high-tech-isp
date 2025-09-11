// app/api/admin/plans/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
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
    const active = searchParams.get('active');
    const tags = searchParams.get('tags'); // Comma-separated tags
    const minSpeed = searchParams.get('minSpeed');
    const maxSpeed = searchParams.get('maxSpeed');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const currency = searchParams.get('currency');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build base query object
    let query = {};
    
    // Add active filter
    if (active !== null && active !== undefined) {
      query.active = active === 'true';
    }
    
    // Add tags filter
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagsArray };
    }
    
    // Add speed filters
    if (minSpeed !== null && !isNaN(minSpeed)) {
      query['speedMbps.download'] = { ...query['speedMbps.download'], $gte: parseInt(minSpeed) };
    }
    
    if (maxSpeed !== null && !isNaN(maxSpeed)) {
      query['speedMbps.download'] = { ...query['speedMbps.download'], $lte: parseInt(maxSpeed) };
    }
    
    // Add price filters
    if (minPrice !== null && !isNaN(minPrice)) {
      query.priceMonthly = { ...query.priceMonthly, $gte: parseFloat(minPrice) };
    }
    
    if (maxPrice !== null && !isNaN(maxPrice)) {
      query.priceMonthly = { ...query.priceMonthly, $lte: parseFloat(maxPrice) };
    }
    
    // Add currency filter
    if (currency) {
      query.currency = currency.toUpperCase();
    }
    
    // Sort by priority descending, then by name
    const sort = { priority: -1, name: 1 };
    
    // For non-search requests, use direct database queries with pagination
    if (!search) {
      const [plans, totalCount] = await Promise.all([
        ServicePlan.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        ServicePlan.countDocuments(query)
      ]);
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      
      return NextResponse.json({
        success: true,
        plans: plans.map(plan => plan.toObject()),
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
    // Find matching plans using MongoDB regex (only for text fields)
    const planMatches = await ServicePlan.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ]
    }).select('_id name description slug speedMbps priceMonthly priceYearly currency active tags');
    
    // Apply additional client-side filtering for comprehensive search
    const filteredPlans = planMatches.filter(plan => {
      // Check if any field matches the search term
      if (
        matchesSearch(plan.name, search) ||
        matchesSearch(plan.description, search) ||
        matchesSearch(plan.slug, search)
      ) {
        return true;
      }
      
      // Check if tags match
      if (plan.tags && Array.isArray(plan.tags)) {
        if (plan.tags.some(tag => matchesSearch(tag, search))) {
          return true;
        }
      }
      
      return false;
    });
    
    // Apply server-side filters to the filtered results
    const finalFilteredPlans = filteredPlans.filter(plan => {
      // Apply active filter
      if (active !== null && active !== undefined && plan.active !== (active === 'true')) {
        return false;
      }
      
      // Apply tags filter
      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim());
        if (!tagsArray.every(tag => plan.tags?.includes(tag))) {
          return false;
        }
      }
      
      // Apply speed filters
      if (minSpeed !== null && !isNaN(minSpeed) && plan.speedMbps.download < parseInt(minSpeed)) {
        return false;
      }
      
      if (maxSpeed !== null && !isNaN(maxSpeed) && plan.speedMbps.download > parseInt(maxSpeed)) {
        return false;
      }
      
      // Apply price filters
      if (minPrice !== null && !isNaN(minPrice) && plan.priceMonthly < parseFloat(minPrice)) {
        return false;
      }
      
      if (maxPrice !== null && !isNaN(maxPrice) && plan.priceMonthly > parseFloat(maxPrice)) {
        return false;
      }
      
      // Apply currency filter
      if (currency && plan.currency !== currency.toUpperCase()) {
        return false;
      }
      
      return true;
    });
    
    // Apply pagination to filtered results
    const paginatedPlans = finalFilteredPlans.slice(skip, skip + limit);
    
    // Calculate pagination info
    const totalCount = finalFilteredPlans.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      plans: paginatedPlans.map(plan => plan.toObject()),
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
    console.error('Error fetching service plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch service plans',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}