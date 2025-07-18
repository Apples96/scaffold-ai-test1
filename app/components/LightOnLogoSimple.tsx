import React from 'react';

interface LightOnLogoSimpleProps {
  size?: number;
  className?: string;
}

const LightOnLogoSimple: React.FC<LightOnLogoSimpleProps> = ({ 
  size = 32, 
  className = '' 
}) => {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <img
        src="/white_background.png"
        alt="LightOn Logo"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ 
          width: size, 
          height: size
        }}
        onLoad={() => {
          console.log('✅ LightOn logo loaded successfully');
        }}
        onError={(e) => {
          console.error('❌ Failed to load LightOn logo:', e);
          // Fallback to a colored div if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.style.width = `${size}px`;
          fallback.style.height = `${size}px`;
          fallback.style.backgroundColor = '#FFFFFF';
          fallback.style.borderRadius = '50%';
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          fallback.style.color = '#1a1a1a';
          fallback.style.fontWeight = 'bold';
          fallback.style.fontSize = `${size * 0.3}px`;
          fallback.textContent = 'LO';
          target.parentNode?.appendChild(fallback);
        }}
      />
    </div>
  );
};

export default LightOnLogoSimple; 