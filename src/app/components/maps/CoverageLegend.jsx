// components/maps/CoverageLegend.jsx
export default function CoverageLegend() {
    return (
      <div className="bg-white/90 shadow-lg backdrop-blur-sm p-4 border border-white/30 rounded-lg">
        <h4 className="mb-3 font-semibold text-gray-800">Coverage Types</h4>
        <div className="flex md:flex-row flex-col gap-0 md:gap-10 space-y-2">
          <div className="flex items-center">
            <div className="bg-blue-500 mr-2 rounded-sm w-4 h-4" style={{ opacity: 0.35, border: '3px solid #4285F480' }}></div>
            <span className="text-gray-700 text-sm">Fiber Coverage</span>
          </div>
          <div className="flex items-center">
            <div className="bg-green-500 mr-2 rounded-sm w-4 h-4" style={{ opacity: 0.35, border: '3px solid #34A85380' }}></div>
            <span className="text-gray-700 text-sm">Wireless Coverage</span>
          </div>
          <div className="flex items-center">
            <div className="bg-red-500 mr-2 rounded-full w-4 h-4"></div>
            <span className="text-gray-700 text-sm">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="bg-green-500 mr-2 mb-2 border-2 border-green-700 rounded-full w-4 h-4" ></div>
            <span className="mb-2 text-gray-700 text-sm">Service Offices</span>
          </div>
        </div>
      </div>
    );
  }