import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading = ({ size = 'md', className }: LoadingProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-blue-600', sizes[size])} />
    </div>
  );
};

export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
