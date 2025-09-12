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

    if (subscription.status === 'paused') {
      subscription.status = 'active';
      subscription.pausedUntil = null;
    } else {
      subscription.status = 'paused';
      subscription.pausedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // pause 30 days
    }

    const saved = await subscription.save();

    return NextResponse.json({
      success: true,
      message: saved.status === 'paused' ? 'Service paused successfully' : 'Service resumed successfully',
      subscription: {
        id: saved._id.toString(),
        status: saved.status,
        pausedUntil: saved.pausedUntil,
        currentPeriodStart: saved.currentPeriodStart,
        currentPeriodEnd: saved.currentPeriodEnd,
        cancelledAt: saved.cancelledAt
      }
    });
  } catch (error) {
    console.error('Error updating subscription pause status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update subscription' }, { status: 500 });
  }
}
