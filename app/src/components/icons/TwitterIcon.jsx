import React from 'react';
const TwitterIcon = ({ color = '#363636', size = 21, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2.18762 10.5C2.18762 6.58145 2.18762 4.62218 3.40496 3.40483C4.6223 2.1875 6.58157 2.1875 10.5001 2.1875C14.4187 2.1875 16.3779 2.1875 17.5953 3.40483C18.8126 4.62218 18.8126 6.58145 18.8126 10.5C18.8126 14.4185 18.8126 16.3778 17.5953 17.5952C16.3779 18.8125 14.4187 18.8125 10.5001 18.8125C6.58157 18.8125 4.6223 18.8125 3.40496 17.5952C2.18762 16.3778 2.18762 14.4185 2.18762 10.5Z" stroke={color} strokeWidth={1.3125} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.12512 14.875L9.7945 11.2057M9.7945 11.2057L6.12512 6.125H8.55568L11.2058 9.79431M9.7945 11.2057L12.4445 14.875H14.8751L11.2058 9.79431M14.8751 6.125L11.2058 9.79431" stroke={color} strokeWidth={1.3125} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export default TwitterIcon; 