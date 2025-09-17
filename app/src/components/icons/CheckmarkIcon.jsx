import React from 'react';

const CheckmarkIcon = ({ size = 24, color = 'currentColor' }) => {
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
        d="m7.5 12 3 3 6-6m5.5 3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10"
      />
    </svg>
  );
};

export default CheckmarkIcon; 