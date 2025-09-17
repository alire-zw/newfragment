const GiftCardIcon = ({ color = '#363636' }) => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.75 10.5C1.75 7.20017 1.75 5.55026 2.77512 4.52512C3.80026 3.5 5.45017 3.5 8.75 3.5H12.25C15.5498 3.5 17.1998 3.5 18.2248 4.52512C19.25 5.55026 19.25 7.20017 19.25 10.5C19.25 13.7998 19.25 15.4498 18.2248 16.4748C17.1998 17.5 15.5498 17.5 12.25 17.5H8.75C5.45017 17.5 3.80026 17.5 2.77512 16.4748C1.75 15.4498 1.75 13.7998 1.75 10.5Z" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.75 10.5H19.25" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.75 3.5V17.5" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.125 7.875L11.375 13.125M6.125 13.125L11.375 7.875" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
export default GiftCardIcon; 