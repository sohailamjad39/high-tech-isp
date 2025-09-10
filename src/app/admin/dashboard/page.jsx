// app/admin/dashboard/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Components
import Sidebar from '@/app/components/admin/dashboard/Sidebar';
import OverviewCard from '@/app/components/admin/dashboard/OverviewCard';
import RecentOrders from '@/app/components/admin/dashboard/RecentOrders';
import ActiveSubscriptionsChart from '@/app/components/admin/dashboard/ActiveSubscriptionsChart';
import SupportTicketsStatus from '@/app/components/admin/dashboard/SupportTicketsStatus';

// Cache utilities
const DASHBOARD_CACHE_KEY = 'admin_dashboard_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get data from localStorage cache
const getCache = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      // Cache expired
      localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
  } catch (e) {
    console.error('Cache error:', e);
    return null;
  }
};

// Set data to localStorage cache
const setCache = (data) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error('Failed to set cache:', e);
  }
};

// Fetch dashboard data function
const fetchDashboardData = async () => {
  const response = await fetch("/api/admin/dashboard");

  if (!response.ok) {
    throw new Error("Failed to fetch admin dashboard data");
  }

  const data = await response.json();

  // Update cache with fresh data
  setCache(data);
  
  return data;
};

// Main content component that uses useSession
function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for immediate display from cache
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use React Query for caching with background refresh
  const { 
    data, 
    isLoading: isQueryLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: fetchDashboardData,
    enabled: status === 'authenticated' && session?.user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1
  });

  // Load from cache immediately on mount
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setCachedData(cache);
    }
    
    // Only fetch fresh data if authenticated
    if (status === "authenticated" && session?.user?.role === "admin") {
      // If we have cache, show it immediately and refresh in background
      if (cache) {
        setIsLoading(false);
      }
      
      // Always fetch fresh data
      fetchDashboardData()
        .then(freshData => {
          setCachedData(freshData);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setIsLoading(false);
          
          // If we have cache but fetch failed, keep using cache
          if (!cachedData && cache) {
            setCachedData(cache);
          }
        });
    }
  }, [status, session]);

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        session?.user?.role === "admin"
      ) {
        // Only refresh if data is stale
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const dataAge = Date.now() - (cachedData?.fetchedAt || 0);
        
        if (dataAge > 5 * 60 * 1000) {
          refetch();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session, cachedData, refetch]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !['admin', 'ops'].includes(session?.user?.role)) {
      // Redirect non-admin users to their appropriate dashboards
      if (session?.user?.role === 'customer') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  // Don't show anything until we determine what to display
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (queryError && !cachedData) {
    return (
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-red-50 p-6 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 text-lg">Error loading dashboard</h3>
            <p className="mt-2 text-red-700">{queryError.message}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 shadow-sm mt-4 px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cachedData) {
    return <div className="bg-gray-50 min-h-screen"></div>;
  }

  return (
    <div className="flex bg-gray-50 mt-15 h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Page content */}
        <main className="flex-1 bg-gray-50 p-6 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="font-bold text-gray-900 text-2xl">Admin Dashboard</h1>
              <p className="mt-1 text-gray-600">Welcome back, {session?.user?.name}. Here's what's happening today.</p>
            </div>
            
            {/* Stats Overview */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <OverviewCard
                title="Total Customers"
                value={cachedData.stats?.totalCustomers || 0}
                change={cachedData.stats?.customerGrowth || 0}
                icon="users"
                color="blue"
              />
              
              <OverviewCard
                title="Active Subscriptions"
                value={cachedData.stats?.activeSubscriptions || 0}
                change={cachedData.stats?.subscriptionGrowth || 0}
                icon="subscription"
                color="green"
              />
              
              <OverviewCard
                title="Monthly Revenue"
                value={`$${(cachedData.stats?.monthlyRevenue || 0).toLocaleString()}`}
                change={cachedData.stats?.revenueGrowth || 0}
                icon="revenue"
                color="purple"
              />
              
              <OverviewCard
                title="Open Tickets"
                value={cachedData.stats?.openTickets || 0}
                change={cachedData.stats?.ticketGrowth || 0}
                icon="tickets"
                color="red"
              />
            </div>
            
            {/* Charts and Data Grids */}
            <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
              {/* Active Subscriptions Chart */}
              <div className="lg:col-span-2">
                <ActiveSubscriptionsChart 
                  subscriptionData={cachedData.subscriptionTrends} 
                />
              </div>
              
              {/* Support Tickets Status */}
              <div>
                <SupportTicketsStatus tickets={cachedData.recentTickets} />
              </div>
            </div>
            
            {/* Recent Orders Schedule */}
            <div className="gap-8 mt-8">
              {/* Recent Orders */}
              <div>
                <RecentOrders orders={cachedData.recentOrders} />
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main Dashboard Page
export default function AdminDashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}