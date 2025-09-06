// app/unauthorized/page.jsx
export default function UnauthorizedPage() {
  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md text-center">
        <div className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-16 h-16">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="mb-2 font-bold text-gray-900 text-2xl">Access Denied</h2>
        <p className="mb-6 text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard"
            className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full font-medium text-white transition-colors"
          >
            Go to Dashboard
          </a>
          <a
            href="/auth/logout"
            className="block w-full font-medium text-blue-600 hover:text-blue-800"
          >
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}