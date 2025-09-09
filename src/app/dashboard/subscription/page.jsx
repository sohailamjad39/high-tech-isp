// app/dashboard/subscription/page.jsx
"use client"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/app/components/ui/Toast';

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

// Confirmation Dialog Component
function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-transparent bg-opacity-50 shadow-2xl backdrop-blur-sm backdrop:blur-lg"
        onClick={onCancel}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-white shadow-black/30 shadow-xl mx-4 p-6 border-1 border-black/20 rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex justify-center items-center bg-yellow-100 rounded-full w-12 h-12">
            <svg 
              className="w-6 h-6 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        </div>
        
        <h3 className="mb-2 font-medium text-gray-900 text-lg text-center">{title}</h3>
        <p className="mb-6 text-gray-600 text-center">{message}</p>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Cancel Confirmation Dialog
function CancelConfirmationDialog({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-transparent bg-opacity-50 shadow-2xl backdrop-blur-sm backdrop:blur-lg"
        onClick={onCancel}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-white shadow-black/30 shadow-xl mx-4 p-6 border-1 border-black/20 rounded-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="flex justify-center items-center bg-red-100 rounded-full w-12 h-12">
            <svg 
              className="w-6 h-6 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </div>
        </div>
        
        <h3 className="mb-2 font-medium text-gray-900 text-lg text-center">Cancel Subscription</h3>
        <p className="mb-4 text-gray-600 text-center">
          Are you sure you want to cancel your subscription? This will permanently end your service.
        </p>
        
        <div className="bg-red-50 mb-4 p-4 rounded-lg">
          <h4 className="font-medium text-red-800 text-sm">Important Information</h4>
          <ul className="space-y-1 mt-2 text-red-700 text-sm">
            <li>• Your service will continue until the end of your current billing period</li>
            <li>• No refunds will be issued for the remaining time</li>
            <li>• You'll need to sign up again if you want service in the future</li>
          </ul>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors cursor-pointer"
          >
            Keep Subscription
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors cursor-pointer"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
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
function ActionButtons({ subscription, onAction, showToast }) {
  if (!subscription) return null;
  
  // State for confirmation dialogs
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  
  // Handle pause/resume service
  const handlePauseResume = async () => {
    try {
      const response = await fetch('/api/dashboard/subscription/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success toast
        showToast(
          subscription.status === 'paused' ? 'Service Resumed' : 'Service Paused',
          subscription.status === 'paused' ? 'Your internet service has been successfully resumed.' : 'Your internet service has been temporarily paused.',
          'success'
        );
        onAction();
      } else {
        // Show error toast
        showToast(
          'Operation Failed',
          result.message || 'Failed to update subscription status.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error pausing/resuming subscription:', error);
      // Show error toast
      showToast(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        'error'
      );
    }
  };
  
  // Handle cancel subscription
  const handleCancel = async () => {
    try {
      const response = await fetch('/api/dashboard/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success toast
        showToast(
          'Subscription Cancelled',
          'Your subscription has been successfully cancelled. Service will continue until the end of your billing period.',
          'success'
        );
        onAction();
      } else {
        // Show error toast
        showToast(
          'Cancellation Failed',
          result.message || 'Failed to cancel subscription.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      // Show error toast
      showToast(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        'error'
      );
    }
  };
  
  // Handle upgrade plan
  const handleUpgrade = () => {
    // Show info toast
    showToast(
      'Redirecting to Plans',
      'You will be redirected to the plans page to choose a new service plan.',
      'info'
    );
    // Redirect to plans page to upgrade
    setTimeout(() => {
      window.location.href = '/plans';
    }, 1500);
  };

  return (
    <>
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Manage Subscription</h3>
        </div>
        
        <div className="p-5">
          <div className="space-y-4">
            <button
              onClick={() => setShowPauseConfirm(true)}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors cursor-pointer"
            >
              {subscription.status === 'paused' ? 'Resume Service' : 'Pause Service'}
            </button>
            
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors cursor-pointer"
            >
              Cancel Subscription
            </button>
            
            <button
              onClick={() => setShowUpgradeConfirm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors cursor-pointer"
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
              className="mt-2 font-medium text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
            >
              Open a support ticket
            </button>
          </div>
        </div>
      </div>
      
      {/* Pause/Resume Confirmation */}
      <ConfirmationDialog
        isOpen={showPauseConfirm}
        title={subscription.status === 'paused' ? "Resume Service" : "Pause Service"}
        message={subscription.status === 'paused' ? 
          "Are you sure you want to resume your internet service? Your connection will be restored immediately." : 
          "Are you sure you want to pause your internet service? Your connection will be temporarily disabled."}
        confirmText={subscription.status === 'paused' ? "Resume Service" : "Pause Service"}
        onConfirm={async () => {
          setShowPauseConfirm(false);
          await handlePauseResume();
        }}
        onCancel={() => setShowPauseConfirm(false)}
      />
      
      {/* Cancel Confirmation */}
      <CancelConfirmationDialog
        isOpen={showCancelConfirm}
        onConfirm={async () => {
          setShowCancelConfirm(false);
          await handleCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />
      
      {/* Upgrade Confirmation */}
      <ConfirmationDialog
        isOpen={showUpgradeConfirm}
        title="Upgrade Plan"
        message="You'll be redirected to our plans page where you can choose a new plan and upgrade your service."
        confirmText="Go to Plans"
        onConfirm={() => {
          setShowUpgradeConfirm(false);
          handleUpgrade();
        }}
        onCancel={() => setShowUpgradeConfirm(false)}
      />
    </>
  );
}

// Fetch dashboard data function
const fetchDashboardData = async () => {
  const response = await fetch('/api/dashboard/subscription');
  
  if (!response.ok) {
    throw new Error('Failed to fetch subscription data');
  }
  
  const result = await response.json();
  
  if (result.success) {
    return {
      ...result,
      fetchedAt: Date.now() // Add timestamp for background refresh
    };
  } else {
    throw new Error(result.message || 'Failed to fetch subscription data');
  }
};

// Main Subscription Page
export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  // State for toast
  const [toast, setToast] = useState({
    show: false,
    heading: '',
    message: '',
    type: 'success'
  });
  
  // Use React Query for caching
  const { 
    data, 
    isLoading, 
    error,
    isFetching,
    refetch 
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1
  });

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFetching) {
        // Only refetch if data is stale
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const dataAge = Date.now() - (data?.fetchedAt || 0);
        
        if (dataAge > 5 * 60 * 1000) {
          refetch();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFetching, data, refetch]);

  // Handle action (refresh data)
  const handleAction = () => {
    refetch();
  };
  
  // Show toast function
  const showToast = (heading, message, type = 'success') => {
    setToast({
      show: true,
      heading,
      message,
      type
    });
  };

  if (isLoading) {
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
            <p className="mt-2 text-red-700">{error.message}</p>
            <button
              onClick={() => refetch()}
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
            <ActionButtons 
              subscription={data?.subscription} 
              onAction={handleAction}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          heading={toast.heading} 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}