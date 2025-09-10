// app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import User from '@/app/models/User';
import Order from '@/app/models/Order';
import Subscription from '@/app/models/Subscription';
import Ticket from '@/app/models/Ticket';
import InstallationJob from '@/app/models/InstallationJob';
import ServicePlan from '@/app/models/ServicePlan';
import Invoice from '@/app/models/Invoice';

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
    
    // Get current date for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Calculate date ranges for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 1. Get customer statistics
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const customersThisMonth = await User.countDocuments({ 
      role: 'customer',
      createdAt: { $gte: startOfMonth }
    });
    const customersLastMonth = await User.countDocuments({ 
      role: 'customer',
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
    });
    const customerGrowth = customersLastMonth > 0 
      ? Math.round(((customersThisMonth - customersLastMonth) / customersLastMonth) * 100)
      : customersThisMonth > 0 ? 100 : 0;
    
    // 2. Get subscription statistics
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const subscriptionsThisMonth = await Subscription.countDocuments({ 
      status: 'active',
      currentPeriodStart: { $gte: startOfMonth }
    });
    const subscriptionsLastMonth = await Subscription.countDocuments({ 
      status: 'active',
      currentPeriodStart: { $gte: startOfLastMonth, $lt: startOfMonth }
    });
    const subscriptionGrowth = subscriptionsLastMonth > 0 
      ? Math.round(((subscriptionsThisMonth - subscriptionsLastMonth) / subscriptionsLastMonth) * 100)
      : subscriptionsThisMonth > 0 ? 100 : 0;
    
    // 3. Get revenue statistics
    const invoicesThisMonth = await Invoice.find({ 
      issuedAt: { $gte: startOfMonth },
      status: 'paid'
    }).select('totals.grandTotal');
    
    const monthlyRevenue = invoicesThisMonth.reduce((sum, invoice) => sum + invoice.totals.grandTotal, 0);
    
    const invoicesLastMonth = await Invoice.find({ 
      issuedAt: { $gte: startOfLastMonth, $lt: startOfMonth },
      status: 'paid'
    }).select('totals.grandTotal');
    
    const lastMonthRevenue = invoicesLastMonth.reduce((sum, invoice) => sum + invoice.totals.grandTotal, 0);
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : monthlyRevenue > 0 ? 100 : 0;
    
    // 4. Get ticket statistics
    const openTickets = await Ticket.countDocuments({ 
      status: { $in: ['pending', 'in_progress'] } 
    });
    
    const ticketsThisMonth = await Ticket.countDocuments({ 
      createdAt: { $gte: startOfMonth }
    });
    const ticketsLastMonth = await Ticket.countDocuments({ 
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
    });
    const ticketGrowth = ticketsLastMonth > 0 
      ? Math.round(((ticketsThisMonth - ticketsLastMonth) / ticketsLastMonth) * 100)
      : ticketsThisMonth > 0 ? 100 : 0;
    
    // 5. Get subscription trends for the last 6 months
    const subscriptionTrends = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (5 - i));
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        
        return Promise.all([
          Subscription.countDocuments({
            currentPeriodStart: { $gte: monthStart, $lt: monthEnd }
          }),
          Subscription.countDocuments({
            cancelledAt: { $gte: monthStart, $lt: monthEnd }
          })
        ]).then(([newSubs, cancelledSubs]) => ({
            month: monthStart.toLocaleDateString('default', { month: 'short', year: '2-digit' }),
            newSubscriptions: newSubs,
            cancelledSubscriptions: cancelledSubs
          }));
      })
    );
    
    // Format subscription trend data for chart
    const subscriptionChartData = {
      labels: subscriptionTrends.map(t => t.month),
      newSubscriptions: subscriptionTrends.map(t => t.newSubscriptions),
      cancelledSubscriptions: subscriptionTrends.map(t => t.cancelledSubscriptions)
    };
    
    // 6. Get recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name email')
      .populate('planId', 'name')
      .lean();
    
    const formattedOrders = recentOrders.map(order => ({
      id: order._id.toString(),
      code: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      customerId: order.customerId._id.toString(),
      customerName: order.customerId.name,
      planId: order.planId._id.toString(),
      planName: order.planId.name,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      totals: order.totals
    }));
    
    // 7. Get recent tickets
    const recentTickets = await Ticket.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name')
      .lean();
    
    const formattedTickets = recentTickets.map(ticket => ({
      id: ticket._id.toString(),
      code: ticket.code,
      customerId: ticket.customerId._id.toString(),
      customerName: ticket.customerId.name,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString()
    }));
    
    // 8. Get upcoming installations
    const upcomingInstallations = await InstallationJob.find({
      scheduledStart: { $gte: new Date() }
    })
      .sort({ scheduledStart: 1 })
      .limit(10)
      .populate('orderId', 'customerId')
      .populate('customerId', 'name')
      .populate('technicianId', 'name')
      .lean();
    
    const formattedInstallations = upcomingInstallations.map(job => ({
      id: job._id.toString(),
      jobNumber: `INST-${job._id.toString().slice(-6).toUpperCase()}`,
      orderId: job.orderId?._id.toString(),
      customerId: job.customerId._id.toString(),
      customerName: job.customerId.name,
      technicianId: job.technicianId?._id.toString(),
      technicianName: job.technicianId?.name,
      scheduledStart: job.scheduledStart.toISOString(),
      scheduledEnd: job.scheduledEnd.toISOString(),
      status: job.status,
      notes: job.notes
    }));
    
    return NextResponse.json({
      success: true,
      stats: {
        totalCustomers,
        customerGrowth,
        activeSubscriptions,
        subscriptionGrowth,
        monthlyRevenue,
        revenueGrowth,
        openTickets,
        ticketGrowth
      },
      subscriptionTrends: subscriptionChartData,
      recentOrders: formattedOrders,
      recentTickets: formattedTickets,
      upcomingInstallations: formattedInstallations,
      fetchedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59'
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}