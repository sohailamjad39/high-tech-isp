// app/admin/plan/[id]/edit/page.jsx
'use client'

import { useState, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter, useParams as useNextParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Components
import Sidebar from '@/app/components/admin/dashboard/Sidebar';
import SkeletonForm from '@/app/components/admin/SkeletonForm';

// Wrapper component for the edit page content
function EditPlanPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Extract plan ID from URL parameters using React.use()
  const params = useNextParams();
  
  // Use React.use() to handle the potentially async params in Next.js 13+
  const resolvedParams = typeof params === 'object' && params !== null ? params : {};
  const rawId = resolvedParams.id;
  const planId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : null;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    speedMbps: {
      download: '',
      upload: '',
    },
    dataCapGB: '',
    priceMonthly: '',
    priceYearly: '',
    currency: 'USD',
    contractMonths: '',
    features: [''],
    description: '',
    active: true,
    gatewayPriceIds: {
      stripe: {
        monthly: '',
        yearly: '',
      }
    },
    tags: [],
    priority: 0,
    trialDays: 0,
    setupFee: 0,
    equipmentIncluded: false
  });

  // Loading and error states
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate that we have a valid plan ID
  useEffect(() => {
    if (!planId) {
      console.error('No plan ID found in URL');
      router.push('/admin/plans');
      return;
    }
  }, [planId, router]);

  // Fetch plan data
  const { data: planData, isLoading: isFetching } = useQuery({
    queryKey: ['adminPlan', planId],
    queryFn: async () => {
      if (!planId) {
        throw new Error('Plan ID is required');
      }
      
      const response = await fetch(`/api/admin/plan/${planId}/edit`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push('/auth/login');
          return null;
        }
        throw new Error('Failed to fetch plan data');
      }
      
      const data = await response.json();
      return data.plan;
    },
    enabled: status === 'authenticated' && !!planId && ['admin', 'ops'].includes(session?.user?.role)
  });

  // Initialize form data when plan data is loaded
  useEffect(() => {
    if (planData) {
      setFormData({
        name: planData.name || '',
        slug: planData.slug || '',
        speedMbps: {
          download: planData.speedMbps?.download?.toString() || '',
          upload: planData.speedMbps?.upload?.toString() || ''
        },
        dataCapGB: planData.dataCapGB !== null ? planData.dataCapGB.toString() : '',
        priceMonthly: planData.priceMonthly?.toString() || '',
        priceYearly: planData.priceYearly?.toString() || '',
        currency: planData.currency || 'USD',
        contractMonths: planData.contractMonths?.toString() || '',
        features: Array.isArray(planData.features) && planData.features.length > 0 ? [...planData.features] : [''],
        description: planData.description || '',
        active: planData.active !== undefined ? planData.active : true,
        gatewayPriceIds: {
          stripe: {
            monthly: planData.gatewayPriceIds?.stripe?.monthly || '',
            yearly: planData.gatewayPriceIds?.stripe?.yearly || ''
          }
        },
        tags: Array.isArray(planData.tags) ? [...planData.tags] : [],
        priority: planData.priority?.toString() || '0',
        trialDays: planData.trialDays?.toString() || '0',
        setupFee: planData.setupFee?.toString() || '0',
        equipmentIncluded: planData.equipmentIncluded !== undefined ? planData.equipmentIncluded : false
      });
      setIsLoading(false);
    }
  }, [planData]);

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties using dot notation
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'currency') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle nested object changes (speedMbps)
  const handleSpeedChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      speedMbps: {
        ...prev.speedMbps,
        [field]: value
      }
    }));
  };

  // Handle features array
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  // Handle tags
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.speedMbps.download) newErrors.downloadSpeed = 'Download speed is required';
    if (!formData.speedMbps.upload) newErrors.uploadSpeed = 'Upload speed is required';
    if (!formData.priceMonthly) newErrors.priceMonthly = 'Monthly price is required';
    if (!formData.priceYearly) newErrors.priceYearly = 'Yearly price is required';
    if (!formData.contractMonths) newErrors.contractMonths = 'Contract length is required';
    
    // Name length
    if (formData.name.length > 100) newErrors.name = 'Name cannot exceed 100 characters';
    
    // Slug format
    if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase and contain only letters, numbers, and hyphens';
    }
    
    // Speed ranges
    const download = Number(formData.speedMbps.download);
    const upload = Number(formData.speedMbps.upload);
    
    if (download < 1 || download > 10000) {
      newErrors.downloadSpeed = 'Download speed must be between 1 and 10,000 Mbps';
    }
    
    if (upload < 1 || upload > 10000) {
      newErrors.uploadSpeed = 'Upload speed must be between 1 and 10,000 Mbps';
    }
    
    // Price validation
    const monthly = Number(formData.priceMonthly);
    const yearly = Number(formData.priceYearly);
    
    if (monthly < 0) newErrors.priceMonthly = 'Monthly price cannot be negative';
    if (yearly < 0) newErrors.priceYearly = 'Yearly price cannot be negative';
    
    // Currency format
    if (formData.currency.length !== 3) newErrors.currency = 'Currency code must be exactly 3 characters';
    
    // Contract months
    const contract = Number(formData.contractMonths);
    if (contract < 0 || contract > 36) {
      newErrors.contractMonths = 'Contract length must be between 0 and 36 months';
    }
    
    // Data cap
    const dataCap = formData.dataCapGB ? Number(formData.dataCapGB) : null;
    if (dataCap !== null && dataCap < 0) {
      newErrors.dataCapGB = 'Data cap cannot be negative';
    }
    
    // Priority
    const priority = Number(formData.priority);
    if (priority < 0 || priority > 11) {
      newErrors.priority = 'Priority must be between 0 and 11';
    }
    
    // Trial days
    const trialDays = Number(formData.trialDays);
    if (trialDays < 0 || trialDays > 30) {
      newErrors.trialDays = 'Trial days must be between 0 and 30';
    }
    
    // Setup fee
    const setupFee = Number(formData.setupFee);
    if (setupFee < 0) {
      newErrors.setupFee = 'Setup fee cannot be negative';
    }
    
    // Description length
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    // Tags validation
    const validTags = ['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'];
    const invalidTags = formData.tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
      newErrors.tags = `Invalid tags selected`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for updating the plan
  const updatePlanMutation = useMutation({
    mutationFn: async (planData) => {
      if (!planId) {
        throw new Error('Plan ID is required');
      }
      
      const response = await fetch(`/api/admin/plan/${planId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          router.push('/auth/login');
          return null;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update plan');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (!data) return;
      
      // Invalidate plans query to refresh the list
      queryClient.invalidateQueries(['adminPlans']);
      queryClient.invalidateQueries(['adminPlan', planId]);
      
      // Show success message
      alert('Service plan updated successfully!');
      
      // Redirect to plans list
      router.push('/admin/plans');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      setSubmitError(error.message || 'Failed to update service plan. Please try again.');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!planId) {
      setSubmitError('Plan ID is missing');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      speedMbps: {
        download: Number(formData.speedMbps.download),
        upload: Number(formData.speedMbps.upload)
      },
      dataCapGB: formData.dataCapGB ? Number(formData.dataCapGB) : null,
      priceMonthly: Number(formData.priceMonthly),
      priceYearly: Number(formData.priceYearly),
      contractMonths: Number(formData.contractMonths),
      priority: Number(formData.priority),
      trialDays: Number(formData.trialDays),
      setupFee: Number(formData.setupFee)
    };
    
    // Submit the form data
    updatePlanMutation.mutate(submitData);
  };

  // Don't show anything until we determine what to display
  if (status === 'loading' || isLoading || isFetching) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="mb-8">
            <h1 className="font-semibold text-gray-900 text-2xl">Edit Service Plan</h1>
            <p className="mt-1 text-gray-500 text-sm">
              Update internet service plan details
            </p>
          </div>
          <SkeletonForm columns={2} rows={12} />
        </div>
      </div>
    );
  }

  if (!planId) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="bg-red-50 mb-6 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800">Invalid URL</h3>
                <div className="mt-2 text-red-700">
                  <p>The URL does not contain a valid plan ID.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/plans')}
                    className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md font-medium text-red-600 cursor-pointer"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="flex mt-15">
        <Sidebar />
        <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-auto">
          <div className="bg-red-50 mb-6 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800">Error loading plan</h3>
                <div className="mt-2 text-red-700">
                  <p>Could not find the service plan with ID: {planId}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/admin/plans')}
                    className="bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md font-medium text-red-600 cursor-pointer"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-15">
      <Sidebar />
      <div className="mx-auto px-2 sm:px-2 md:px-3 py-8 w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center">
            <div>
              <h1 className="font-semibold text-gray-900 text-2xl">Edit Service Plan</h1>
              <p className="mt-1 text-gray-500 text-sm">
                Update internet service plan details
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm mt-4 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-gray-700 text-sm cursor-pointer"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Plans
            </button>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 mb-6 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 10-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-red-800">Error updating plan</h3>
                <div className="mt-2 text-red-700">
                  <p>{submitError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <h2 className="mb-6 font-medium text-gray-900 text-lg">Basic Information</h2>
            
            <div className="gap-x-6 gap-y-6 grid grid-cols-1 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block font-medium text-gray-700 text-sm">
                  Plan Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., Premium Fiber 500"
                />
                {errors.name && <p className="mt-1 text-red-600 text-sm">{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block font-medium text-gray-700 text-sm">
                  Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.slug ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., premium-fiber-500"
                />
                {errors.slug && <p className="mt-1 text-red-600 text-sm">{errors.slug}</p>}
                <p className="mt-1 text-gray-500 text-xs">Lowercase letters, numbers, and hyphens only. Used in URLs.</p>
              </div>

              {/* Download Speed */}
              <div>
                <label htmlFor="downloadSpeed" className="block font-medium text-gray-700 text-sm">
                  Download Speed (Mbps) *
                </label>
                <input
                  type="number"
                  id="downloadSpeed"
                  name="speedMbps.download"
                  value={formData.speedMbps.download}
                  onChange={(e) => handleSpeedChange('download', e.target.value)}
                  className={`mt-1 block w-full border ${errors.downloadSpeed ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., 500"
                  min="1"
                  max="10000"
                />
                {errors.downloadSpeed && <p className="mt-1 text-red-600 text-sm">{errors.downloadSpeed}</p>}
              </div>

              {/* Upload Speed */}
              <div>
                <label htmlFor="uploadSpeed" className="block font-medium text-gray-700 text-sm">
                  Upload Speed (Mbps) *
                </label>
                <input
                  type="number"
                  id="uploadSpeed"
                  name="speedMbps.upload"
                  value={formData.speedMbps.upload}
                  onChange={(e) => handleSpeedChange('upload', e.target.value)}
                  className={`mt-1 block w-full border ${errors.uploadSpeed ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., 500"
                  min="1"
                  max="10000"
                />
                {errors.uploadSpeed && <p className="mt-1 text-red-600 text-sm">{errors.uploadSpeed}</p>}
              </div>

              {/* Monthly Price */}
              <div>
                <label htmlFor="priceMonthly" className="block font-medium text-gray-700 text-sm">
                  Monthly Price ($) *
                </label>
                <div className="flex shadow-sm mt-1 rounded-md">
                  <span className="inline-flex items-center bg-gray-50 px-3 border border-gray-300 border-r-0 rounded-l-md text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    id="priceMonthly"
                    name="priceMonthly"
                    value={formData.priceMonthly}
                    onChange={handleChange}
                    step="0.01"
                    className={`focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md ${errors.priceMonthly ? 'border-red-300' : 'border-gray-300'} min-w-0 sm:text-sm`}
                    placeholder="e.g., 79.99"
                  />
                </div>
                {errors.priceMonthly && <p className="mt-1 text-red-600 text-sm">{errors.priceMonthly}</p>}
              </div>

              {/* Yearly Price */}
              <div>
                <label htmlFor="priceYearly" className="block font-medium text-gray-700 text-sm">
                  Yearly Price ($) *
                </label>
                <div className="flex shadow-sm mt-1 rounded-md">
                  <span className="inline-flex items-center bg-gray-50 px-3 border border-gray-300 border-r-0 rounded-l-md text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    id="priceYearly"
                    name="priceYearly"
                    value={formData.priceYearly}
                    onChange={handleChange}
                    step="0.01"
                    className={`focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md ${errors.priceYearly ? 'border-red-300' : 'border-gray-300'} min-w-0 sm:text-sm`}
                    placeholder="e.g., 799.99"
                  />
                </div>
                {errors.priceYearly && <p className="mt-1 text-red-600 text-sm">{errors.priceYearly}</p>}
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block font-medium text-gray-700 text-sm">
                  Currency *
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
                {errors.currency && <p className="mt-1 text-red-600 text-sm">{errors.currency}</p>}
              </div>

              {/* Contract Length */}
              <div>
                <label htmlFor="contractMonths" className="block font-medium text-gray-700 text-sm">
                  Contract Length (months) *
                </label>
                <input
                  type="number"
                  id="contractMonths"
                  name="contractMonths"
                  value={formData.contractMonths}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.contractMonths ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., 12"
                  min="0"
                  max="36"
                />
                {errors.contractMonths && <p className="mt-1 text-red-600 text-sm">{errors.contractMonths}</p>}
              </div>

              {/* Data Cap */}
              <div>
                <label htmlFor="dataCapGB" className="block font-medium text-gray-700 text-sm">
                  Data Cap (GB)
                </label>
                <input
                  type="number"
                  id="dataCapGB"
                  name="dataCapGB"
                  value={formData.dataCapGB}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.dataCapGB ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., 1000 (leave empty for unlimited)"
                  min="0"
                />
                {errors.dataCapGB && <p className="mt-1 text-red-600 text-sm">{errors.dataCapGB}</p>}
              </div>

              {/* Trial Days */}
              <div>
                <label htmlFor="trialDays" className="block font-medium text-gray-700 text-sm">
                  Trial Period (days)
                </label>
                <input
                  type="number"
                  id="trialDays"
                  name="trialDays"
                  value={formData.trialDays}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.trialDays ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="e.g., 7"
                  min="0"
                  max="30"
                />
                {errors.trialDays && <p className="mt-1 text-red-600 text-sm">{errors.trialDays}</p>}
              </div>

              {/* Setup Fee */}
              <div>
                <label htmlFor="setupFee" className="block font-medium text-gray-700 text-sm">
                  Setup Fee ($)
                </label>
                <div className="flex shadow-sm mt-1 rounded-md">
                  <span className="inline-flex items-center bg-gray-50 px-3 border border-gray-300 border-r-0 rounded-l-md text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    id="setupFee"
                    name="setupFee"
                    value={formData.setupFee}
                    onChange={handleChange}
                    step="0.01"
                    className={`focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md ${errors.setupFee ? 'border-red-300' : 'border-gray-300'} min-w-0 sm:text-sm`}
                    placeholder="e.g., 99.99"
                    min="0"
                  />
                </div>
                {errors.setupFee && <p className="mt-1 text-red-600 text-sm">{errors.setupFee}</p>}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block font-medium text-gray-700 text-sm">
                  Priority
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.priority ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="0-11 (higher = more prominent)"
                  min="0"
                  max="11"
                />
                {errors.priority && <p className="mt-1 text-red-600 text-sm">{errors.priority}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Status
                </label>
                <div className="flex items-center mt-1">
                  <input
                    id="active"
                    name="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={handleChange}
                    className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="active" className="block ml-2 text-gray-700 text-sm">
                    Active (visible to customers)
                  </label>
                </div>
              </div>

              {/* Equipment Included */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Equipment
                </label>
                <div className="flex items-center mt-1">
                  <input
                    id="equipmentIncluded"
                    name="equipmentIncluded"
                    type="checkbox"
                    checked={formData.equipmentIncluded}
                    onChange={handleChange}
                    className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="equipmentIncluded" className="block ml-2 text-gray-700 text-sm">
                    Equipment included (router, etc.)
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 border-gray-200 border-t">
            <h2 className="mb-6 font-medium text-gray-900 text-lg">Additional Details</h2>
            
            <div className="gap-x-6 gap-y-6 grid grid-cols-1">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block font-medium text-gray-700 text-sm">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Detailed description of this service plan..."
                ></textarea>
                {errors.description && <p className="mt-1 text-red-600 text-sm">{errors.description}</p>}
                <p className="mt-1 text-gray-500 text-xs">Maximum 500 characters</p>
              </div>

              {/* Features */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Features
                </label>
                <div className="space-y-2 mt-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="block flex-1 shadow-sm px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full sm:text-sm"
                        placeholder={`Feature ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        disabled={formData.features.length <= 1}
                        className="inline-flex items-center bg-red-100 hover:bg-red-200 disabled:opacity-50 ml-2 px-3 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium text-red-700 text-sm leading-4 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center bg-blue-100 hover:bg-blue-200 mt-2 px-3 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-blue-700 text-sm leading-4 cursor-pointer"
                >
                  <svg className="mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Feature
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-medium text-gray-700 text-sm">
                  Tags
                </label>
                <div className="gap-3 grid grid-cols-2 sm:grid-cols-4 mt-2">
                  {['popular', 'best-value', 'premium', 'basic', 'business', 'enterprise', 'featured'].map((tag) => (
                    <div key={tag} className="flex items-center">
                      <input
                        id={`tag-${tag}`}
                        name={`tag-${tag}`}
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                      />
                      <label htmlFor={`tag-${tag}`} className="block ml-2 text-gray-700 text-sm capitalize">
                        {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.tags && <p className="mt-1 text-red-600 text-sm">{errors.tags}</p>}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 border-gray-200 border-t">
            <h2 className="mb-6 font-medium text-gray-900 text-lg">Gateway Integration</h2>
            
            <div className="gap-x-6 gap-y-6 grid grid-cols-1 sm:grid-cols-2">
              {/* Stripe Monthly Price ID */}
              <div>
                <label htmlFor="gatewayPriceIds.stripe.monthly" className="block font-medium text-gray-700 text-sm">
                  Stripe Monthly Price ID
                </label>
                <input
                  type="text"
                  id="gatewayPriceIds.stripe.monthly"
                  name="gatewayPriceIds.stripe.monthly"
                  value={formData.gatewayPriceIds.stripe.monthly}
                  onChange={handleChange}
                  className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full sm:text-sm"
                  placeholder="e.g., price_123456789"
                />
              </div>

              {/* Stripe Yearly Price ID */}
              <div>
                <label htmlFor="gatewayPriceIds.stripe.yearly" className="block font-medium text-gray-700 text-sm">
                  Stripe Yearly Price ID
                </label>
                <input
                  type="text"
                  id="gatewayPriceIds.stripe.yearly"
                  name="gatewayPriceIds.stripe.yearly"
                  value={formData.gatewayPriceIds.stripe.yearly}
                  onChange={handleChange}
                  className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full sm:text-sm"
                  placeholder="e.g., price_987654321"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end px-6 py-6 border-gray-200 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/plans')}
              className="inline-flex items-center bg-white hover:bg-gray-50 shadow-sm mr-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-gray-700 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-white text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="mr-2 -ml-1 w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main export that wraps the content with SessionProvider
export default function EditPlanPage() {
  return (
    <SessionProvider>
      <EditPlanPageContent />
    </SessionProvider>
  );
}