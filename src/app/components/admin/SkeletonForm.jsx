// app/components/admin/SkeletonForm.jsx
import React from 'react';

export default function SkeletonForm({ columns = 2, rows = 6 }) {
  // Create an array for the number of rows needed
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  
  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-gray-200 mb-6 rounded-md w-1/3 h-8"></div>
        <div className="bg-gray-200 mb-8 rounded-md w-1/2 h-4"></div>
        
        {/* Form grid */}
        <div className={`grid grid-cols-1 gap-x-6 gap-y-6 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
          {rowArray.map((rowIndex) => (
            <React.Fragment key={rowIndex}>
              {/* Label skeleton */}
              <div className="bg-gray-200 mb-2 rounded-md w-3/4 h-4"></div>
              
              {/* Input skeleton */}
              <div className="bg-gray-200 rounded-md w-full h-10"></div>
              
              {/* Sometimes add a second field in the same row for variety */}
              {columns === 2 && rowIndex % 3 === 0 && (
                <>
                  <div className="bg-gray-200 mb-2 rounded-md w-3/4 h-4"></div>
                  <div className="bg-gray-200 rounded-md w-full h-10"></div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Textarea skeleton */}
        <div className="mt-6">
          <div className="bg-gray-200 mb-2 rounded-md w-3/4 h-4"></div>
          <div className="bg-gray-200 rounded-md w-full h-20"></div>
        </div>
        
        {/* Checkbox and other elements skeleton */}
        <div className="space-y-4 mt-6">
          <div className="bg-gray-200 rounded-md w-1/2 h-4"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="bg-gray-200 mr-2 rounded w-5 h-5"></div>
                <div className="bg-gray-200 rounded-md w-16 h-4"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="mt-8 pt-6 border-gray-200 border-t">
          <div className="flex justify-end space-x-3">
            <div className="bg-gray-200 rounded-md w-20 h-10"></div>
            <div className="bg-gray-200 rounded-md w-32 h-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}