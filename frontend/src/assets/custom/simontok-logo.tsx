import React from 'react';

interface SimontoKLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SimontoKLogo: React.FC<SimontoKLogoProps> = ({ 
  size = 32, 
  className = '',
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      {...props}
    >
      {/* Background circle */}
      <circle cx="16" cy="16" r="14" fill="#3b82f6" />
      
      {/* Fuel tank */}
      <rect x="10" y="6" width="12" height="16" rx="1.5" fill="white" stroke="#1e40af" strokeWidth="0.8" />
      
      {/* Fuel level indicator */}
      <rect x="11.5" y="7.5" width="9" height="13" fill="#60a5fa" />
      
      {/* Fuel pump */}
      <path d="M16 4L16 7" stroke="#1e40af" strokeWidth="1.2" />
      <circle cx="16" cy="3" r="1.5" fill="#1e40af" />
      
      {/* Monitoring icon */}
      <circle cx="21" cy="11" r="1.2" fill="#ef4444" />
      <path d="M20 12L22 14" stroke="#ef4444" strokeWidth="1.2" />
      
      {/* Letter S for SimontoK */}
      <path 
        d="M12 18Q12 16.5 13.5 16.5Q15 16.5 15 18Q15 19.5 13.5 19.5Q12 19.5 12 21Q12 22.5 13.5 22.5Q15 22.5 15 21" 
        stroke="white" 
        strokeWidth="1" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
  );
};