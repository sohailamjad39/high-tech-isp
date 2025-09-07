// components/dashboard/DashboardSkeleton.jsx
export default function DashboardSkeleton() {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white shadow-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="bg-gray-200 rounded w-64 h-8 animate-pulse"></div>
              <div className="bg-gray-200 rounded w-48 h-6 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
              <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
              <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8 lg:col-span-1 xl:col-span-2">
              <div className="bg-white shadow p-6 rounded-xl h-80 animate-pulse"></div>
              <div className="bg-white shadow p-6 rounded-xl h-80 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }