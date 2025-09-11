// app/admin/tickets/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import Sidebar from '@/app/components/admin/dashboard/Sidebar';
import DataTable from '@/app/components/admin/DataTable';
import SearchBar from '@/app/components/admin/SearchBar';
import FilterDropdown from '@/app/components/admin/FilterDropdown';
import Pagination from '@/app/components/admin/Pagination';
import SkeletonTable from '@/app/components/admin/SkeletonTable';

// Cache utilities
const TICKETS_CACHE_KEY = 'admin_tickets_data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get data from localStorage cache
const getCache = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(TICKETS_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    } else {
      // Cache expired
      localStorage.removeItem(TICKETS_CACHE_KEY);
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
    localStorage.setItem(TICKETS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (e) {
    console.error('Failed to set cache:', e);
  }
};

// Fetch tickets data function
const fetchTicketsData = async (searchTerm = '', statusFilter = 'all', categoryFilter = 'all', priorityFilter = 'all') => {
  const params = new URLSearchParams();
  
  if (searchTerm) params.append('search', searchTerm);
  if (statusFilter !== 'all') params.append('status', statusFilter);
  if (categoryFilter !== 'all') params.append('category', categoryFilter);
  if (priorityFilter !== 'all') params.append('priority', priorityFilter);
  params.append('page', '1');
  params.append('limit', '10');

  const response = await fetch(`/api/admin/tickets?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch admin tickets data");
  }

  const data = await response.json();

  // Update cache with fresh data
  setCache(data);
  
  return data;
};

// Update ticket status function
const updateTicketStatus = async ({ ticketId, status }) => {
  const response = await fetch(`/api/admin/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ticket status");
  }

  return response.json();
};

// View Ticket Modal Component
function ViewTicketModal({ ticket, isOpen, onClose, onUpdateStatus }) {
  if (!isOpen || !ticket) return null;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      on_hold: "bg-red-100 text-red-800"
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

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };

    if (!priority) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || "bg-gray-100 text-gray-800"}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Category badge component
  const CategoryBadge = ({ category }) => {
    const colors = {
      technical: "bg-purple-100 text-purple-800",
      billing: "bg-blue-100 text-blue-800",
      installation: "bg-green-100 text-green-800",
      service: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800"
    };

    if (!category) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[category] || "bg-gray-100 text-gray-800"}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  return (
    <div className="z-50 fixed inset-0 overflow-y-auto">
      <div className="sm:block flex justify-center items-center sm:p-0 px-4 pt-4 pb-20 min-h-screen text-center">

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block bg-white shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-4xl overflow-hidden text-left sm:align-middle align-bottom transition-all transform">
          <div className="bg-white sm:p-6 px-4 pt-5 pb-4 sm:pb-4">
            <h3 className="mb-6 font-medium text-gray-900 text-lg leading-6">
              Ticket Details #{ticket.code}
            </h3>
            
            <div className="space-y-8">
              {/* Ticket Overview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Ticket Overview</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Ticket ID</label>
                    <p className="mt-1 text-gray-900">{ticket.id}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Priority</label>
                    <div className="mt-1">
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Category</label>
                    <div className="mt-1">
                      <CategoryBadge category={ticket.category} />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Created At</label>
                    <p className="mt-1 text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Updated At</label>
                    <p className="mt-1 text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Customer Information</h4>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Name</label>
                    <p className="mt-1 text-gray-900">{ticket.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Email</label>
                    <p className="mt-1 text-gray-900">{ticket.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Customer ID</label>
                    <p className="mt-1 text-gray-900">{ticket.customerId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Ticket Details</h4>
                <div className="gap-6 grid grid-cols-1">
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Subject</label>
                    <p className="mt-1 font-medium text-gray-900">{ticket.subject}</p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-500 text-sm">Description</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-medium text-gray-900">Messages</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {ticket.messages && ticket.messages.length > 0 ? (
                    ticket.messages.map((message, index) => (
                      <div key={index} className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'agent' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="mb-1 font-medium text-xs">Attachments:</p>
                              <ul className="space-y-1 text-xs">
                                {message.attachments.map((attachment, idx) => (
                                  <li key={idx}>
                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" 
                                       className="text-blue-100 hover:text-blue-200 underline">
                                      {attachment.filename}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="opacity-80 mt-1 text-xs">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No messages yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Update Buttons */}
          <div className="flex flex-wrap gap-2 bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                ticket.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
              }`}
              onClick={() => onUpdateStatus('pending')}
              disabled={ticket.status === 'pending'}
            >
              Mark as Pending
            </button>
            
            <button
              type="button"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                ticket.status === 'in_progress' 
                  ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              }`}
              onClick={() => onUpdateStatus('in_progress')}
              disabled={ticket.status === 'in_progress'}
            >
              Mark as In Progress
            </button>
            
            <button
              type="button"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                ticket.status === 'resolved' 
                  ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              }`}
              onClick={() => onUpdateStatus('resolved')}
              disabled={ticket.status === 'resolved'}
            >
              Mark as Resolved
            </button>
            
            <button
              type="button"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                ticket.status === 'on_hold' 
                  ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
              }`}
              onClick={() => onUpdateStatus('on_hold')}
              disabled={ticket.status === 'on_hold'}
            >
              Mark as On Hold
            </button>
            
            <button
              type="button"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                ticket.status === 'closed' 
                  ? 'bg-gray-100 text-gray-800 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer'
              }`}
              onClick={() => onUpdateStatus('closed')}
              disabled={ticket.status === 'closed'}
            >
              Close Ticket
            </button>
          </div>
          
          <div className="bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              className="inline-flex justify-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto font-medium text-white text-base cursor-pointer"
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
function TicketsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State for immediate display from cache
  const [cachedData, setCachedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Add state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use React Query for caching with background refresh
  const { 
    data, 
    isLoading: isQueryLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['adminTickets', searchTerm, statusFilter, categoryFilter, priorityFilter],
    queryFn: () => fetchTicketsData(searchTerm, statusFilter, categoryFilter, priorityFilter),
    enabled: status === 'authenticated' && session?.user?.role === 'admin',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true,  // Enable background refresh when window regains focus
    refetchOnReconnect: true,
    retry: 1
  });

  // Mutation for updating ticket status
  const updateStatusMutation = useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: (data) => {
      // Update the local cache immediately
      queryClient.setQueryData(['adminTickets', searchTerm, statusFilter, categoryFilter, priorityFilter], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          tickets: oldData.tickets.map(ticket => 
            ticket.id === data.ticket.id ? data.ticket : ticket
          )
        };
      });
      
      // Also update the selected ticket if it's the one being updated
      if (selectedTicket && selectedTicket.id === data.ticket.id) {
        setSelectedTicket(data.ticket);
      }
      
      // Show success message or toast
      alert('Ticket status updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating ticket status:', error);
      alert('Failed to update ticket status. Please try again.');
    }
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
      fetchTicketsData(searchTerm, statusFilter, categoryFilter, priorityFilter)
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
  }, [status, session, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        session?.user?.role === "admin"
      ) {
        // Refresh data when tab becomes visible
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session, refetch]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !['admin', 'ops'].includes(session?.user?.role)) {
      // Redirect non-admin users to their appropriate dashboards
      if (session?.user?.role === 'customer') {
        router.push('/dashboard');
      } else if (session?.user?.role === 'support') {
        router.push('/support');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  // Handle opening the modal
  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeTicketDetails = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  // Handle updating ticket status
  const handleUpdateStatus = (newStatus) => {
    if (selectedTicket && selectedTicket.id) {
      updateStatusMutation.mutate({
        ticketId: selectedTicket.id,
        status: newStatus
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      on_hold: "bg-red-100 text-red-800"
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

  // Don't show anything until we determine what to display
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Support Tickets</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer support tickets and communications
            </p>
          </div>

          <SkeletonTable columns={8} rows={10} />
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
            <h1 className="font-semibold text-gray-900 text-2xl">Support Tickets</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer support tickets and communications
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
                <h3 className="font-medium text-red-800">Error loading tickets</h3>
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
            <h1 className="font-semibold text-gray-900 text-2xl">Support Tickets</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Manage customer support tickets and communications
            </p>
          </div>

          <div className="bg-white shadow mb-6 rounded-lg">
            <div className="px-6 py-4 border-gray-200 border-b">
              <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
                {/* Search Bar */}
                <div className="flex-1 max-w-lg">
                  <SearchBar
                    placeholder="Search by ticket ID, customer name, email, subject, or description..."
                    onSearch={setSearchTerm}
                    initialValue={searchTerm}
                  />
                </div>

                {/* Filters */}
                <div className="flex space-x-4">
                  <FilterDropdown
                    label="Status"
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "pending", label: "Pending" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "on_hold", label: "On Hold" },
                      { value: "closed", label: "Closed" },
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  />
                  
                  <FilterDropdown
                    label="Category"
                    options={[
                      { value: "all", label: "All Categories" },
                      { value: "technical", label: "Technical" },
                      { value: "billing", label: "Billing" },
                      { value: "installation", label: "Installation" },
                      { value: "service", label: "Service" },
                      { value: "other", label: "Other" },
                    ]}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                  />
                  
                  <FilterDropdown
                    label="Priority"
                    options={[
                      { value: "all", label: "All Priorities" },
                      { value: "low", label: "Low" },
                      { value: "medium", label: "Medium" },
                      { value: "high", label: "High" },
                      { value: "urgent", label: "Urgent" },
                    ]}
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DataTable
                headers={[
                  "Ticket ID",
                  "Customer",
                  "Subject",
                  "Category",
                  "Priority",
                  "Status",
                  "Created",
                  "Actions",
                ]}
              >
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-gray-500 text-center">
                    No tickets found matching your criteria.
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
          <h1 className="font-semibold text-gray-900 text-2xl">Support Tickets</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Manage customer support tickets and communications
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow mb-6 rounded-lg">
          <div className="px-6 py-4 border-gray-200 border-b">
            <div className="flex md:flex-row flex-col md:justify-between md:items-center space-y-4 md:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-lg">
                <SearchBar
                  placeholder="Search by ticket ID, customer name, email, subject, or description..."
                  onSearch={setSearchTerm}
                  initialValue={searchTerm}
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-4">
                <FilterDropdown
                  label="Status"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "resolved", label: "Resolved" },
                    { value: "on_hold", label: "On Hold" },
                    { value: "closed", label: "Closed" },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
                
                <FilterDropdown
                  label="Category"
                  options={[
                    { value: "all", label: "All Categories" },
                    { value: "technical", label: "Technical" },
                    { value: "billing", label: "Billing" },
                    { value: "installation", label: "Installation" },
                    { value: "service", label: "Service" },
                    { value: "other", label: "Other" },
                  ]}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                />
                
                <FilterDropdown
                  label="Priority"
                  options={[
                    { value: "all", label: "All Priorities" },
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                  ]}
                  value={priorityFilter}
                  onChange={setPriorityFilter}
                />
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <DataTable
              headers={[
                "Ticket ID",
                "Customer",
                "Subject",
                "Category",
                "Priority",
                "Status",
                "Created",
                "Actions",
              ]}
            >
              {cachedData?.tickets?.length > 0 ? (
                cachedData.tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 text-sm">
                        #{ticket.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        <div className="font-medium">{ticket.customerName}</div>
                        <div className="text-gray-500">{ticket.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs text-gray-900 text-sm line-clamp-1">
                        {ticket.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.category === 'technical' ? 'bg-purple-100 text-purple-800' :
                        ticket.category === 'billing' ? 'bg-blue-100 text-blue-800' :
                        ticket.category === 'installation' ? 'bg-green-100 text-green-800' :
                        ticket.category === 'service' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openTicketDetails(ticket)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
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
                    No tickets found matching your criteria.
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
        <ViewTicketModal 
          ticket={selectedTicket} 
          isOpen={isModalOpen} 
          onClose={closeTicketDetails}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}

// Wrap the entire page with SessionProvider
export default function TicketsPage() {
  return (
    <SessionProvider>
      <TicketsContent />
    </SessionProvider>
  );
}