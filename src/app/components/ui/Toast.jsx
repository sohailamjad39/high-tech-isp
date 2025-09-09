// components/ui/Toast.jsx
'use client';

import { useState, useEffect } from 'react';

// Toast component
export default function Toast({ heading, message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-hide after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Call onClose after animation completes
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Match animation duration
  };

  if (!isVisible) return null;

  return (
    <div className="right-4 bottom-4 z-50 fixed animate-slide-up">
      <div className={`bg-white shadow-lg rounded-lg p-4 min-w-[320px] max-w-md border-l-4 ${
        type === 'success' ? 'border-green-500' : 
        type === 'error' ? 'border-red-500' : 
        type === 'warning' ? 'border-yellow-500' : 
        'border-blue-500'
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`text-sm font-semibold mb-1 ${
              type === 'success' ? 'text-green-800' : 
              type === 'error' ? 'text-red-800' : 
              type === 'warning' ? 'text-yellow-800' : 
              'text-blue-800'
            }`}>
              {heading}
            </h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 focus:outline-none text-gray-400 hover:text-gray-600"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        <div className="mt-3">
          <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 
                type === 'warning' ? 'bg-yellow-500' : 
                'bg-blue-500'
              } transition-all duration-100`}
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}