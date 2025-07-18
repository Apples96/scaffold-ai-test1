import React from 'react';
import Image from 'next/image';

interface LightOnLogoHostedProps {
  size?: number;
  className?: string;
  logoUrl?: string;
}

const LightOnLogoHosted: React.FC<LightOnLogoHostedProps> = ({ 
  size = 32, 
  className = '',
  logoUrl = 'https://your-domain.com/path/to/lighton-logo.png' // Replace with actual URL
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoUrl}
        alt="LightOn Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default LightOnLogoHosted; 