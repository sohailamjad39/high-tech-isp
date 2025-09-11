// app/components/admin/FilterDropdown.jsx
'use client';

import { useState } from 'react';

export default function FilterDropdown({ label, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value) || options[0];
  
  return (
    <div className="inline-block relative text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center gap-x-1.5 bg-white hover:bg-gray-50 shadow-sm px-3 py-2 rounded-md ring-1 ring-gray-300 ring-inset w-full font-semibold text-gray-900 text-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          {label}: {selectedOption.label}
          <svg className="-mr-1 ml-1.5 w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="right-0 z-10 absolute bg-white ring-opacity-5 shadow-lg mt-2 rounded-md focus:outline-none ring-1 ring-black w-56 origin-top-right">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`${
                  option.value === value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}