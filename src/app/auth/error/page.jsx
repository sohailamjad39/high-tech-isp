// app/auth/error/page.jsx
export default function ErrorPage() {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-gray-200 border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="font-bold text-2xl" style={{ color: "#1a6ea4" }}>
                  HIGH TECH ISP
                </span>
              </div>
            </div>
          </div>
        </header>
  
        {/* Main Content */}
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-md">
          <div className="bg-white shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <h1 className="mb-2 font-bold text-gray-900 text-2xl">Authentication Error</h1>
              <p className="text-gray-600">There was an issue with your login</p>
            </div>
  
            {/* Content */}
            <div className="px-8 pb-8">
              <div className="bg-red-50 mb-6 p-3 border border-red-200 rounded-lg text-red-700 text-sm">
                There was an error with your login. Please try again.
              </div>
              
              <div className="text-center">
                <a
                  href="/auth/login"
                  className="inline-block bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] px-4 py-2 rounded-lg font-medium text-white text-sm transition-all duration-200"
                >
                  Return to Login
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }