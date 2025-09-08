// components/dashboard/DashboardHeader.jsx
export default function DashboardHeader({ name }) {
  return (
    <div className="bg-white shadow-sm mt-15 border-gray-200 border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="w-full">
            <h1 className="font-bold text-gray-900 text-xl sm:text-2xl leading-tight tracking-tight">
              Welcome back, {name?.split(' ')[0] || 'Customer'}!
            </h1>
            <p className="mt-1 text-gray-500 text-xs md:text-sm">
              Here's what's happening with your service today.
            </p>
          </div>
          <div className="flex justify-end items-center w-full sm:w-auto">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full">
              <div className="bg-green-500 rounded-full w-2 h-2"></div>
              <span className="font-medium text-green-800 text-xs md:text-sm whitespace-nowrap">Service Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}