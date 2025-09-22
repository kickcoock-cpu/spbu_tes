import React from 'react';

interface TankTruckAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TankTruckAnimation: React.FC<TankTruckAnimationProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} overflow-visible`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Truck cabin */}
        <rect x="5" y="40" width="25" height="25" rx="3" fill="#3B82F6" />
        
        {/* Windshield */}
        <polygon points="30,45 40,45 30,35" fill="#93C5FD" />
        
        {/* Tank body */}
        <rect x="35" y="30" width="50" height="35" rx="5" fill="#1E40AF" />
        
        {/* Tank details */}
        <rect x="40" y="35" width="40" height="5" fill="#3B82F6" />
        <circle cx="85" cy="47.5" r="5" fill="#3B82F6" />
        
        {/* Wheels */}
        <circle cx="20" cy="70" r="7" fill="#1F2937" />
        <circle cx="20" cy="70" r="3" fill="#9CA3AF" />
        <circle cx="50" cy="70" r="7" fill="#1F2937" />
        <circle cx="50" cy="70" r="3" fill="#9CA3AF" />
        <circle cx="80" cy="70" r="7" fill="#1F2937" />
        <circle cx="80" cy="70" r="3" fill="#9CA3AF" />
        
        {/* Animated elements */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-10 0; 10 0; -10 0"
          dur="2s"
          repeatCount="indefinite"
        />
        
        {/* Pulsing effect for tank */}
        <animate
          attributeName="opacity"
          values="0.8; 1; 0.8"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </svg>
    </div>
  );
};