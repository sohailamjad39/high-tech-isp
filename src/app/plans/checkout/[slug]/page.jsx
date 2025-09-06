// app/plans/checkout/[slug]/page.jsx
"use client"
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function CheckoutPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');

  // Use React.use() to properly unwrap the params promise
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  // Fetch session from API instead of using useSession
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setSession(data.user);
          setAuthStatus('authenticated');
        } else {
          setSession(null);
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        setSession(null);
        setAuthStatus('unauthenticated');
      }
    };

    fetchSession();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      const callbackUrl = `/plans/checkout/${slug}`;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [authStatus, router, slug]);

  // Fetch plan details
  useEffect(() => {
    if (authStatus === 'authenticated') {
      const fetchPlan = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/plans`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch plans');
          }
          
          const data = await response.json();
          
          if (data.success) {
            const selectedPlan = data.plans.find(p => p.slug === slug);
            if (selectedPlan) {
              setPlan(selectedPlan);
            } else {
              setError('Plan not found');
            }
          } else {
            throw new Error(data.message || 'Failed to fetch plans');
          }
        } catch (err) {
          setError(err.message);
          console.error('Error fetching plan:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchPlan();
    }
  }, [slug, authStatus]);

  if (authStatus === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="font-bold text-red-600 text-2xl">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button 
            onClick={() => router.push('/plans')}
            className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-lg text-white"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="font-bold text-red-600 text-2xl">Plan Not Found</h2>
          <p className="mt-2 text-gray-600">The requested plan could not be found.</p>
          <button 
            onClick={() => router.push('/plans')}
            className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-lg text-white"
          >
            View All Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="bg-white shadow-xl mt-10 rounded-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-gray-200 border-b">
            <h1 className="font-bold text-gray-900 text-2xl">Checkout</h1>
            <p className="mt-1 text-gray-600">Complete your order for {plan.name}</p>
          </div>
          
          <div className="p-8">
            {/* Plan Overview */}
            <div className="bg-blue-50 mb-6 p-6 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-blue-900">Plan Summary</h3>
                  <p className="mt-1 text-blue-700 text-sm">
                    You're ordering the <strong>{plan.name}</strong> plan with {plan.speedMbps.download} Mbps download and {plan.speedMbps.upload} Mbps upload speeds.
                  </p>
                </div>
              </div>
            </div>

            {/* Speed Details */}
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-semibold text-gray-800 text-center">Speed</h4>
                <div className="text-center">
                  <div className="mb-2 font-bold text-blue-600 text-3xl">{plan.speedMbps.download} Mbps</div>
                  <div className="text-gray-600 text-sm">Download</div>
                </div>
                <div className="bg-gray-300 my-4 h-px"></div>
                <div className="text-center">
                  <div className="mb-2 font-bold text-blue-600 text-3xl">{plan.speedMbps.upload} Mbps</div>
                  <div className="text-gray-600 text-sm">Upload</div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="mb-4 font-semibold text-gray-800 text-center">Pricing</h4>
                <div className="text-center">
                  <div className="mb-2 font-bold text-green-600 text-3xl">${plan.priceMonthly}</div>
                  <div className="text-gray-600 text-sm">per month</div>
                  {plan.priceYearly && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">or </span>
                      <span className="font-medium">${plan.priceYearly}/year</span>
                      <span className="text-gray-500"> (save ${(plan.priceMonthly * 12 - plan.priceYearly).toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Features List */}
            <div className="mb-8">
              <h3 className="mb-4 font-semibold text-gray-800">Complete Features List</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg className="flex-shrink-0 mr-2 w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No features listed for this plan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Plan Details */}
            <div className="mb-8">
              <h3 className="mb-4 font-semibold text-gray-800">Plan Details</h3>
              <div className="space-y-3">
                {plan.description && (
                  <div className="flex justify-between py-2 border-gray-100 border-b">
                    <span className="font-medium text-gray-700">Description</span>
                    <span className="text-gray-600">{plan.description}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-gray-100 border-b">
                  <span className="font-medium text-gray-700">Data Cap</span>
                  <span className="text-gray-600">{plan.dataCapGB === null ? 'Unlimited' : `${plan.dataCapGB} GB`}</span>
                </div>
                
                <div className="flex justify-between py-2 border-gray-100 border-b">
                  <span className="font-medium text-gray-700">Contract</span>
                  <span className="text-gray-600">{plan.contractMonths === 0 ? 'No contract' : `${plan.contractMonths} months`}</span>
                </div>
                
                <div className="flex justify-between py-2 border-gray-100 border-b">
                  <span className="font-medium text-gray-700">Equipment</span>
                  <span className="text-gray-600">{plan.equipmentIncluded ? 'Free router included' : 'Equipment not included'}</span>
                </div>
                
                {plan.setupFee > 0 && (
                  <div className="flex justify-between py-2 border-gray-100 border-b">
                    <span className="font-medium text-gray-700">Setup Fee</span>
                    <span className="text-gray-600">${plan.setupFee}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 mb-6 p-6 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-800">Pricing Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Price</span>
                  <span className="font-medium">${plan.priceMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Setup Fee</span>
                  <span className="font-medium">${plan.setupFee}</span>
                </div>
                <div className="mt-3 pt-3 border-gray-200 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Due Today</span>
                    <span>${(plan.priceMonthly + plan.setupFee).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="space-y-4">
              <button
                type="button"
                className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full font-medium text-white text-sm hover:scale-105 transition-all duration-200 transform"
                onClick={() => {
                  // This would integrate with your payment gateway
                  alert('Payment processing would happen here');
                }}
              >
                Pay ${plan.priceMonthly} and Activate Service
              </button>
              
              <p className="text-gray-500 text-xs text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}