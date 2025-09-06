// components/ui/PlansCard.jsx

export default function PlansCard({ plan, onChoosePlan }) {
  const features = plan.features || [];
  const visibleFeatures = features.slice(0, 5);
  const remainingFeaturesCount = features.length - visibleFeatures.length;
  
  return (
    <div className="group relative bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm p-6 border border-black/5 hover:border-black/10 rounded-2xl h-full overflow-hidden scale-95 hover:scale-105 transition-all duration-300">
      {/* Decorative corner elements */}
      <div className="top-0 right-0 absolute bg-gradient-to-bl from-blue-100/50 to-transparent opacity-70 rounded-bl-full w-20 h-20"></div>
      <div className="bottom-0 left-0 absolute bg-gradient-to-tr from-blue-100/50 to-transparent opacity-70 rounded-tr-full w-16 h-16"></div>
      
      {/* Card content */}
      <div className="z-10 relative flex flex-col h-full">
        {/* Plan name and price */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-800 group-hover:text-blue-700 text-2xl transition-colors duration-200">
              {plan.name}
            </h3>
            <p className="mt-1 text-gray-500 text-sm">{plan.description}</p>
          </div>
          {plan.tags && plan.tags.includes('popular') && (
            <span className="bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] px-3 py-1 rounded-full font-medium text-white text-xs">
              Popular
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="font-bold text-gray-800 text-4xl">${plan.priceMonthly}</span>
            <span className="ml-1 text-gray-500">/mo</span>
          </div>
          {plan.priceYearly && (
            <p className="mt-1 text-gray-500 text-sm">
              or ${plan.priceYearly}/year (save ${Math.round(plan.priceMonthly * 12 - plan.priceYearly)})
            </p>
          )}
        </div>

        {/* Speed details */}
        <div className="bg-blue-50 mb-6 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-700 text-lg">{plan.speedMbps?.download || 0}Mbps</div>
              <div className="text-gray-600">Download</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-700 text-lg">{plan.speedMbps?.upload || 0}Mbps</div>
              <div className="text-gray-600">Upload</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-3 mb-6 overflow-hidden">
          <h4 className="font-semibold text-gray-800">Features:</h4>
          <ul className="space-y-2 pr-1" style={{ maxHeight: '140px' }}>
            {visibleFeatures.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700 text-sm">
                <svg className="flex-shrink-0 mr-2 w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{feature}</span>
              </li>
            ))}
            
            {/* Show "+X more" if there are additional features */}
            {remainingFeaturesCount > 0 && (
              <li className="flex items-center font-medium text-blue-600 text-sm">
                <svg className="flex-shrink-0 mr-2 w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>+{remainingFeaturesCount} more</span>
              </li>
            )}
          </ul>
        </div>

        {/* Contract info */}
        {plan.contractMonths > 0 && (
          <p className="mb-6 text-gray-500 text-xs text-center">
            {plan.contractMonths}-month contract
          </p>
        )}

        {/* Spacer to push button to bottom */}
        <div className="mt-auto">
          {/* CTA Button */}
          <button
            onClick={() => onChoosePlan(plan)}
            className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] shadow-md hover:shadow-lg px-6 py-3 rounded-lg w-full font-medium text-white hover:scale-105 transition-all duration-200 transform"
          >
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
}