// app/api/admin/plan/[id]/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import ServicePlan from '@/app/models/ServicePlan';

export async function DELETE(request, { params }) {
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

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const deletedPlan = await ServicePlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
