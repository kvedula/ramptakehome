'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  isCountingTotal?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled = false }: PaginationProps) {
  // Don't show pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const delta = 2; // Show 2 pages on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate start and end of the visible range
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (start > 1) {
      range.push(1);
      if (start > 2) {
        range.push('...');
      }
    }

    // Add pages in the visible range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        range.push('...');
      }
      range.push(totalPages);
    }

    return range;
  };

  const visiblePages = getVisiblePages();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || disabled}
        className="flex items-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex space-x-1">
        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={disabled || page === '...'}
            className={`px-3 py-2 text-sm border rounded-md ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : page === '...'
                ? 'bg-white text-gray-400 border-gray-300 cursor-default'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || disabled}
        className="flex items-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}
