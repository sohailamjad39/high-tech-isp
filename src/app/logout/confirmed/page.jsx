// app/logout/confirmed/page.jsx
'use client';

export default function LogoutConfirmedPage() {
  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="bg-white shadow-xl p-8 border border-gray-200 rounded-2xl w-full max-w-md text-center">
        <div className="flex justify-center items-center bg-green-100 mx-auto mb-6 rounded-full w-16 h-16">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="mb-4 font-bold text-gray-900 text-2xl">Successfully Logged Out</h1>
        <p className="mb-8 text-gray-600">
          You have been successfully logged out of your account. Your session has been terminated for security.
        </p>
        
        <div className="space-y-4">
          <a
            href="/"
            className="block bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] px-6 py-3 rounded-lg w-full font-medium text-white transition-all duration-200"
          >
            Return to Home
          </a>
          
          <a
            href="/auth/login"
            className="block w-full font-medium text-blue-600 hover:text-blue-800"
          >
            Sign in again
          </a>
        </div>
      </div>
    </div>
  );
}