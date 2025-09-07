// components/dashboard/UsageCard.jsx
export default function UsageCard({ usage }) {
    // Safely calculate period days and averages
    const periodStart = usage?.periodStart ? new Date(usage.periodStart) : null;
    const periodEnd = usage?.periodEnd ? new Date(usage.periodEnd) : null;
    
    const periodDays = periodStart && periodEnd ? 
      Math.max(1, Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24))) : 1;
    
    const dailyDownloadAvg = usage ? (usage.downloadedGB / periodDays).toFixed(1) : '0';
    const dailyUploadAvg = usage ? (usage.uploadedGB / periodDays).toFixed(1) : '0';
  
    return (
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="font-medium text-gray-900 text-lg">Data Usage</h3>
        
        <div className="space-y-6 mt-6">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Downloaded</span>
              <span className="font-medium">{usage?.downloadedGB?.toFixed(1) || 0} GB</span>
            </div>
            <div className="bg-gray-200 mt-2 rounded-full w-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 rounded-full h-full"
                style={{ width: `${Math.min((usage?.downloadedGB || 0) / 1000 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              {dailyDownloadAvg} GB/day average • {periodDays} days
            </p>
          </div>
          
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uploaded</span>
              <span className="font-medium">{usage?.uploadedGB?.toFixed(1) || 0} GB</span>
            </div>
            <div className="bg-gray-200 mt-2 rounded-full w-full h-2 overflow-hidden">
              <div 
                className="bg-green-600 rounded-full h-full"
                style={{ width: `${Math.min((usage?.uploadedGB || 0) / 500 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              {dailyUploadAvg} GB/day average • {periodDays} days
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-gray-500 text-sm">
            Your plan includes unlimited data. Usage shown is for informational purposes.
          </p>
        </div>
      </div>
    );
  }