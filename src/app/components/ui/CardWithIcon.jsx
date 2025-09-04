// components/ui/CardWithIcon.jsx
import React from 'react';

export default function CardWithIcon({ icon, title, children, className = "" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="flex justify-center items-center bg-gradient-to-r from-[#2f83aa] to-[#3f88cc] rounded-lg w-12 h-12 text-white">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="mb-2 font-semibold text-gray-800 text-lg md:text-xl">{title}</h3>
          <div className="text-gray-600 text-sm md:text-base">{children}</div>
        </div>
      </div>
    </div>
  );
}