export default function DiamondIcon({ size = 20, color = "#8B5CF6" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.875 3.5H13.125L15.75 7H5.25L7.875 3.5Z" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.25 7L10.5 17.5L15.75 7" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.75 7L10.5 17.5L12.25 7" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.25 7H15.75" stroke={color} strokeWidth="1.3125" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
} 