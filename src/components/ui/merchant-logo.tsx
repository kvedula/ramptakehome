'use client';

import React, { useState } from 'react';
import { getMerchantLogo, getMerchantInitials, getMerchantColor } from '@/lib/utils/merchantLogos';
import { cn } from '@/lib/utils';

interface MerchantLogoProps {
  merchantName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

export function MerchantLogo({ 
  merchantName, 
  size = 'md', 
  className,
  showTooltip = false 
}: MerchantLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const logoUrl = getMerchantLogo(merchantName);
  const initials = getMerchantInitials(merchantName);
  const color = getMerchantColor(merchantName);
  
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const containerClasses = cn(
    'relative rounded-full flex items-center justify-center overflow-hidden border border-gray-200',
    sizeClasses[size],
    className
  );

  // Show logo if available and no error
  if (logoUrl && !imageError) {
    return (
      <div 
        className={containerClasses}
        title={showTooltip ? merchantName : undefined}
      >
        {imageLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}
        <img
          src={logoUrl}
          alt={`${merchantName} logo`}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to initials with color
  return (
    <div 
      className={cn(containerClasses, 'font-medium text-white')}
      style={{ backgroundColor: color }}
      title={showTooltip ? merchantName : undefined}
    >
      {initials}
    </div>
  );
}

// Enhanced version with additional features
interface MerchantAvatarProps extends MerchantLogoProps {
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export function MerchantAvatar({
  merchantName,
  size = 'md',
  className,
  showTooltip = false,
  showBadge = false,
  badgeContent,
  onClick,
  loading = false,
}: MerchantAvatarProps) {
  if (loading) {
    return (
      <div 
        className={cn(
          'animate-pulse bg-gray-200 rounded-full',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  const logoComponent = (
    <MerchantLogo
      merchantName={merchantName}
      size={size}
      className={cn(
        onClick && 'cursor-pointer hover:scale-105 transition-transform duration-200',
        className
      )}
      showTooltip={showTooltip}
    />
  );

  if (showBadge && badgeContent) {
    return (
      <div 
        className="relative inline-block"
        onClick={onClick}
      >
        {logoComponent}
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
          {badgeContent}
        </div>
      </div>
    );
  }

  return onClick ? (
    <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
      {logoComponent}
    </button>
  ) : logoComponent;
}
