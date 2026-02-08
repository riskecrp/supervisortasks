import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    success: 'bg-green-900/50 text-green-400 border-green-700',
    warning: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
    danger: 'bg-red-900/50 text-red-400 border-red-700',
    info: 'bg-blue-900/50 text-blue-400 border-blue-700',
    default: 'bg-gray-700 text-gray-300 border-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
