const TradeIcon = ({ color = '#626262', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.625 4.375C12.0998 4.375 14.2123 4.375 14.9811 5.07395C15.75 5.7729 15.75 6.50011 15.75 8.75L14 7.875" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 17.5C8.02512 17.5 5.91269 17.5 5.14385 16.8011C4.375 16.1021 4.375 15.3749 4.375 13.125L6.125 14" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.8125 2.84375C3.60438 2.84375 2.625 3.57829 2.625 4.48438C2.625 5.39046 3.60438 6.125 4.8125 6.125C6.02062 6.125 7 6.85954 7 7.76562C7 8.67171 6.02062 9.40625 4.8125 9.40625M4.8125 2.84375C5.76496 2.84375 6.57523 3.30028 6.87553 3.9375M4.8125 2.84375V1.75M4.8125 9.40625C3.86004 9.40625 3.04977 8.94968 2.74947 8.3125M4.8125 9.40625V10.5" stroke={color} strokeWidth="1.3125" strokeLinecap="round"/>
    <path d="M14.5 18.5L13 11M14.5 18.5L15.5 13M14.5 18.5C14.5 18.0523 17.4626 13.3824 18.9501 11.7353M13 11L15.5 13M13 11L18.9501 11.7353M15.5 13C15.5 13.4477 19.4893 11.7353 18.9501 11.7353" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export default TradeIcon; 