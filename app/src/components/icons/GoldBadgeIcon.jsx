import React from 'react';

const GoldBadgeIcon = ({ size = 16, color = '#201B12' }) => (
  <svg width={size} height={size * 17 / 12} viewBox="0 0 12 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.74998 10L5.14787 9.57139C5.61473 9.09925 6.38685 9.15474 6.78299 9.68891C7.09249 10.1062 7.06864 10.6863 6.72596 11.0762L4.74998 13H6.94858" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.875" cy="11.125" r="4.875" stroke={color}/>
    <path d="M3.625 6.625L1 1" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.12498 6.625L10.75 1" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.12501 1L7.37502 2.875" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.24997 6.25L4 1" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default GoldBadgeIcon; 