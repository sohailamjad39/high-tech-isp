// app/admin/orders/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Components
import Sidebar from '@/app/components/admin/dashboard/Sidebar';
import DataTable from '@/app/components/admin/DataTable';
import SearchBar from '@/app/components/admin/SearchBar';
import FilterDropdown from '@/app/components/admin/FilterDropdown';
import Pagination from '@/app/components/admin/Pagination';
import SkeletonTable from '@/app/components/admin/SkeletonTable';

// Cache utilities
const ORDERS_CACHE_KEY = 'admin_orders_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get data from localStorage cache
const getCache = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(ORDERS_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      // Cache expired
      localStorage.removeItem(ORDERS_CACHE_KEY);
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
    localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error('Failed to set cache:', e);
  }
};

// Fetch orders data function
const fetchOrdersData = async (searchTerm = '', statusFilter = 'all', planFilter = 'all', customerId = '') => {
  const params = new URLSearchParams();
  
  if (searchTerm) params.append('search', searchTerm);
  if (statusFilter !== 'all') params.append('status', statusFilter);
  if (planFilter !== 'all') params.append('planId', planFilter);
  if (customerId) params.append('customerId', customerId);
  params.append('page', '1');
  params.append('limit', '10');

  const response = await fetch(`/api/admin/orders?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch admin orders data");
  }

  const data = await response.json();

  // Update cache with fresh data
  setCache(data);
  
  return data;
};

// View Order Modal Component
function ViewOrderModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      initiated: "bg-gray-100 text-gray-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      scheduled: "bg-purple-100 text-purple-800",
      installed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800"
    };

    // Format status string (replace underscores with spaces and capitalize)
    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {formatStatus(status)}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800"
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="z-50 fixed inset-0 overflow-y-auto">
      <div className="sm:block flex justify-center items-center sm:p-0 px-4 pt-4 pb-20 min-h-screen text-center">
        {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div> */}

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block bg-white shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-4xl overflow-hidden text-left sm:align-middle align-bottom transition-all transform">
          <div className="bg-white sm:p-6 px-4 pt-5 pb-4 sm:pb-4">
            <h3 className="mb-6 font-medium text-gray-900 text-lg leading-6">
              Order Details #{order.orderId}
            </h3>
            
            <div className="space-y-8">
              {/* Order Overview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Order Overview</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Order ID</label>
                    <p className="mt-1 text-gray-900">{order.id}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Payment Status</label>
                    <div className="mt-1">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Created At</label>
                    <p className="mt-1 text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Updated At</label>
                    <p className="mt-1 text-gray-900">{new Date(order.updatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Gateway</label>
                    <p className="mt-1 text-gray-900">{order.gateway || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Customer Information</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Name</label>
                    <p className="mt-1 text-gray-900">{order.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Email</label>
                    <p className="mt-1 text-gray-900">{order.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Customer ID</label>
                    <p className="mt-1 text-gray-900">{order.customerId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Service Plan */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Service Plan</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Plan Name</label>
                    <p className="mt-1 text-gray-900">{order.planName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Speed</label>
                    <p className="mt-1 text-gray-900">
                      {order.downloadSpeed} Mbps ↓ / {order.uploadSpeed} Mbps ↑
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Monthly Price</label>
                    <p className="mt-1 text-gray-900">
                      {order.currency} {order.monthlyPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Yearly Price</label>
                    <p className="mt-1 text-gray-900">
                      {order.currency} {order.yearlyPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Installation Schedule */}
              {order.installationSlot?.start && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="mb-4 font-medium text-gray-900">Installation Schedule</h4>
                  <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">Scheduled Start</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(order.installationSlot.start).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block font-medium text-gray-500 text-sm">Scheduled End</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(order.installationSlot.end).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Order Totals</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Subtotal</label>
                    <p className="mt-1 text-gray-900">
                      {order.currency} {order.totals?.subtotal?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Tax</label>
                    <p className="mt-1 text-gray-900">
                      {order.currency} {order.totals?.tax?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Discount</label>
                    <p className="mt-1 text-gray-900">
                      {order.currency} {order.totals?.discount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Grand Total</label>
                    <p className="mt-1 font-bold text-gray-900">
                      {order.currency} {order.totals?.grandTotal?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sm:flex sm:flex-row-reverse bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 shadow-sm sm:ml-3 px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto font-medium text-white sm:text-sm text-base"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main content component that uses useSession
function OrdersContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for immediate display from cache
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use React Query for caching with background refresh
  const { 
    data, 
    isLoading: isQueryLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['adminOrders', searchTerm, statusFilter],
    queryFn: () => fetchOrdersData(searchTerm, statusFilter),
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
      fetchOrdersData(searchTerm, statusFilter)
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
  }, [status, session, searchTerm, statusFilter]);

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
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      // Only redirect non-admin users, but allow ops users to access
      if (session?.user?.role === 'customer') {
        router.push('/dashboard');
      } else if (session?.user?.role === 'tech') {
        router.push('/tech');
      } else if (session?.user?.role === 'support') {
        router.push('/support');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  // Handle opening the modal
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeOrderDetails = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      initiated: "bg-gray-100 text-gray-800",
      awaiting_payment: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      scheduled: "bg-purple-100 text-purple-800",
      installed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800"
    };

    // Format status string (replace underscores with spaces and capitalize)
    const formatStatus = (status) => {
      if (!status) return 'Unknown';
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {formatStatus(status)}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-orange-100 text-orange-800"
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Don't show anything until we determine what to display
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Orders</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer orders and installations
            </p>
          </div>

          <SkeletonTable columns={7} rows={10} />
        </div>
      </div>
    );
  }

  if (queryError && !cachedData) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Orders</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer orders and installations
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800">Error loading orders</h3>
                <div className="mt-2 text-red-700">
                  <p>{queryError.message}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => refetch()}
                    className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md font-medium text-red-600"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cachedData) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Orders</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer orders and installations
            </p>
          </div>

          <div className="bg-white shadow mb-6 rounded-lg">
            <div className="px-6 py-4 border-gray-200 border-b">
              <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
                {/* Search Bar */}
                <div className="flex-1 max-w-lg">
                  <SearchBar
                    placeholder="Search by order ID, customer name, email, or plan..."
                    onSearch={handleSearch}
                    initialValue={searchTerm}
                  />
                </div>

                {/* Filters */}
                <div className="flex space-x-4">
                  <FilterDropdown
                    label="Status"
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "initiated", label: "Initiated" },
                      { value: "awaiting_payment", label: "Awaiting Payment" },
                      { value: "paid", label: "Paid" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "installed", label: "Installed" },
                      { value: "cancelled", label: "Cancelled" },
                      { value: "failed", label: "Failed" },
                    ]}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                headers={[
                  "Order ID",
                  "Customer",
                  "Plan",
                  "Total",
                  "Status",
                  "Payment",
                  "Created",
                  "Actions",
                ]}
              >
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-gray-500 text-center">
                    No orders found matching your criteria.
                  </td>
                </tr>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-15">
      <Sidebar />
      <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
        <div className="mb-8">
          <h1 className="font-semibold text-gray-900 text-2xl">Orders</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Manage customer orders and installations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="px-6 py-4 border-gray-200 border-b">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <SearchBar
                  placeholder="Search by order ID, customer name, email, or plan..."
                  onSearch={handleSearch}
                  initialValue={searchTerm}
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "initiated", label: "Initiated" },
                    { value: "awaiting_payment", label: "Awaiting Payment" },
                    { value: "paid", label: "Paid" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "installed", label: "Installed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "failed", label: "Failed" },
                  ]}
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <DataTable
              headers={[
                "Order ID",
                "Customer",
                "Plan",
                "Total",
                "Status",
                "Payment",
                "Created",
                "Actions",
              ]}
            >
              {cachedData?.orders?.length > 0 ? (
                cachedData.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">
                        #{order.orderId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-gray-500">{order.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        <div className="font-medium">{order.planName}</div>
                        <div className="text-gray-500">{order.downloadSpeed} Mbps</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">
                        {order.currency} {order.totals.grandTotal.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-gray-500 text-center"
                  >
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </DataTable>
          </div>

          {/* Pagination */}
          {cachedData?.pagination && (
            <div className="px-6 py-4 border-gray-200 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={cachedData.pagination.totalPages}
                totalItems={cachedData.pagination.totalItems}
                itemsPerPage={cachedData.pagination.itemsPerPage}
                onPageChange={() => {}}
              />
            </div>
          )}
        </div>

        {/* Modal will be rendered here */}
        <ViewOrderModal 
          order={selectedOrder} 
          isOpen={isModalOpen} 
          onClose={closeOrderDetails} 
        />
      </div>
    </div>
  );
}

// Wrap the entire page with SessionProvider
export default function OrdersPage() {
  return (
    <SessionProvider>
      <OrdersContent />
    </SessionProvider>
  );
}