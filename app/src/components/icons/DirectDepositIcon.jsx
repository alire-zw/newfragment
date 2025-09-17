import React from 'react';

const DirectDepositIcon = ({ size = 24, color = '#666' }) => {
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
        d="M16.5 14h.01M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2m0 0a2 2 0 0 1 2-2h12m0 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
    </svg>
  );
};

export default DirectDepositIcon; 