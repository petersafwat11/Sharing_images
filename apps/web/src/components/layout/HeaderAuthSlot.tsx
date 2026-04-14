'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';
import type { PublicUser } from '@picflow/shared';
import { getCurrentUser, logout } from '@/lib/api/auth';
import { getAuthToken, ApiError } from '@/lib/api/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditBadge } from '@/components/portrait/CreditBadge';

/**
 * Renders login/signup buttons OR the authenticated avatar dropdown.
 * Stays minimal — §7 "utility app, keep it minimal".
 */
export function HeaderAuthSlot(): React.ReactElement {
  const router = useRouter();
  const qc = useQueryClient();
  const hasToken = typeof window !== 'undefined' && !!getAuthToken();

  const { data: user, isError } = useQuery<PublicUser, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
  });

  if (!hasToken || isError || !user) {
    return (
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/login">Log in</Link>
        </Button>
        <Button asChild variant="primary" size="sm">
          <Link href="/auth/register">Sign up</Link>
        </Button>
      </nav>
    );
  }

  const initials = user.username.slice(0, 2).toUpperCase();
  const onLogout = (): void => {
    logout();
    qc.removeQueries({ queryKey: ['users', 'me'] });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <CreditBadge credits={user.creditBalance} />
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <Avatar className="h-7 w-7">
            {user.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.username} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.username}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push('/dashboard')}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push('/dashboard/admin')}>
          <BarChart3 className="h-4 w-4" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
