// app/dashboard/subscription/page.jsx
"use client"
import { use, useEffect, useState } from 'react';

// Status badge component
function StatusBadge({ status }) {
  const colors = {
    trial: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    past_due: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Plan Details Component
function PlanDetails({ subscription }) {
  if (!subscription || !subscription.plan) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Service Plan</h3>
        </div>
        <div className="p-5">
          <div className="py-6 text-center">
            <p className="text-gray-500">No active plan</p>
            <button 
              onClick={() => window.location.href = '/plans'}
              className="bg-blue-600 hover:bg-blue-700 mt-4 px-6 py-2 rounded-lg w-full sm:w-auto text-white text-sm"
            >
              Choose a Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h3 className="font-medium text-gray-900 text-lg">Service Plan</h3>
          <StatusBadge status={subscription.status} />
        </div>
      </div>
      
      <div className="p-5">
        <h4 className="font-semibold text-gray-900 text-lg leading-tight">{subscription.plan.name}</h4>
        
        <div className="gap-4 grid grid-cols-2 mt-4">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Download</p>
            <p className="font-bold text-blue-600 text-lg">{subscription.plan.speedMbps?.download} Mbps</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Upload</p>
            <p className="font-bold text-blue-600 text-lg">{subscription.plan.speedMbps?.upload} Mbps</p>
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-gray-200 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Monthly Price</span>
            <span className="font-semibold text-lg">${subscription.plan.priceMonthly}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Details Component
function SubscriptionDetails({ subscription }) {
  if (!subscription) return null;
  
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Subscription Details</h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-gray-100 border-b">
            <span className="font-medium text-gray-700">Billing Cycle</span>
            <span className="text-gray-600 capitalize">{subscription.billingCycle}</span>
          </div>
          
          <div className="flex justify-between py-2 border-gray-100 border-b">
            <span className="font-medium text-gray-700">Current Period</span>
            <span className="text-gray-600">
              {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
          
          {subscription.trialEnd && (
            <div className="flex justify-between py-2 border-gray-100 border-b">
              <span className="font-medium text-gray-700">Trial Ends</span>
              <span className="text-gray-600">{new Date(subscription.trialEnd).toLocaleDateString()}</span>
            </div>
          )}
          
          {subscription.pausedUntil && (
            <div className="flex justify-between py-2 border-gray-100 border-b">
              <span className="font-medium text-gray-700">Paused Until</span>
              <span className="text-gray-600">{new Date(subscription.pausedUntil).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Features List Component
function FeaturesList({ subscription }) {
  if (!subscription || !subscription.plan || !subscription.plan.features || subscription.plan.features.length === 0) return null;
  
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Features</h3>
      </div>
      
      <div className="p-5">
        <ul className="space-y-3">
          {subscription.plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="flex-shrink-0 mt-0.5 mr-2 w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Description Component
function Description({ subscription }) {
  if (!subscription || !subscription.plan || !subscription.plan.description) return null;
  
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Description</h3>
      </div>
      
      <div className="p-5">
        <p className="text-gray-600 leading-relaxed">{subscription.plan.description}</p>
      </div>
    </div>
  );
}

// Action Buttons Component
function ActionButtons({ subscription }) {
  if (!subscription) return null;
  
  const handlePauseResume = () => {
    // Implementation for pause/resume functionality
    console.log('Pause/Resume functionality to be implemented');
  };
  
  const handleCancel = () => {
    // Implementation for cancel functionality
    console.log('Cancel functionality to be implemented');
  };
  
  const handleUpgrade = () => {
    // Implementation for upgrade functionality
    console.log('Upgrade functionality to be implemented');
  };

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Manage Subscription</h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-4">
          <button
            onClick={handlePauseResume}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors"
          >
            {subscription.status === 'paused' ? 'Resume Service' : 'Pause Service'}
          </button>
          
          <button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors"
          >
            Cancel Subscription
          </button>
          
          <button
            onClick={handleUpgrade}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
        
        <div className="bg-blue-50 mt-6 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 text-sm">Need help?</h4>
          <p className="mt-1 text-blue-700 text-sm">
            Contact our support team if you have any questions about your subscription.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/tickets/new'}
            className="mt-2 font-medium text-blue-600 hover:text-blue-800 text-sm"
          >
            Open a support ticket
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Subscription Page
export default function SubscriptionPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="bg-white shadow p-8 rounded-xl animate-pulse">
            <div className="bg-gray-200 mb-6 rounded w-1/4 h-6"></div>
            <div className="space-y-6">
              <div className="bg-gray-100 rounded-xl h-48"></div>
              <div className="bg-gray-100 rounded-xl h-64"></div>
              <div className="bg-gray-100 rounded-xl h-48"></div>
              <div className="bg-gray-100 rounded-xl h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="font-bold text-gray-900 text-2xl">Internet Plan</h1>
          <p className="mt-1 text-gray-500">Manage your internet subscription and view plan details.</p>
        </div>

        <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
          {/* Plan Details */}
          <div className="space-y-6 lg:col-span-2">
            <PlanDetails subscription={data?.subscription} />
            
            <SubscriptionDetails subscription={data?.subscription} />
            
            <FeaturesList subscription={data?.subscription} />
            
            <Description subscription={data?.subscription} />
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-6">
            <ActionButtons subscription={data?.subscription} />
          </div>
        </div>
      </div>
    </div>
  );
}