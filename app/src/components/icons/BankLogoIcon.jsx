import { getBankIcon } from '../../services/bankDetector';

export default function BankLogoIcon({ cardNumber, color = "currentColor", size = 24, className = "" }) {
  const bankIconPath = getBankIcon(cardNumber);
  
  if (!bankIconPath) {
    // اگر بانک تشخیص داده نشد، آیکون پیش‌فرض نمایش داده شود
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path 
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <img 
      src={bankIconPath} 
      alt="Bank Logo" 
      width={size} 
      height={size} 
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
} 