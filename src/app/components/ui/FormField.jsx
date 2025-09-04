// components/ui/FormField.jsx
import React from 'react';

export default function FormField({ 
  label, 
  id, 
  error, 
  required = false, 
  children 
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-gray-700 text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}