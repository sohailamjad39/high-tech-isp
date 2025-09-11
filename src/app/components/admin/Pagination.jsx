// app/components/admin/Pagination.jsx
'use client';

import { useState } from 'react';

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const [jumpToPage, setJumpToPage] = useState('');
  
  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic
      if (currentPage <= 3) {
        // Show first 4 pages and last page
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, and last 4 pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current page range, ellipsis, last page
        pages.push(1);
        pages.push('ellipsis');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const handlePageSelect = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      setJumpToPage('');
    }
  };
  
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpToPage('');
    }
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <p className="text-gray-700 text-sm">
          Showing{' '}
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          of{' '}
          <span className="font-medium">{totalItems}</span>{' '}
          results
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Jump to page form */}
        <form onSubmit={handleJumpToPage} className="flex items-center">
          <span className="mr-2 text-gray-700 text-sm">Go to</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            className="block shadow-sm border-gray-300 focus:border-blue-500 rounded-md focus:ring-blue-500 w-16 text-sm"
            placeholder="Page"
          />
        </form>
        
        {/* Previous button */}
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-l-md ring-1 ring-gray-300 ring-inset text-gray-400 disabled:pointer-events-none"
        >
          <span className="sr-only">Previous</span>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Page numbers */}
        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageSelect(page)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
              page === currentPage
                ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
            } ${
              typeof page === 'string' ? 'cursor-default' : ''
            }`}
            disabled={typeof page === 'string'}
          >
            {page}
          </button>
        ))}
        
        {/* Next button */}
        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-r-md ring-1 ring-gray-300 ring-inset text-gray-400 disabled:pointer-events-none"
        >
          <span className="sr-only">Next</span>
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}