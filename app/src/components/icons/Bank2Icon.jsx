import React from 'react';

const Bank2Icon = ({ color = '#363636', size = 21 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 21 21" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M1.75 7.49794C1.75 6.45128 2.17208 5.80984 3.04555 5.32375L6.64114 3.32276C8.52521 2.27426 9.46724 1.75 10.5 1.75C11.5328 1.75 12.4748 2.27426 14.3588 3.32276L17.9545 5.32375C18.8279 5.80984 19.25 6.45129 19.25 7.49794C19.25 7.78175 19.25 7.92366 19.219 8.04032C19.0562 8.65327 18.5007 8.75 17.9644 8.75H3.03562C2.49924 8.75 1.94383 8.65326 1.78099 8.04032C1.75 7.92366 1.75 7.78175 1.75 7.49794Z" 
        stroke={color} 
        strokeWidth="1.3125"
      />
      <path 
        d="M10.4964 6.125H10.5043" 
        stroke={color} 
        strokeWidth="1.75" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M3.5 8.75V16.1875M7 8.75V16.1875" 
        stroke={color} 
        strokeWidth="1.3125"
      />
      <path 
        d="M14 8.75V16.1875M17.5 8.75V16.1875" 
        stroke={color} 
        strokeWidth="1.3125"
      />
      <path 
        d="M16.625 16.1875H4.375C2.92526 16.1875 1.75 17.3627 1.75 18.8125C1.75 19.0541 1.94588 19.25 2.1875 19.25H18.8125C19.0541 19.25 19.25 19.0541 19.25 18.8125C19.25 17.3627 18.0748 16.1875 16.625 16.1875Z" 
        stroke={color} 
        strokeWidth="1.3125"
      />
    </svg>
  );
};

export default Bank2Icon; 