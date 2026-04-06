'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ClipboardList, MessageSquare, Users, Calendar, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tasks', href: '/', icon: ClipboardList },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Supervisors', href: '/supervisors', icon: Users },
  { name: 'LOA', href: '/loa', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">Supervisor Tasks</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Dark mode toggle pinned to bottom */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}
