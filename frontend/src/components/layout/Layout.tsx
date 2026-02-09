import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="w-full flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
