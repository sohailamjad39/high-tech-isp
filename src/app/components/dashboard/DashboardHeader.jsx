// components/dashboard/DashboardHeader.jsx
export default function DashboardHeader({ name }) {
    return (
      <div className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-gray-900 text-2xl tracking-tight">
                Welcome back, {name?.split(' ')[0] || 'Customer'}!
              </h1>
              <p className="mt-1 text-gray-500 text-sm">
                Here's what's happening with your service today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="bg-green-500 rounded-full w-2 h-2"></div>
                <span className="font-medium text-green-800 text-sm">Service Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }