import React from "react"; 

const NotificationSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"} {...props}>
    <path d="M11.5 3.5H10.5C6.72876 3.5 4.84315 3.5 3.67157 4.67157C2.5 5.84315 2.5 7.72876 2.5 11.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5L12.5 21.5C16.2712 21.5 18.1569 21.5 19.3284 20.3284C20.5 19.1569 20.5 17.2712 20.5 13.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M21.5 6C21.5 7.933 19.933 9.5 18 9.5C16.067 9.5 14.5 7.933 14.5 6C14.5 4.067 16.067 2.5 18 2.5C19.933 2.5 21.5 4.067 21.5 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M7.5 12.5H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M7.5 16.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>
);

export default NotificationSquareIcon;