// components/dashboard/DashboardSkeleton.jsx
export default function DashboardSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm border-gray-200 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <div className="bg-gray-200 mb-2 rounded w-48 h-6 animate-pulse"></div>
              <div className="bg-gray-200 rounded w-32 h-4 animate-pulse"></div>
            </div>
            <div className="bg-gray-200 rounded w-36 h-8 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="md:gap-8 space-y-6 md:space-y-0 md:grid md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
            <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
            <div className="bg-white shadow p-6 rounded-xl h-64 animate-pulse"></div>
          </div>
          
          <div className="space-y-6 md:col-span-7">
            <div className="bg-white shadow p-6 rounded-xl h-80 animate-pulse"></div>
            <div className="bg-white shadow p-6 rounded-xl h-80 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}