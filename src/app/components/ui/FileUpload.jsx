// components/ui/FileUpload.jsx
import React, { useState, useCallback } from 'react';

export default function FileUpload({ onFileSelect, maxSize = 1048576, accept = "image/*,.pdf,.doc,.docx" }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      setFile(null);
      onFileSelect(null);
      return;
    }
    
    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    if (!allowedTypes.some(type => 
      type.startsWith('.') ? selectedFile.name.toLowerCase().endsWith(type) : 
      selectedFile.type.startsWith(type.replace('*', ''))
    )) {
      setError(`File type not allowed. Allowed: ${accept}`);
      setFile(null);
      onFileSelect(null);
      return;
    }
    
    setFile(selectedFile);
    setError('');
    onFileSelect(selectedFile);
  }, [maxSize, accept, onFileSelect]);

  const removeFile = () => {
    setFile(null);
    setError('');
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-700 text-sm">
        Attach File (optional)
      </label>
      <div className="flex justify-center mt-1 px-6 pt-5 pb-6 border-2 border-gray-300 hover:border-gray-400 border-dashed rounded-lg transition-colors duration-200">
        <div className="space-y-1 text-center">
          {file ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="max-w-xs text-gray-600 text-sm truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="mt-1 text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <svg className="mx-auto w-12 h-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4 4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-gray-600 text-sm">
                <label
                  htmlFor="file-upload"
                  className="relative bg-white rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept={accept}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-gray-500 text-xs">
                PNG, JPG, PDF, DOC up to {maxSize / 1024 / 1024}MB
              </p>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}