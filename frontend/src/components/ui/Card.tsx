import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={cn('bg-gray-800 rounded-lg shadow-sm border border-gray-700', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }: CardProps) => {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-700', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }: CardProps) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-100', className)}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className }: CardProps) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
};
