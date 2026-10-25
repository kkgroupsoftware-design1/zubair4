import React from 'react';
import { ASSETS } from '../assets/images';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  onClick?: () => void;
}

export const RentoBitLogo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'h-8 sm:h-9 max-w-[180px]',
    sm: 'h-11 sm:h-13 max-w-[240px]',
    md: 'h-15 sm:h-18 max-w-[300px] sm:max-w-[380px]',
    lg: 'h-22 sm:h-28 max-w-[380px] sm:max-w-[480px]',
    xl: 'h-30 sm:h-38 max-w-[440px] sm:max-w-[560px]',
    '2xl': 'h-38 sm:h-48 max-w-[500px] sm:max-w-[640px]',
    '3xl': 'h-46 sm:h-58 max-w-[580px] sm:max-w-[740px]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <img
        src={ASSETS.logo}
        alt="RentoBit - Invest Smart. Earn Daily"
        className={`w-auto object-contain transition-all duration-300 drop-shadow-[0_6px_20px_rgba(21,94,239,0.45)] hover:scale-[1.02] ${sizeClasses[size]}`}
        loading="eager"
      />
    </div>
  );
};
