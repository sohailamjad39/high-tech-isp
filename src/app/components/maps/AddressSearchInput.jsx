// components/maps/AddressSearchInput.jsx
'use client';
import { useState } from 'react';

export default function AddressSearchInput({ onAddressSelect }) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock address suggestions (in production, you might use Nominatim API)
  const mockSuggestions = [
    '123 Main St, New York, NY',
    '456 Broadway, New York, NY', 
    '789 Park Ave, New York, NY',
    '1000 5th Ave, New York, NY',
    '200 Central Park West, New York, NY'
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.length > 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion);
    setShowSuggestions(false);
    
    // In a real implementation, you would geocode the address
    // For now, we'll use a mock location
    const mockLocation = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.02,
      lng: -74.0060 + (Math.random() - 0.5) * 0.02
    };
    
    onAddressSelect({
      address: suggestion,
      ...mockLocation
    });
  };

  const handleCheckCoverage = () => {
    if (address.trim()) {
      // Use the same logic as suggestion click
      const mockLocation = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.02,
        lng: -74.0060 + (Math.random() - 0.5) * 0.02
      };
      
      onAddressSelect({
        address,
        ...mockLocation
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex sm:flex-row flex-col gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="Enter your address"
            className="px-4 py-3 border border-gray-300 focus:border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 w-full transition-colors duration-200"
            onFocus={() => address.length > 2 && setShowSuggestions(true)}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <ul className="z-10 absolute bg-white shadow-lg mt-1 border border-gray-300 rounded-lg w-full max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="hover:bg-gray-100 px-4 py-2 border-gray-100 border-b last:border-b-0 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button
          onClick={handleCheckCoverage}
          disabled={!address.trim()}
          className="bg-gradient-to-r from-[#2f83aa] hover:from-[#3da5d8] to-[#3f88cc] hover:to-[#56bde4] disabled:opacity-50 shadow-md hover:shadow-lg px-8 py-3 rounded-lg font-medium text-white whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed"
        >
          Check Coverage
        </button>
      </div>
    </div>
  );
}