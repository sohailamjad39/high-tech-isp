// app/dashboard/tickets/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Status badge component
function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    on_hold: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }) {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority.replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Category badge component
function CategoryBadge({ category }) {
  const colors = {
    technical: 'bg-purple-100 text-purple-800',
    billing: 'bg-blue-100 text-blue-800',
    installation: 'bg-indigo-100 text-indigo-800',
    service: 'bg-teal-100 text-teal-800',
    other: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
      {category.replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Tickets Table Component
function TicketsTable({ tickets, loading }) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Your Support Tickets</h3>
        </div>
        <div className="p-5">
          <div className="animate-pulse">
            <div className="bg-gray-200 mb-4 rounded h-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded h-12"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Your Support Tickets</h3>
        </div>
        <div className="p-5 text-center">
          <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <h3 className="mt-2 text-gray-900">No tickets yet</h3>
          <p className="mt-1 text-gray-500">You haven't created any support tickets.</p>
          <div className="mt-6">
            <a 
              href="/dashboard/tickets/new" 
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm"
            >
              Create a Ticket
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Your Support Tickets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Ticket #
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-blue-600 text-sm">{ticket.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-900 text-sm">{ticket.subject}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CategoryBadge category={ticket.category} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main content component
function TicketsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Fetch tickets data
  const fetchTickets = async () => {
    const response = await fetch('/api/dashboard/tickets');
    
    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }
    
    return response.json();
  };
  
  // Use React Query to fetch and cache tickets
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="bg-red-50 p-6 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 text-lg">Error loading tickets</h3>
            <p className="mt-2 text-red-700">There was a problem loading your tickets. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center bg-red-600 hover:bg-red-700 shadow-sm mt-4 px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mt-15 py-8 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-6">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center">
            <div>
              <h1 className="font-bold text-gray-900 text-2xl">Support Tickets</h1>
              <p className="mt-1 text-gray-600">View and manage your support requests.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <a 
                href="/dashboard/tickets/new" 
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm"
              >
                New Ticket
              </a>
            </div>
          </div>
        </div>
        
        <TicketsTable 
          tickets={data?.tickets} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
}

// Main Tickets Page
export default function TicketsPage() {
  return (
    <SessionProvider>
      <TicketsContent />
    </SessionProvider>
  );
}