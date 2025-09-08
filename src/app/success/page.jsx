// app/success/page.jsx
"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan_id');
  const userId = searchParams.get('user_id');
  const setupFee = searchParams.get('setup_fee');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || !planId || !userId) {
      setError('Missing required parameters in URL');
      setLoading(false);
      return;
    }

    // Fetch order details using the session ID
    const fetchOrder = async () => {
      try {
        // Add a small delay to ensure Stripe has processed the payment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(`/api/success?session_id=${sessionId}&plan_id=${planId}&user_id=${userId}&setup_fee=${setupFee}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to process order');
        }
        
        setOrder(data.order);
        
        // Dispatch event to notify navbar of session update
        window.dispatchEvent(new CustomEvent('session-updated', { 
          detail: { 
            action: 'role-updated', 
            timestamp: Date.now() 
          } 
        }));
      } catch (err) {
        setError(err.message);
        console.error('Error processing success:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, planId, userId, setupFee]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center bg-gray-50 min-h-screen">
        <div className="bg-white shadow-lg p-8 rounded-xl max-w-md text-center">
          <div className="inline-block mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <h2 className="mb-2 font-semibold text-gray-800 text-xl">Processing Your Order</h2>
          <p className="text-gray-600">We're setting up your service and confirming your installation details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center bg-gray-50 min-h-screen">
        <div className="bg-white shadow-lg p-8 rounded-xl max-w-md text-center">
          <svg className="mx-auto mb-4 w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mb-2 font-semibold text-red-600 text-xl">Order Processing Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full text-white transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/plans" 
              className="block text-blue-600 hover:text-blue-800"
            >
              Back to Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg mt-10 p-8 rounded-xl max-w-md text-center">
        <svg className="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        
        <h1 className="mb-2 font-bold text-gray-800 text-2xl">Order Confirmed!</h1>
        <p className="mb-6 text-gray-600">Thank you for choosing our service. Your order has been successfully processed.</p>
        
        {order && (
          <div className="bg-gray-50 mb-6 p-4 rounded-lg text-sm text-left">
            <h3 className="mb-2 font-semibold text-gray-800">Order Details:</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{order.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-xs">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Link 
            href="/dashboard/overview" 
            className="block bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] px-6 py-3 rounded-lg font-medium text-white transition-all duration-200"
          >
            Go to Dashboard
          </Link>
          
          <p className="text-gray-500 text-sm">
            You'll receive a confirmation email with installation details shortly.
          </p>
        </div>
      </div>
    </div>
  );
}