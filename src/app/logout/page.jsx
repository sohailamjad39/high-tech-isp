// app/logout/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the API logout route
    router.push('/api/auth/logout');
  }, [router]);

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="bg-white shadow-xl p-8 border border-gray-200 rounded-2xl w-full max-w-md text-center">
        <div className="flex justify-center items-center bg-blue-100 mx-auto mb-6 rounded-full w-16 h-16">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        
        <h1 className="mb-4 font-bold text-gray-900 text-2xl">Logging out...</h1>
        <p className="mb-8 text-gray-600">
          We're securely logging you out of your account. You will be redirected shortly.
        </p>
        
        <div className="flex justify-center">
          <div className="border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </div>
    </div>
  );
}