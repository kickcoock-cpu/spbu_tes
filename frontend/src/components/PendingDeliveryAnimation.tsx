import React from 'react';

interface PendingDeliveryAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PendingDeliveryAnimation: React.FC<PendingDeliveryAnimationProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} overflow-visible relative`}>
      <svg 
        viewBox="0 0 200 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Road */}
        <rect x="0" y="80" width="200" height="5" fill="#4B5563" />
        <rect x="0" y="85" width="200" height="2" fill="#9CA3AF" />
        
        {/* Road markings */}
        <rect x="0" y="82" width="15" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="-15" 
            to="200" 
            dur="1.2s" 
            repeatCount="indefinite" 
          />
        </rect>
        <rect x="40" y="82" width="15" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="25" 
            to="240" 
            dur="1.2s" 
            repeatCount="indefinite" 
          />
        </rect>
        <rect x="80" y="82" width="15" height="1" fill="#E5E7EB">
          <animate 
            attributeName="x" 
            from="65" 
            to="280" 
            dur="1.2s" 
            repeatCount="indefinite" 
          />
        </rect>
        
        {/* Truck cabin */}
        <g>
          <rect x="20" y="45" width="35" height="25" rx="3" fill="#3B82F6" />
          <polygon points="55,50 70,50 55,40" fill="#93C5FD" />
          <rect x="25" y="55" width="12" height="8" fill="#1F2937" rx="1" />
        </g>
        
        {/* Tank body with warning colors for pending status */}
        <g>
          <rect x="70" y="35" width="90" height="35" rx="8" fill="#F59E0B" />
          <rect x="75" y="40" width="80" height="8" fill="#FBBF24" rx="4" />
          <circle cx="155" cy="52.5" r="6" fill="#FBBF24" />
          
          {/* Liquid animation with amber color */}
          <rect x="75" y="55" width="80" height="10" fill="#FCD34D" rx="2">
            <animate 
              attributeName="height" 
              values="8; 12; 8" 
              dur="1.8s" 
              repeatCount="indefinite" 
            />
          </rect>
          
          {/* Warning icon */}
          <g transform="translate(105, 25)">
            <circle cx="0" cy="0" r="8" fill="#DC2626" />
            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">!</text>
          </g>
        </g>
        
        {/* Wheels */}
        <g>
          <circle cx="40" cy="75" r="8" fill="#1F2937" />
          <circle cx="40" cy="75" r="4" fill="#9CA3AF" />
          <circle cx="90" cy="75" r="8" fill="#1F2937" />
          <circle cx="90" cy="75" r="4" fill="#9CA3AF" />
          <circle cx="140" cy="75" r="8" fill="#1F2937" />
          <circle cx="140" cy="75" r="4" fill="#9CA3AF" />
        </g>
        
        {/* Truck movement */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 3 0; 0 0"
          dur="0.6s"
          repeatCount="indefinite"
        />
        
        {/* Pulsing warning effect */}
        <circle cx="105" cy="25" r="12" fill="#F59E0B" opacity="0.3">
          <animate 
            attributeName="r" 
            values="12; 18; 12" 
            dur="2s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="0.3; 0.1; 0.3" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>
    </div>
  );
};