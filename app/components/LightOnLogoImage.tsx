import React from 'react';
import Image from 'next/image';

interface LightOnLogoImageProps {
  size?: number;
  className?: string;
  src?: string;
}

const LightOnLogoImage: React.FC<LightOnLogoImageProps> = ({ 
  size = 32, 
  className = '',
  src = '/black_no_background (3).png' // LightOn logo file
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt="LightOn Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default LightOnLogoImage; 