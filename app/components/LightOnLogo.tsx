import React from 'react';

interface LightOnLogoProps {
  size?: number;
  className?: string;
}

const LightOnLogo: React.FC<LightOnLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="#00D4FF"
        stroke="none"
      />
      
      {/* Dark star-like pattern in the center */}
      <path
        d="M50 5 L58 35 L88 35 L65 55 L75 85 L50 65 L25 85 L35 55 L12 35 L42 35 Z"
        fill="#1a1a1a"
        stroke="none"
      />
    </svg>
  );
};

export default LightOnLogo; 