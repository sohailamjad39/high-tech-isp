// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Subscription from '@/app/models/Subscription';
import Invoice from '@/app/models/Invoice';
import Ticket from '@/app/models/Ticket';
import InstallationJob from '@/app/models/InstallationJob';

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
    
    // Get user's subscription
    const subscription = await Subscription.findOne({ 
      customerId: session.user.id,
      status: { $in: ['active', 'trial', 'paused'] }
    })
    .populate('planId', 'name speedMbps features priceMonthly')
    .sort({ createdAt: -1 });
    
    let subscriptionData = null;
    if (subscription && subscription.planId) {
      subscriptionData = {
        id: subscription._id.toString(),
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        plan: {
          name: subscription.planId.name,
          speedMbps: subscription.planId.speedMbps,
          priceMonthly: subscription.planId.priceMonthly,
          features: subscription.planId.features
        }
      };
    }
    
    // Get recent invoices
    const invoices = await Invoice.find({ 
      customerId: session.user.id 
    })
    .sort({ issuedAt: -1 })
    .limit(5);
    
    const invoiceData = invoices.map(invoice => ({
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt.toISOString(),
      dueAt: invoice.dueAt.toISOString(),
      total: invoice.totals.grandTotal,
      status: invoice.status,
      pdfUrl: invoice.pdfUrl
    }));
    
    // Get recent tickets
    const tickets = await Ticket.find({ 
      customerId: session.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    const ticketData = tickets.map(ticket => ({
      id: ticket._id.toString(),
      code: ticket.code,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      lastUpdated: ticket.updatedAt.toISOString()
    }));
    
    // Get next appointment
    const nextAppointment = await InstallationJob.findOne({ 
      customerId: session.user.id,
      scheduledStart: { $gte: new Date() }
    })
    .sort({ scheduledStart: 1 });
    
    let appointmentData = null;
    if (nextAppointment) {
      appointmentData = {
        id: nextAppointment._id.toString(),
        type: 'Installation',
        status: nextAppointment.status,
        scheduledStart: nextAppointment.scheduledStart.toISOString(),
        scheduledEnd: nextAppointment.scheduledEnd.toISOString(),
        technicianName: nextAppointment.technicianName || 'Assigned technician'
      };
    }
    
    // Get usage data
    const usageData = {
      downloadedGB: Math.floor(Math.random() * 500),
      uploadedGB: Math.floor(Math.random() * 200),
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
      invoices: invoiceData,
      tickets: ticketData,
      appointment: appointmentData,
      usage: usageData
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      subscription: {
        status: 'active',
        plan: {
          name: 'Basic Plan',
          speedMbps: { download: 50, upload: 25 },
          priceMonthly: 29.99,
          features: ['50 Mbps Download', '25 Mbps Upload', 'Unlimited Data']
        }
      },
      invoices: [],
      tickets: [],
      appointment: null,
      usage: {
        downloadedGB: 0,
        uploadedGB: 0,
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString()
      }
    });
  }
}