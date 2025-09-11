// app/api/admin/tickets/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Ticket from '@/app/models/Ticket';
import User from '@/app/models/User';

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build base query object
    let query = {};
    
    // Add status filter
    if (status && ['pending', 'in_progress', 'resolved', 'closed', 'on_hold'].includes(status)) {
      query.status = status;
    }
    
    // Add category filter
    if (category && ['technical', 'billing', 'installation', 'service', 'other'].includes(category)) {
      query.category = category;
    }
    
    // Add priority filter
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }
    
    // Sort by createdAt descending (newest first)
    const sort = { createdAt: -1 };
    
    // For non-search requests, use direct database queries with pagination
    if (!search) {
      const [tickets, totalCount] = await Promise.all([
        Ticket.find(query)
          .populate('customerId', 'name email phone')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Ticket.countDocuments(query)
      ]);
      
      // Format tickets for response
      const formattedTickets = tickets.map(ticket => ({
        id: ticket._id.toString(),
        code: ticket.code,
        customerId: ticket.customerId?._id?.toString() || null,
        customerName: ticket.customerId?.name || 'Unknown',
        customerEmail: ticket.customerId?.email || 'Unknown',
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        messages: ticket.messages,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString()
      }));
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      
      return NextResponse.json({
        success: true,
        tickets: formattedTickets,
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
    // First, find matching customers using MongoDB regex (only for text fields)
    const customerMatches = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }).select('_id name email phone');
    
    const customerIds = customerMatches.map(c => c._id.toString());
    
    // Initialize the ticket query with proper structure
    const ticketQuery = {
      $and: [
        query, // Apply other filters (status, category, priority)
        {
          $or: [] // Initialize as empty array
        }
      ]
    };
    
    // Add customer matches to the $or array if available
    if (customerIds.length > 0) {
      ticketQuery.$and[1].$or.push({ customerId: { $in: customerIds } });
    }
    
    // Add subject and description search
    ticketQuery.$and[1].$or.push({ subject: { $regex: search, $options: 'i' } });
    ticketQuery.$and[1].$or.push({ description: { $regex: search, $options: 'i' } });
    
    // If no conditions were added to $or, remove it to avoid empty query
    if (ticketQuery.$and[1].$or.length === 0) {
      // Fallback to searching by ticket code
      ticketQuery.$and[1].$or.push({ code: { $regex: search, $options: 'i' } });
    }
    
    // Execute the query
    const allTickets = await Ticket.find(ticketQuery)
      .populate('customerId', 'name email phone')
      .sort(sort);
    
    // Apply additional client-side filtering for comprehensive search
    const filteredTickets = allTickets.filter(ticket => {
      // Check if ticket code matches
      if (ticket.code.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }
      
      // Check if customer data matches
      if (ticket.customerId) {
        if (matchesSearch(ticket.customerId.name, search)) return true;
        if (matchesSearch(ticket.customerId.email, search)) return true;
        if (matchesSearch(ticket.customerId.phone, search)) return true;
      }
      
      // Check if subject or description matches
      if (matchesSearch(ticket.subject, search)) return true;
      if (matchesSearch(ticket.description, search)) return true;
      
      return false;
    });
    
    // Apply pagination to filtered results
    const paginatedTickets = filteredTickets.slice(skip, skip + limit);
    
    // Format tickets for response
    const formattedTickets = paginatedTickets.map(ticket => ({
      id: ticket._id.toString(),
      code: ticket.code,
      customerId: ticket.customerId?._id?.toString() || null,
      customerName: ticket.customerId?.name || 'Unknown',
      customerEmail: ticket.customerId?.email || 'Unknown',
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      messages: ticket.messages,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    }));
    
    // Calculate pagination info
    const totalCount = filteredTickets.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
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
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tickets',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle PATCH request to update ticket status
export async function PATCH(request, { params }) {
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
    
    // Extract ticket ID from the URL
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');
    
    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { status } = body;
    
    // Validate status value against schema enum
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed', 'on_hold'];
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    // Find the ticket by ID
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Update the status
    ticket.status = status;
    
    // Save the updated ticket
    const updatedTicket = await ticket.save();
    
    // Populate any referenced fields if needed
    // In this case, we'll populate the customerId to get customer details
    await updatedTicket.populate('customerId', 'name email phone');
    
    // Format the response
    const formattedTicket = {
      id: updatedTicket._id.toString(),
      code: updatedTicket.code,
      customerId: updatedTicket.customerId?._id?.toString() || null,
      customerName: updatedTicket.customerId?.name || 'Unknown',
      customerEmail: updatedTicket.customerId?.email || 'Unknown',
      subject: updatedTicket.subject,
      description: updatedTicket.description,
      category: updatedTicket.category,
      priority: updatedTicket.priority,
      status: updatedTicket.status,
      messages: updatedTicket.messages,
      createdAt: updatedTicket.createdAt.toISOString(),
      updatedAt: updatedTicket.updatedAt.toISOString()
    };
    
    return NextResponse.json({
      success: true,
      ticket: formattedTicket,
      message: 'Ticket status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ticket status',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}