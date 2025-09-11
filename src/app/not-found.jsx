'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [referrer, setReferrer] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrerUrl = document.referrer;
      if (referrerUrl && referrerUrl.includes(window.location.origin)) {
        // Strip the origin so router.push works correctly
        const relativePath = referrerUrl.replace(window.location.origin, '');
        setReferrer(relativePath);
      }
    }
  }, []);

  const goBack = () => {
    if (referrer) {
      // Navigate internally without reload
      router.push(referrer);
    } else {
      // Fallback: go back in history, then home
      router.back();
      setTimeout(() => router.push('/'), 500);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-gray-200 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <span className="font-bold text-blue-600 text-xl">ISP Web App</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-grow justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 w-full max-w-md text-center">
          <div className="flex justify-center items-center bg-red-100 mx-auto rounded-full w-20 h-20">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="mt-6">
            <h1 className="font-extrabold text-gray-900 text-3xl sm:text-4xl">
              Page Not Found
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <p className="mt-2 text-gray-500 text-sm">
              The page may have been removed, renamed, or is temporarily unavailable.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={goBack}
              className="group relative flex justify-center bg-blue-600 hover:bg-blue-700 px-4 py-3 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm transition-colors duration-200 cursor-pointer"
            >
              <svg
                className="mr-2 -ml-1 w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-colors duration-200"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {referrer ? 'Go Back to Previous Page' : 'Go Back'}
            </button>

            <p className="mt-4 text-gray-500 text-sm">
              Or{' '}
              <button
                onClick={() => router.push('/')}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 cursor-pointer"
              >
                return to homepage
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-gray-200 border-t">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} ISP Web App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
