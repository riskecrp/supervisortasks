import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/discussions', label: 'Discussions', icon: MessageSquare },
    { path: '/supervisors', label: 'Supervisors', icon: Users },
    { path: '/loa', label: 'Leave of Absence', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-100">
              Supervisor Tasks
            </h1>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
