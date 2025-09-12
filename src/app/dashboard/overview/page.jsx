// app/dashboard/overview/page.jsx
"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import PlanCard from "@/app/components/dashboard/PlanCard";
import UsageCard from "@/app/components/dashboard/UsageCard";
import RecentInvoices from "@/app/components/dashboard/RecentInvoices";
import RecentTickets from "@/app/components/dashboard/RecentTickets";
import NextAppointment from "@/app/components/dashboard/NextAppointment";
import DashboardSkeleton from "@/app/components/dashboard/DashboardSkeleton";

// Cache utilities
const DASHBOARD_CACHE_KEY = 'dashboard_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
  const response = await fetch("/api/dashboard");

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const data = await response.json();

  // Add fallback data if API returns empty
  const defaultData = {
    success: true,
    subscription: {
      status: "active",
      plan: {
        name: "Starter Fiber",
        speedMbps: { download: 100, upload: 50 },
        priceMonthly: 49.99,
        features: [
          "100 Mbps Download",
          "50 Mbps Upload",
          "Unlimited Data",
          "Free Router",
          "24/7 Support",
        ],
      },
    },
    invoices: [
      {
        id: "1",
        invoiceNumber: "INV-001",
        issuedAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        total: 49.99,
        status: "paid",
      },
    ],
    tickets: [
      {
        id: "1",
        code: "TICK-001",
        subject: "Service Installation",
        status: "pending",
        priority: "medium",
        createdAt: new Date().toISOString(),
      },
    ],
    appointment: {
      id: "1",
      type: "Installation",
      status: "scheduled",
      scheduledStart: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      scheduledEnd: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      technicianName: "John Smith",
    },
    usage: {
      downloadedGB: 150.5,
      uploadedGB: 45.2,
      periodStart: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      periodEnd: new Date().toISOString(),
    },
  };

  const result = data.success ? data : defaultData;
  
  // Update cache with fresh data
  setCache(result);
  
  return result;
};

function DashboardContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for immediate display from cache
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);

  // Load from cache immediately on mount
  useEffect(() => {
    // Load from cache immediately
    const cache = getCache();
    if (cache) {
      setCachedData(cache);
    }
    
    // Only show content when we have determined authentication state
    setShowContent(status !== 'loading');
    
    // Only fetch fresh data if authenticated
    if (status === "authenticated" && session?.user?.role === "customer") {
      fetchDashboardData()
        .then(data => {
          setCachedData(data);
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
    } else if (status === "unauthenticated") {
      // Redirect to login if unauthenticated
      router.push("/auth/login");
    }
  }, [status, session, router]);

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        session?.user?.role === "customer" &&
        cachedData
      ) {
        // Background refresh without affecting UI
        fetchDashboardData().catch(err => {
          console.error("Background refresh failed:", err);
          // Continue using current data
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session, cachedData]);

  // Don't show anything until we determine what to display
  if (!showContent) {
    return null;
  }

  // Show skeleton only on first load
  if (isLoading && !cachedData) {
    return <DashboardSkeleton />;
  }

  if (error && !cachedData) {
    return (
      <div className="bg-gray-50 mt-15 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="bg-red-50 p-6 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setError(null);
                fetchDashboardData()
                  .then(data => {
                    setCachedData(data);
                    setIsLoading(false);
                  })
                  .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                  });
              }}
              className="bg-red-600 hover:bg-red-700 mt-4 px-4 py-2 rounded-lg text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cachedData) {
    return <div className="bg-gray-50 mt-15 min-h-screen"></div>;
  }

  return (
    <div className="bg-gray-50 mt-15 min-h-screen">
      <DashboardHeader name={session?.user?.name} />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Mobile: stacked, Desktop: side-by-side */}
        <div className="md:gap-8 space-y-6 md:space-y-0 md:grid md:grid-cols-12">
          {/* Left Column - Takes full width on mobile, 5/12 on desktop */}
          <div className="space-y-6 md:col-span-5">
            <PlanCard
              plan={cachedData.subscription?.plan}
              status={cachedData.subscription?.status}
            />
            <UsageCard usage={cachedData.usage} />
            <NextAppointment appointment={cachedData.appointment} />
          </div>

          {/* Right Column - Takes full width on mobile, 7/12 on desktop */}
          <div className="space-y-6 md:col-span-7">
            <RecentInvoices invoices={cachedData.invoices} />
            <RecentTickets tickets={cachedData.tickets} />
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