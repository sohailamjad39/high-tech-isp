// app/plans/page.jsx
"use client"
import PlansCard from '../components/ui/PlansCard';
import { useState, useEffect, useRef } from 'react';

// Mock data - this would come from your database in a real app
const mockPlans = [
  {
    _id: '1',
    name: 'Basic Fiber',
    slug: 'basic-fiber',
    speedMbps: { download: 100, upload: 50 },
    dataCapGB: null,
    priceMonthly: 49.99,
    priceYearly: 549.89,
    currency: 'USD',
    contractMonths: 0,
    features: [
      '100 Mbps Download Speed',
      '50 Mbps Upload Speed',
      'Unlimited Data',
      'Free Router',
      '24/7 Support'
    ],
    description: 'Perfect for everyday browsing and streaming',
    active: true,
    tags: [],
    priority: 1,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: true
  },
  {
    _id: '2',
    name: 'Standard Fiber',
    slug: 'standard-fiber',
    speedMbps: { download: 300, upload: 150 },
    dataCapGB: null,
    priceMonthly: 69.99,
    priceYearly: 769.89,
    currency: 'USD',
    contractMonths: 0,
    features: [
      '300 Mbps Download Speed',
      '150 Mbps Upload Speed',
      'Unlimited Data',
      'Free Router',
      'Priority Support',
      'Gaming Optimization'
    ],
    description: 'Ideal for families and heavy streamers',
    active: true,
    tags: ['popular'],
    priority: 2,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: true
  },
  {
    _id: '3',
    name: 'Premium Fiber',
    slug: 'premium-fiber',
    speedMbps: { download: 1000, upload: 500 },
    dataCapGB: null,
    priceMonthly: 99.99,
    priceYearly: 1099.89,
    currency: 'USD',
    contractMonths: 0,
    features: [
      '1 Gbps Download Speed',
      '500 Mbps Upload Speed',
      'Unlimited Data',
      'Advanced Router',
      'Priority Support',
      'Gaming Optimization',
      '4K Streaming Priority',
      'Dedicated Line'
    ],
    description: 'Ultimate speed for power users',
    active: true,
    tags: [],
    priority: 3,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: true
  },
  {
    _id: '4',
    name: 'Business Fiber',
    slug: 'business-fiber',
    speedMbps: { download: 500, upload: 500 },
    dataCapGB: null,
    priceMonthly: 149.99,
    priceYearly: 1599.89,
    currency: 'USD',
    contractMonths: 0,
    features: [
      '500 Mbps Symmetric Speed',
      'Static IP Address',
      'Dedicated Support Line',
      'SLA 99.9% Uptime',
      'Advanced Security',
      'Business-Class Equipment'
    ],
    description: 'Reliable connectivity for your business',
    active: true,
    tags: ['business'],
    priority: 4,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: true
  },
  {
    _id: '5',
    name: 'Gamer Fiber',
    slug: 'gamer-fiber',
    speedMbps: { download: 1000, upload: 1000 },
    dataCapGB: null,
    priceMonthly: 129.99,
    priceYearly: 1399.89,
    currency: 'USD',
    contractMonths: 0,
    features: [
      '1 Gbps Symmetric Speed',
      'Low Latency Optimization',
      'Priority Queuing',
      'Cloud Gaming Ready',
      'Advanced Router',
      '24/7 Support'
    ],
    description: 'Ultra-low latency for competitive gaming',
    active: true,
    tags: ['gamer'],
    priority: 5,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: true
  }
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visiblePlans, setVisiblePlans] = useState(1);
  const plansContainerRef = useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  // Simulate loading data from database
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Update visible plans based on screen size
  useEffect(() => {
    const updateVisiblePlans = () => {
      if (window.innerWidth < 640) {
        setVisiblePlans(1);
      } else if (window.innerWidth < 1024) {
        setVisiblePlans(2);
      } else {
        setVisiblePlans(3);
      }
    };

    updateVisiblePlans();
    window.addEventListener('resize', updateVisiblePlans);
    return () => window.removeEventListener('resize', updateVisiblePlans);
  }, []);

  // Filter and sort active plans
  const activePlans = mockPlans
    .filter(plan => plan.active)
    .sort((a, b) => a.priority - b.priority);

  const totalPlans = activePlans.length;

  // Calculate max index based on visible plans
  const maxIndex = Math.max(0, totalPlans - visiblePlans);

  // Navigate to previous plan
  const goToPrev = () => {
    setCurrentIndex(prev => {
      const newIndex = Math.max(0, prev - 1);
      return newIndex;
    });
  };

  // Navigate to next plan
  const goToNext = () => {
    setCurrentIndex(prev => {
      const newIndex = Math.min(maxIndex, prev + 1);
      return newIndex;
    });
  };

  // Handle dot indicator click
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Check for overflow gradients
  useEffect(() => {
    if (totalPlans <= visiblePlans) {
      setShowLeftGradient(false);
      setShowRightGradient(false);
      return;
    }
    
    setShowLeftGradient(currentIndex > 0);
    setShowRightGradient(currentIndex < maxIndex);
  }, [currentIndex, totalPlans, visiblePlans, maxIndex]);

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    console.log(`Selected plan: ${plan.name}`);
  };

  return (
    <div className="min-h-screen">

      {/* Content */}
      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 max-w-7xl">
        <div className="mb-16 text-center">
          <h1 className="mb-6 font-bold text-gray-800 text-2xl md:text-5xl lg:text-6xl">
            Choose Your Perfect Plan
          </h1>
          <p className="mx-2 md:mx-auto max-w-3xl text-gray-600 text-lg md:text-xl">
            Lightning-fast fiber internet plans designed for every need and budget. 
            No contracts, no hidden fees, just incredible speeds.
          </p>
          
          {/* Comparison hint */}
          <div className="inline-flex items-center bg-sky-700 backdrop-blur-sm mx-2 md:mx-auto mt-8 px-4 py-2 border border-white/30 rounded-full text-gray-100 text-xs">
            <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            All plans include unlimited data and free equipment
          </div>
        </div>

        {/* Plans Carousel */}
        <div className="relative mx-auto max-w-7xl">
          {/* Mobile Layout - Arrows and cards in same row */}
          <div className="md:hidden flex items-center">
            {/* Left Arrow */}
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={`scale-50 rounded-full w-1 ${
                currentIndex === 0 
                  ? 'hidden' 
                  : 'shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 text-gray-700'
              }`}
              aria-label="Previous plan"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Plans Container */}
            <div className="flex-1 overflow-hidden scale-90">
              <div 
                ref={plansContainerRef}
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {isLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 px-4 w-full">
                      <div className="bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-white/20 rounded-2xl animate-pulse">
                        <div className="bg-gray-200 mb-4 rounded h-6"></div>
                        <div className="bg-gray-200 mb-6 rounded w-3/4 h-4"></div>
                        <div className="bg-gray-200 mb-6 rounded h-12"></div>
                        <div className="bg-gray-200 mb-8 rounded h-20"></div>
                        <div className="bg-gray-200 rounded h-12"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  activePlans.map((plan) => (
                    <div key={plan._id} className="flex-shrink-0 px-4 w-full">
                      <PlansCard 
                        plan={plan} 
                        onChoosePlan={handleChoosePlan}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              disabled={currentIndex === maxIndex}
              className={`scale-50 rounded-full w-3 ml-[-20] mr-2 ${
                currentIndex === maxIndex 
                  ? 'hidden' 
                  : 'shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 text-gray-700'
              }`}
              aria-label="Next plan"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            {/* Left Arrow */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrev}
                className="hidden top-1/2 left-0 z-20 absolute md:flex bg-white/80 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm -ml-4 p-2 border border-white/30 rounded-full transition-all -translate-y-1/2 duration-200"
                aria-label="Previous plan"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Plans Container with gradient overflow */}
            <div className="relative">
              {/* Left gradient overlay */}
              {showLeftGradient && (
                <div className="top-0 bottom-0 left-0 z-10 absolute w-15 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent"></div>
                </div>
              )}
              
              {/* Right gradient overlay */}
              {showRightGradient && (
                <div className="top-0 right-0 bottom-0 z-10 absolute w-15 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-l from-white/80 to-transparent"></div>
                </div>
              )}
              
              {/* Scrollable container */}
              <div className="py-15 overflow-hidden">
                <div 
                  ref={plansContainerRef}
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${(currentIndex * 100) / visiblePlans}%)` }}
                >
                  {isLoading ? (
                    // Skeleton loading state
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex-shrink-0 px-4 w-full md:w-1/2 lg:w-1/3">
                        <div className="bg-white/80 shadow-lg backdrop-blur-sm p-6 border border-white/20 rounded-2xl animate-pulse">
                          <div className="bg-gray-200 mb-4 rounded h-6"></div>
                          <div className="bg-gray-200 mb-6 rounded w-3/4 h-4"></div>
                          <div className="bg-gray-200 mb-6 rounded h-12"></div>
                          <div className="bg-gray-200 mb-8 rounded h-20"></div>
                          <div className="bg-gray-200 rounded h-12"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    activePlans.map((plan) => (
                      <div key={plan._id} className="flex-shrink-0 px-4 w-full md:w-1/2 lg:w-1/3">
                        <PlansCard 
                          plan={plan} 
                          onChoosePlan={handleChoosePlan}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            {currentIndex < maxIndex && (
              <button
                onClick={goToNext}
                className="hidden top-1/2 right-0 z-20 absolute md:flex bg-white/80 hover:bg-white shadow-lg hover:shadow-xl backdrop-blur-sm -mr-4 p-2 border border-white/30 rounded-full transition-all -translate-y-1/2 duration-200"
                aria-label="Next plan"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile swipe indicators */}
          <div className="md:hidden flex justify-center mt-8">
            {activePlans.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`mx-1 w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Desktop indicator dots */}
          {totalPlans > visiblePlans && (
            <div className="hidden md:flex justify-center space-x-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-blue-600 w-4 h-2' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add-ons section */}
        <div className="mx-10 md:mx-0 mt-24 text-center">
          <h2 className="mb-8 font-bold text-gray-800 text-2xl md:text-3xl">Add Extra Features</h2>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto max-w-4xl">
            {[
              { name: 'Static IP', price: '$5/month', desc: 'Dedicated IP address for remote access' },
              { name: 'Enhanced Security', price: '$8/month', desc: 'Advanced firewall and malware protection' },
              { name: 'Priority Support', price: '$10/month', desc: '24/7 direct line to senior technicians' }
            ].map((addon, index) => (
              <div key={index} className="bg-white/60 shadow-xl backdrop-blur-sm p-5 border border-black/5 rounded-xl">
                <h3 className="mb-2 font-bold text-gray-800">{addon.name}</h3>
                <p className="mb-2 font-bold text-blue-600 text-2xl">{addon.price}</p>
                <p className="text-gray-600 text-sm">{addon.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-10 md:mx-auto mt-24 max-w-4xl">
          <h2 className="mb-12 font-bold text-gray-800 text-xl md:text-3xl text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Are there any installation fees?",
                a: "No, we offer free installation for all new customers. Our technician will set up your equipment at no additional cost."
              },
              {
                q: "Can I upgrade my plan later?",
                a: "Absolutely! You can upgrade or downgrade your plan at any time with no penalties. Changes take effect at the start of your next billing cycle."
              },
              {
                q: "What equipment do I need?",
                a: "We provide a high-performance router at no additional cost. For optimal performance, we recommend using our approved equipment."
              },
              {
                q: "Is there a contract?",
                a: "All our plans are month-to-month with no long-term contracts. You can cancel anytime with 30 days notice."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/60 shadow-xl backdrop-blur-sm p-6 border border-black/5 rounded-xl text-xs md:text-lg">
                <h3 className="mb-3 font-bold text-gray-800">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}