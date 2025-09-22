import React from 'react';

interface MovingTruckAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MovingTruckAnimation: React.FC<MovingTruckAnimationProps> = ({ 
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
        viewBox="0 0 200 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Road */}
        <rect x="0" y="80" width="200" height="5" fill="#4B5563" />
        <rect x="0" y="85" width="200" height="2" fill="#9CA3AF" />
        
        {/* Road markings */}
        <rect x="0" y="82" width="10" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="-10" 
            to="200" 
            dur="1s" 
            repeatCount="indefinite" 
          />
        </rect>
        <rect x="30" y="82" width="10" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="20" 
            to="230" 
            dur="1s" 
            repeatCount="indefinite" 
          />
        </rect>
        <rect x="60" y="82" width="10" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="50" 
            to="260" 
            dur="1s" 
            repeatCount="indefinite" 
          />
        </rect>
        
        {/* Truck cabin */}
        <g>
          <rect x="15" y="45" width="30" height="25" rx="3" fill="#3B82F6" />
          <polygon points="45,50 60,50 45,40" fill="#93C5FD" />
          <rect x="20" y="55" width="10" height="8" fill="#1F2937" rx="1" />
        </g>
        
        {/* Tank body */}
        <g>
          <rect x="60" y="35" width="80" height="35" rx="8" fill="#1E40AF" />
          <rect x="65" y="40" width="70" height="8" fill="#3B82F6" rx="4" />
          <circle cx="140" cy="52.5" r="6" fill="#3B82F6" />
          
          {/* Liquid animation */}
          <rect x="65" y="55" width="70" height="10" fill="#60A5FA" rx="2">
            <animate 
              attributeName="height" 
              values="8; 12; 8" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </rect>
        </g>
        
        {/* Wheels */}
        <g>
          <circle cx="35" cy="75" r="8" fill="#1F2937" />
          <circle cx="35" cy="75" r="4" fill="#9CA3AF" />
          <circle cx="80" cy="75" r="8" fill="#1F2937" />
          <circle cx="80" cy="75" r="4" fill="#9CA3AF" />
          <circle cx="125" cy="75" r="8" fill="#1F2937" />
          <circle cx="125" cy="75" r="4" fill="#9CA3AF" />
        </g>
        
        {/* Truck movement */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 5 0; 0 0"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </svg>
    </div>
  );
};