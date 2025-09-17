export default function CalendarIcon({ color = 'currentColor', size = 17, ...props }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 21 21" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M14 1.75V5.25M7 1.75V5.25" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M11.375 3.5H9.625C6.32517 3.5 4.67526 3.5 3.65012 4.52512C2.625 5.55026 2.625 7.20017 2.625 10.5V12.25C2.625 15.5498 2.625 17.1998 3.65012 18.2248C4.67526 19.25 6.32517 19.25 9.625 19.25H11.375C14.6748 19.25 16.3248 19.25 17.3498 18.2248C18.375 17.1998 18.375 15.5498 18.375 12.25V10.5C18.375 7.20017 18.375 5.55026 17.3498 4.52512C16.3248 3.5 14.6748 3.5 11.375 3.5Z" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M2.625 8.75H18.375" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M8.75 16.1877L8.74999 12.1165C8.74999 11.9487 8.63034 11.8127 8.48276 11.8127H7.875M12.25 16.186L13.5498 12.1558C13.5582 12.1298 13.5625 12.1026 13.5625 12.0752C13.5625 11.9303 13.445 11.8127 13.3 11.8127L11.375 11.8125" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
} 