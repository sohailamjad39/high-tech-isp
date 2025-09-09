// components/dashboard/UsageCard.jsx
export default function UsageCard({ usage }) {
  // Calculate current usage based on the day of the month
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  // Base download usage that increases throughout the month (from 5GB to 977GB)
  const minDownload = 5;
  const maxDownload = 977;
  const dailyDownloadGrowth = (maxDownload - minDownload) / (daysInMonth - 1);
  const downloadedGB = Math.min(minDownload + (currentDay - 1) * dailyDownloadGrowth, maxDownload);
  
  // Upload usage is 13% less than download usage
  const uploadedGB = downloadedGB * 0.87;
  
  // Calculate period (current month)
  const periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const periodDays = Math.max(1, Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24)));
  
  const dailyDownloadAvg = (downloadedGB / currentDay).toFixed(1);
  const dailyUploadAvg = (uploadedGB / currentDay).toFixed(1);

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-5 border-gray-200 border-b">
        <h3 className="font-medium text-gray-900 text-lg">Data Usage</h3>
      </div>
      
      <div className="p-5">
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Downloaded</span>
              <span className="font-medium">{downloadedGB.toFixed(1)} GB</span>
            </div>
            <div className="bg-gray-200 mt-2 rounded-full w-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 rounded-full h-full"
                style={{ width: `${Math.min(downloadedGB / 1000 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              {dailyDownloadAvg} GB/day average • {currentDay} of {daysInMonth} days
            </p>
          </div>
          
          <div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uploaded</span>
              <span className="font-medium">{uploadedGB.toFixed(1)} GB</span>
            </div>
            <div className="bg-gray-200 mt-2 rounded-full w-full h-2 overflow-hidden">
              <div 
                className="bg-green-600 rounded-full h-full"
                style={{ width: `${Math.min(uploadedGB / 500 * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              {dailyUploadAvg} GB/day average • {currentDay} of {daysInMonth} days
            </p>
          </div>
        </div>
        
        <div className="mt-5 pt-4 border-gray-200 border-t">
          <p className="text-gray-500 text-xs sm:text-sm">
            Your plan includes unlimited data. Usage shown is for informational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}