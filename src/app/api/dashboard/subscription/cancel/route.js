import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import Subscription from '@/app/models/Subscription';

export async function POST(request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await Subscription.findOne({
      customerId: session.user.id,
      status: { $in: ['trial', 'active', 'past_due', 'paused'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'No active subscription found' }, { status: 404 });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();

    const saved = await subscription.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: saved._id.toString(),
        status: saved.status,
        cancelledAt: saved.cancelledAt
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
