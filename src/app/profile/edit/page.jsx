// app/profile/edit/page.jsx
'use client'

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

// Icons
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

// Components
function ProfileCard({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

function ProfileHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="p-6 border-gray-200 border-b">
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Icon />
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">{title}</h2>
          {subtitle && <p className="mt-1 text-gray-600 text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, error, placeholder, required = false }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="font-medium text-gray-700 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full px-4 py-3 border ${
          error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors`}
      />
      {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
    </div>
  );
}

function CheckboxField({ label, name, checked, onChange, description }) {
  // Ensure checked is never undefined by providing a default value
  const isChecked = checked === undefined ? false : checked;
  
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 pt-1">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
        />
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor={name} className="font-medium text-gray-700 text-sm">
          {label}
        </label>
        {description && <p className="mt-1 text-gray-500 text-sm">{description}</p>}
      </div>
    </div>
  );
}

function Button({ children, type = "button", variant = "primary", onClick, disabled = false, loading = false }) {
  const baseClasses = "inline-flex items-center px-4 py-3 border border-transparent rounded-lg font-medium text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <>
          <svg className="mr-2 -ml-1 w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </>
      ) : children}
    </button>
  );
}

function SuccessMessage({ message, onClose }) {
  return (
    <div className="bg-green-50 mb-6 p-4 border border-green-200 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="font-medium text-green-800 text-sm">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className="inline-flex bg-green-50 hover:bg-green-100 p-1.5 rounded-md focus:outline-none text-green-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message, onClose }) {
  return (
    <div className="bg-red-50 mb-6 p-4 border border-red-200 rounded-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-red-800 text-sm">Error</h3>
          <p className="mt-1 text-red-700 text-sm">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className="inline-flex bg-red-50 hover:bg-red-100 p-1.5 rounded-md focus:outline-none text-red-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fetch profile data function
const fetchProfileData = async () => {
  const response = await fetch('/api/profile');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch profile data');
  }
  
  const data = await response.json();
  
  if (data.success && data.user) {
    return data.user;
  } else {
    throw new Error(data.message || 'Invalid response data');
  }
};

// Update profile data function
const updateProfileData = async (userData) => {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update profile data');
  }
  
  const data = await response.json();
  
  if (data.success && data.user) {
    return data.user;
  } else {
    throw new Error(data.message || 'Invalid response data');
  }
};

// Main Edit Profile Page component
function EditProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Initialize with proper default values to avoid undefined
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      language: 'en'
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load profile data
  useEffect(() => {
    if (status === 'authenticated') {
      const loadProfile = async () => {
        try {
          const user = await fetchProfileData();
          
          // Set form data with user data, ensuring boolean values are properly set
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || {
              label: '',
              line1: '',
              line2: '',
              city: '',
              state: '',
              postalCode: '',
              country: ''
            },
            preferences: {
              notifications: {
                email: user.preferences?.notifications?.email ?? true,
                sms: user.preferences?.notifications?.sms ?? false,
                push: user.preferences?.notifications?.push ?? true
              },
              language: user.preferences?.language || 'en'
            }
          });
          
          setIsLoading(false);
        } catch (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
        }
      };
      
      loadProfile();
    }
  }, [status]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        
        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        
        // Set the final value
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : value;
        
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate address fields
    if (!formData.address?.label?.trim()) {
      newErrors['address.label'] = 'Address label is required';
    }
    
    if (!formData.address?.line1?.trim()) {
      newErrors['address.line1'] = 'Address line 1 is required';
    }
    
    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    
    if (!formData.address?.state?.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    
    if (!formData.address?.postalCode?.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required';
    }
    
    if (!formData.address?.country?.trim()) {
      newErrors['address.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Call API to update profile
      const updatedUser = await updateProfileData(formData);
      
      // Update React Query cache
      queryClient.setQueryData(['profile'], updatedUser);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/profile');
  };

  // Close messages
  const closeSuccessMessage = () => {
    setSuccessMessage('');
  };
  
  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
          <div className="animate-pulse">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
              <div className="p-6 border-gray-200 border-b">
                <div className="bg-gray-200 rounded w-1/3 h-6"></div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="bg-gray-200 rounded w-1/4 h-4"></div>
                      <div className="bg-gray-200 rounded h-10"></div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <div className="bg-gray-200 rounded w-20 h-10"></div>
                    <div className="bg-gray-200 ml-4 rounded w-20 h-10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-gray-900 text-2xl">Authentication Required</h2>
          <p className="mb-6 text-gray-600">Please log in to edit your profile.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 border border-transparent rounded-lg font-medium text-white text-sm"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mt-15 min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 text-sm"
          >
            <ArrowLeftIcon />
            <span className="ml-1">Back to Profile</span>
          </Link>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <SuccessMessage 
            message={successMessage} 
            onClose={closeSuccessMessage} 
          />
        )}
        
        {errorMessage && (
          <ErrorMessage 
            message={errorMessage} 
            onClose={closeErrorMessage} 
          />
        )}

        <ProfileCard>
          <ProfileHeader 
            title="Edit Profile" 
            subtitle="Update your account information" 
            icon={UserIcon} 
          />
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="mb-4 font-medium text-gray-900">Personal Information</h3>
                  <div className="space-y-4">
                    <FormField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="John Doe"
                      required
                    />
                    
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="john@example.com"
                      required
                    />
                    
                    <FormField
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="mb-4 font-medium text-gray-900">Address Information</h3>
                  <div className="space-y-4">
                    <FormField
                      label="Address Label"
                      name="address.label"
                      value={formData.address?.label || ''}
                      onChange={handleChange}
                      error={errors['address.label']}
                      placeholder="Home, Work, etc."
                      required
                    />
                    
                    <FormField
                      label="Address Line 1"
                      name="address.line1"
                      value={formData.address?.line1 || ''}
                      onChange={handleChange}
                      error={errors['address.line1']}
                      placeholder="123 Main Street"
                      required
                    />
                    
                    <FormField
                      label="Address Line 2 (Optional)"
                      name="address.line2"
                      value={formData.address?.line2 || ''}
                      onChange={handleChange}
                      error={errors['address.line2']}
                      placeholder="Apartment, suite, etc."
                    />
                    
                    <div className="gap-4 grid grid-cols-2">
                      <FormField
                        label="City"
                        name="address.city"
                        value={formData.address?.city || ''}
                        onChange={handleChange}
                        error={errors['address.city']}
                        placeholder="New York"
                        required
                      />
                      
                      <FormField
                        label="State"
                        name="address.state"
                        value={formData.address?.state || ''}
                        onChange={handleChange}
                        error={errors['address.state']}
                        placeholder="NY"
                        required
                      />
                    </div>
                    
                    <div className="gap-4 grid grid-cols-2">
                      <FormField
                        label="Postal Code"
                        name="address.postalCode"
                        value={formData.address?.postalCode || ''}
                        onChange={handleChange}
                        error={errors['address.postalCode']}
                        placeholder="10001"
                        required
                      />
                      
                      <FormField
                        label="Country"
                        name="address.country"
                        value={formData.address?.country || ''}
                        onChange={handleChange}
                        error={errors['address.country']}
                        placeholder="US"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="mb-4 font-medium text-gray-900">Notification Preferences</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <CheckboxField
                      label="Email Notifications"
                      name="preferences.notifications.email"
                      checked={formData.preferences?.notifications?.email}
                      onChange={handleChange}
                      description="Receive important updates and alerts via email"
                    />
                    
                    <CheckboxField
                      label="SMS Notifications"
                      name="preferences.notifications.sms"
                      checked={formData.preferences?.notifications?.sms}
                      onChange={handleChange}
                      description="Receive service alerts and reminders via text message"
                    />
                    
                    <CheckboxField
                      label="Push Notifications"
                      name="preferences.notifications.push"
                      checked={formData.preferences?.notifications?.push}
                      onChange={handleChange}
                      description="Receive real-time notifications in your browser"
                    />
                  </div>
                </div>

                {/* Language Preference */}
                <div>
                  <h3 className="mb-4 font-medium text-gray-900">Language</h3>
                  <div className="max-w-xs">
                    <select
                      name="preferences.language"
                      value={formData.preferences?.language || 'en'}
                      onChange={handleChange}
                      className="block shadow-sm px-4 py-3 border border-gray-300 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-blue-500 w-full"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Save Changes
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}

// Main Edit Profile Page component with SessionProvider
export default function EditProfilePage() {
  return (
    <SessionProvider>
      <EditProfileContent />
    </SessionProvider>
  );
}