// app/dashboard/billing/page.jsx
"use client"
import { useEffect, useState } from 'react';

// Status badge component
function StatusBadge({ status }) {
  const colors = {
    paid: 'bg-green-100 text-green-800',
    awaiting_payment: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Transaction Type Badge
function TypeBadge({ type }) {
  const colors = {
    'New Subscription': 'bg-blue-100 text-blue-800',
    'Plan Upgrade': 'bg-purple-100 text-purple-800',
    'Plan Downgrade': 'bg-yellow-100 text-yellow-800',
    'Setup Fee': 'bg-green-100 text-green-800',
    'Plan Change': 'bg-indigo-100 text-indigo-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {type}
    </span>
  );
}

// Billing Table Component
function BillingTable({ bills, loading }) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Billing History</h3>
        </div>
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="divide-y divide-gray-200 min-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Date</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Description</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Plan</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Speed</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Amount</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Type</th>
                  <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-20 h-4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-32 h-4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-24 h-4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-20 h-6 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="bg-gray-200 rounded w-20 h-6 animate-pulse"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Billing History</h3>
        </div>
        <div className="p-5">
          <div className="py-10 text-center">
            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 font-medium text-gray-900 text-sm">No billing records</h3>
            <p className="mt-1 text-gray-500 text-sm">You haven't made any payments yet.</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/plans'}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm"
              >
                Choose a Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Billing History</h3>
      </div>
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 min-w-full">
            <thead>
              <tr>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Date</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Description</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Plan</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Speed</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Amount</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Type</th>
                <th className="bg-gray-50 px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {new Date(bill.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {bill.description}
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {bill.plan}
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    {bill.speed}
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    <span className="font-medium">${bill.amount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={bill.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={bill.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  
  const pages = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-between items-center bg-white px-4 sm:px-6 py-3 border-gray-200 border-t">
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <div className="hidden sm:flex sm:items-center sm:ml-4">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                page === pagination.currentPage
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 ml-3 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ bills }) {
  if (!bills || bills.length === 0) return null;
  
  // Calculate totals
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidCount = bills.filter(bill => bill.status === 'paid').length;
  const pendingCount = bills.filter(bill => bill.status === 'awaiting_payment').length;
  
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Summary</h3>
      </div>
      <div className="p-5">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Total Amount</p>
            <p className="mt-1 font-bold text-gray-900 text-2xl">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Paid Transactions</p>
            <p className="mt-1 font-bold text-green-600 text-2xl">{paidCount}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <p className="mt-1 font-bold text-yellow-600 text-2xl">{pendingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Bills Page
export default function BillsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/billing?page=${currentPage}&limit=10`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch billing data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.message || 'Failed to fetch billing data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && (!data?.pagination || page <= data.pagination.totalPages)) {
      setCurrentPage(page);
    }
  };

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="bg-red-50 p-6 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 mt-4 px-4 py-2 rounded-lg text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mt-15 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="font-bold text-gray-900 text-2xl">Billing History</h1>
          <p className="mt-1 text-gray-500">View your payment history and transaction details.</p>
        </div>

        <div className="space-y-6">
          <SummaryCard bills={data?.bills} />
          
          <BillingTable bills={data?.bills} loading={loading} />
          
          {data?.pagination && (
            <Pagination 
              pagination={data.pagination} 
              onPageChange={handlePageChange} 
            />
          )}
        </div>
      </div>
    </div>
  );
}