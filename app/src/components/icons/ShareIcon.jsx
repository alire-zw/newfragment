import React from 'react';

const ShareIcon = ({ size = 24, color = '#666' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      fill="none" 
      viewBox="0 0 24 24"
      style={{ color }}
    >
      <path 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0m12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
      />
    </svg>
  );
};

export default ShareIcon; 