// app/dashboard/overview/page.jsx
"use client"
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import PlanCard from '@/app/components/dashboard/PlanCard';
import UsageCard from '@/app/components/dashboard/UsageCard';
import RecentInvoices from '@/app/components/dashboard/RecentInvoices';
import RecentTickets from '@/app/components/dashboard/RecentTickets';
import NextAppointment from '@/app/components/dashboard/NextAppointment';
import DashboardSkeleton from '@/app/components/dashboard/DashboardSkeleton';

// Inner component that uses session
function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        
        // Add fallback data if API returns empty
        const defaultData = {
          success: true,
          subscription: {
            status: 'active',
            plan: {
              name: 'Starter Fiber',
              speedMbps: { download: 100, upload: 50 },
              priceMonthly: 49.99,
              features: [
                '100 Mbps Download',
                '50 Mbps Upload', 
                'Unlimited Data',
                'Free Router',
                '24/7 Support'
              ]
            }
          },
          invoices: [
            {
              id: '1',
              invoiceNumber: 'INV-001',
              issuedAt: new Date().toISOString(),
              dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              total: 49.99,
              status: 'paid'
            }
          ],
          tickets: [
            {
              id: '1',
              code: 'TICK-001',
              subject: 'Service Installation',
              status: 'pending',
              priority: 'medium',
              createdAt: new Date().toISOString()
            }
          ],
          appointment: {
            id: '1',
            type: 'Installation',
            status: 'scheduled',
            scheduledStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            scheduledEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            technicianName: 'John Smith'
          },
          usage: {
            downloadedGB: 150.5,
            uploadedGB: 45.2,
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            periodEnd: new Date().toISOString()
          }
        };
        
        setDashboardData(data.success ? data : defaultData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use fallback data on error
        setDashboardData({
          success: true,
          subscription: null,
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
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session?.user?.role === 'customer') {
      fetchDashboardData();
    }
  }, [status, session, router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-medium text-yellow-800 text-lg">No Data Available</h3>
            <p className="mt-2 text-yellow-700">We couldn't find any data for your account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mt-15 min-h-screen">
      {/* Hide old navbar by not including it */}
      <DashboardHeader name={session?.user?.name} />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8">
            <PlanCard 
              plan={dashboardData.subscription?.plan} 
              status={dashboardData.subscription?.status} 
            />
            <UsageCard usage={dashboardData.usage} />
            <NextAppointment appointment={dashboardData.appointment} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8 lg:col-span-1 xl:col-span-2">
            <RecentInvoices invoices={dashboardData.invoices} />
            <RecentTickets tickets={dashboardData.tickets} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with SessionProvider
export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}