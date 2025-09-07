// components/dashboard/PlanCard.jsx
export default function PlanCard({ plan, status }) {
  if (!plan) {
    return (
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-5 border-gray-200 border-b">
          <h3 className="font-medium text-gray-900 text-lg">Service Plan</h3>
        </div>
        <div className="p-5">
          <div className="py-6 text-center">
            <p className="text-gray-500">No active plan</p>
            <button className="bg-blue-600 hover:bg-blue-700 mt-4 px-6 py-2 rounded-lg w-full sm:w-auto text-white text-sm">
              Choose a Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h3 className="font-medium text-gray-900 text-lg">Service Plan</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' : 
            status === 'trial' ? 'bg-blue-100 text-blue-800' :
            status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status?.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h4 className="font-semibold text-gray-900 text-lg leading-tight">{plan.name}</h4>
        
        <div className="gap-4 grid grid-cols-2 mt-4">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Download</p>
            <p className="font-bold text-blue-600 text-lg">{plan.speedMbps?.download} Mbps</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm">Upload</p>
            <p className="font-bold text-blue-600 text-lg">{plan.speedMbps?.upload} Mbps</p>
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-gray-200 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Monthly Price</span>
            <span className="font-semibold text-lg">${plan.priceMonthly}</span>
          </div>
        </div>
      </div>
    </div>
  );
}