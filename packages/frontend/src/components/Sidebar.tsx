"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tasks', href: '/', icon: ClipboardList },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Supervisors', href: '/supervisors', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Supervisor Tasks</h1>
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
    </div>
  );
}
