// app/api/admin/tickets/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Ticket from '@/app/models/Ticket';

export async function PATCH(request, { params }) {
  try {
    console.log('PATCH /api/admin/tickets/[id] called');

    // Connect to DB
    await connectToDatabase();

    // Get session
    const session = await getServerSession(authOptions);

    // Authorization
    if (!session || !['admin', 'ops'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { status } = body;
    const validStatuses = ['pending', 'in_progress', 'resolved', 'closed', 'on_hold'];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 });
    }

    // Update ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone');

    if (!updatedTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Format response
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
    console.error('PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
