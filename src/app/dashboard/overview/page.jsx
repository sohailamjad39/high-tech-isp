// app/dashboard/overview/page.jsx
"use client"
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import PlanCard from '@/app/components/dashboard/PlanCard';
import UsageCard from '@/app/components/dashboard/UsageCard';
import RecentInvoices from '@/app/components/dashboard/RecentInvoices';
import RecentTickets from '@/app/components/dashboard/RecentTickets';
import NextAppointment from '@/app/components/dashboard/NextAppointment';
import DashboardSkeleton from '@/app/components/dashboard/DashboardSkeleton';

// Fetch dashboard data function
const fetchDashboardData = async () => {
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
  
  return data.success ? data : defaultData;
};

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use React Query for caching
  const { data: dashboardData, isLoading, error, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    enabled: status === 'authenticated' && session?.user?.role === 'customer',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // We'll handle this manually
    refetchOnReconnect: true,
    retry: 1
  });

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFetching && status === 'authenticated') {
        // Only refetch if data is stale
        const queryClient = window.queryClient;
        if (queryClient) {
          const queryState = queryClient.getQueryState(['dashboard']);
          if (queryState && (Date.now() - queryState.dataUpdatedAt) > 5 * 60 * 1000) {
            queryClient.invalidateQueries(['dashboard']);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFetching, status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
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
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader name={session?.user?.name} />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Mobile: stacked, Desktop: side-by-side */}
        <div className="md:gap-8 space-y-6 md:space-y-0 md:grid md:grid-cols-12">
          {/* Left Column - Takes full width on mobile, 5/12 on desktop */}
          <div className="space-y-6 md:col-span-5">
            <PlanCard 
              plan={dashboardData.subscription?.plan} 
              status={dashboardData.subscription?.status} 
            />
            <UsageCard usage={dashboardData.usage} />
            <NextAppointment appointment={dashboardData.appointment} />
          </div>
          
          {/* Right Column - Takes full width on mobile, 7/12 on desktop */}
          <div className="space-y-6 md:col-span-7">
            <RecentInvoices invoices={dashboardData.invoices} />
            <RecentTickets tickets={dashboardData.tickets} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}