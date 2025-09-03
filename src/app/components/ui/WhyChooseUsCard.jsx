// components/ui/WhyChooseUsCard.jsx
import React from 'react';

export default function WhyChooseUsCard({ icon, heading, subheading }) {
  return (
    <div className="bg-transparent shadow-xl hover:shadow-md p-4 sm:p-5 md:p-6 border border-gray-800/10 rounded-lg h-full transition-shadow duration-200">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <div className="flex justify-center items-center bg-transparent rounded-full w-10 sm:w-11 md:w-13 h-10 sm:h-11 md:h-13">
            {icon}
          </div>
        </div>
        <div className="ml-3 sm:ml-4">
          <h3 className="font-semibold text-gray-800 text-lg md:text-lg sm:text-xl">
            {heading}
          </h3>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">
            {subheading}
          </p>
        </div>
      </div>
    </div>
  );
}