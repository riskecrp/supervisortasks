import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ children, className }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={cn('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className }: TableProps) => {
  return (
    <thead className={cn('bg-gray-50', className)}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className }: TableProps) => {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className }: TableProps) => {
  return (
    <tr className={cn('hover:bg-gray-50', className)}>
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className }: TableProps) => {
  return (
    <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableCell = ({ children, className, ...props }: TableCellProps) => {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} {...props}>
      {children}
    </td>
  );
};
