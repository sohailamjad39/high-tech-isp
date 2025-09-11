// app/components/admin/SearchBar.jsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function SearchBar({ placeholder, onSearch, initialValue = '' }) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);
  
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className={`relative rounded-md shadow-sm ${isFocused ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.061 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="block py-2 pr-10 pl-10 border-0 rounded-md ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 ring-inset focus:ring-inset w-full text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
        placeholder={placeholder}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="right-0 absolute inset-y-0 flex items-center pr-3"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}