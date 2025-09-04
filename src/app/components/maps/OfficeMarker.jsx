// components/maps/OfficeMarker.jsx
import { useState } from 'react';

export default function OfficeMarker({ office, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="hover:scale-110 transition-all duration-200 cursor-pointer transform"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div 
        className="bg-green-500 shadow-md border-2 border-green-700 rounded-full w-4 h-4"
        style={{ 
          boxShadow: isHovered ? '0 0 10px rgba(34, 168, 83, 0.5)' : '0 2px 4px rgba(0,0,0,0.3)'
        }}
      />
      {isHovered && (
        <div className="bottom-full left-1/2 z-50 absolute bg-gray-800 mb-2 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 transform">
          {office.name}
        </div>
      )}
    </div>
  );
}