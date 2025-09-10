// app/api/dashboard/tickets/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Ticket from '@/app/models/Ticket';

export async function GET(request) {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find all tickets for the logged-in user
    const tickets = await Ticket.find({ 
      customerId: session.user.id 
    })
    .sort({ createdAt: -1 });
    
    // Transform the tickets data for the frontend
    const ticketsData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      code: ticket.code,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      tickets: ticketsData
    });
    
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tickets',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}