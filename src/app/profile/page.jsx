// app/profile/page.jsx
'use client'

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

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

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ProfileSection({ children, title, icon: Icon }) {
  return (
    <div className="border-gray-200 last:border-0 border-b">
      {title && (
        <div className="flex items-center space-x-2 bg-gray-50 px-6 py-4 rounded-t-xl">
          {Icon && <Icon />}
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon, className = "" }) {
  if (!value) return null;
  
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      {Icon && (
        <div className="flex-shrink-0 mt-1 text-gray-400">
          <Icon />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-500 text-sm">{label}</p>
        <p className="mt-1 text-gray-900 text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    invited: "bg-yellow-100 text-yellow-800"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status] || variants.default}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DateItem({ label, date, icon: Icon }) {
  if (!date) return null;
  
  return (
    <div className="flex items-start space-x-3">
      {Icon && (
        <div className="flex-shrink-0 mt-1 text-gray-400">
          <Icon />
        </div>
      )}
      <div>
        <p className="font-medium text-gray-500 text-sm">{label}</p>
        <p className="mt-1 text-gray-900 text-sm">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}

function PreferencesItem({ label, preferences }) {
  if (!preferences) return null;
  
  return (
    <div>
      <p className="mb-3 font-medium text-gray-500 text-sm">{label}</p>
      <div className="space-y-2">
        {Object.entries(preferences).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600 text-sm capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <StatusBadge 
              status={value ? "active" : "inactive"} 
              variant={value ? "active" : "default"} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const roleColors = {
    admin: "bg-red-100 text-red-800",
    ops: "bg-purple-100 text-purple-800",
    support: "bg-blue-100 text-blue-800",
    tech: "bg-green-100 text-green-800",
    customer: "bg-indigo-100 text-indigo-800",
    visitor: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role] || roleColors.visitor}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function EditProfileButton() {
  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <Link
        href="/profile/edit"
        className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm transition-colors"
      >
        Edit Profile
      </Link>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl">
        <div className="p-6 border-gray-200 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <div className="bg-blue-200 rounded w-5 h-5"></div>
            </div>
            <div>
              <div className="bg-gray-200 rounded w-32 h-5"></div>
              <div className="bg-gray-200 mt-1 rounded w-24 h-4"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start space-x-3">
                <div className="bg-gray-200 rounded w-5 h-5"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 mb-1 rounded w-16 h-4"></div>
                  <div className="bg-gray-200 rounded w-32 h-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl text-center">
      <div className="mb-4 text-red-500">
        <svg className="mx-auto w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mb-2 font-medium text-gray-900 text-lg">Something went wrong</h3>
      <p className="mb-4 text-gray-600">{message}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
      >
        Try Again
      </button>
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

function ProfileContent() {
  const {  session, status } = useSession();
  
  // Use React Query for caching
  const { data: user, isLoading, error, isFetching } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfileData,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // We'll handle this manually
    refetchOnReconnect: true,
    retry: 1
  });

  // Handle visibility change for background refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isFetching && status === 'authenticated') {
        // Only refetch if data is stale
        const queryClient = window.queryClient;
        if (queryClient) {
          const queryState = queryClient.getQueryState(['profile']);
          if (queryState && (Date.now() - queryState.dataUpdatedAt) > 5 * 60 * 1000) {
            queryClient.invalidateQueries(['profile']);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFetching, status]);

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="mx-auto max-w-3xl">
          <SkeletonLoader />
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
          <p className="mb-6 text-gray-600">Please log in to view your profile.</p>
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

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="mx-auto max-w-3xl">
          <ErrorState 
            message={error.message} 
            onRetry={() => window.queryClient?.invalidateQueries(['profile'])} 
          />
        </div>
      </div>
    );
  }

  // Show profile content
  return (
    <div className="bg-gray-50 mt-15 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="font-bold text-gray-900 text-2xl">My Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account information and preferences</p>
          {isFetching && (
            <div className="flex items-center mt-2 text-blue-600 text-sm">
              <svg className="mr-1 w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating profile data...
            </div>
          )}
        </div>
        
        <div className="space-y-6 mx-auto max-w-3xl">
          {/* Personal Information */}
          <ProfileCard>
            <ProfileHeader 
              title="Personal Information" 
              subtitle="Your basic account details" 
              icon={UserIcon} 
            />
            <ProfileSection>
              <div className="space-y-4">
                <InfoItem 
                  label="Full Name" 
                  value={user?.name} 
                  icon={UserIcon} 
                />
                <InfoItem 
                  label="Email Address" 
                  value={user?.email} 
                  icon={MailIcon} 
                />
                <InfoItem 
                  label="Phone Number" 
                  value={user?.phone} 
                  icon={PhoneIcon} 
                />
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-gray-400">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Account Role</p>
                    <div className="mt-1">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-gray-400">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="font-medium text-gray-500 text-sm">Account Status</p>
                    <div className="mt-1">
                      <StatusBadge status={user?.status} />
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSection>
          </ProfileCard>

          {/* Account Information */}
          <ProfileCard>
            <ProfileHeader 
              title="Account Information" 
              subtitle="Your account creation and activity details" 
              icon={CalendarIcon} 
            />
            <ProfileSection>
              <div className="space-y-4">
                <DateItem 
                  label="Account Created" 
                  date={user?.createdAt} 
                  icon={CalendarIcon} 
                />
                <DateItem 
                  label="Last Login" 
                  date={user?.lastLoginAt} 
                  icon={ClockIcon} 
                />
                {user?.emailVerifiedAt && (
                  <DateItem 
                    label="Email Verified" 
                    date={user.emailVerifiedAt} 
                    icon={MailIcon} 
                  />
                )}
              </div>
            </ProfileSection>
          </ProfileCard>

          {/* Preferences */}
          {user?.preferences && (
            <ProfileCard>
              <ProfileHeader 
                title="Preferences" 
                subtitle="Your notification and language preferences" 
                icon={ShieldIcon} 
              />
              <ProfileSection>
                <div className="space-y-6">
                  <PreferencesItem 
                    label="Notification Preferences" 
                    preferences={user.preferences.notifications} 
                  />
                  <div>
                    <p className="mb-3 font-medium text-gray-500 text-sm">Language</p>
                    <p className="text-gray-900 text-sm">{user.preferences.language || 'English'}</p>
                  </div>
                </div>
              </ProfileSection>
            </ProfileCard>
          )}

          {/* Edit Button */}
          <EditProfileButton />
        </div>
      </div>
    </div>
  );
}

// Main Profile Page component
export default function ProfilePage() {
  return (
    <SessionProvider>
      <ProfileContent />
    </SessionProvider>
  );
}