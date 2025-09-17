import React from 'react';

const PendingIcon = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M8 12h8m6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
      />
    </svg>
  );
};

export default PendingIcon; 