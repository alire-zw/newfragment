export default function IdCardIcon({ color = 'currentColor', size = 17, ...props }) {
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
        d="M1.75 10.5C1.75 6.78769 1.75 4.93153 3.03141 3.77827C4.31281 2.625 6.37522 2.625 10.5 2.625C14.6248 2.625 16.6872 2.625 17.9686 3.77827C19.25 4.93153 19.25 6.78769 19.25 10.5C19.25 14.2123 19.25 16.0685 17.9686 17.2217C16.6872 18.375 14.6248 18.375 10.5 18.375C6.37522 18.375 4.31281 18.375 3.03141 17.2217C1.75 16.0685 1.75 14.2123 1.75 10.5Z" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M4.375 14.4375C5.43227 12.179 9.37318 12.0305 10.5 14.4375M9.1875 8.3125C9.1875 9.27902 8.404 10.0625 7.4375 10.0625C6.471 10.0625 5.6875 9.27902 5.6875 8.3125C5.6875 7.346 6.471 6.5625 7.4375 6.5625C8.404 6.5625 9.1875 7.346 9.1875 8.3125Z" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round"
      />
      <path 
        d="M13.125 8.75H16.625" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.125 12.25H16.625" 
        stroke={color} 
        strokeWidth="1.3125" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
} 