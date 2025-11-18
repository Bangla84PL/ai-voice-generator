'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Coins,
  CreditCard,
  FileText,
  FolderOpen,
  History,
  Home,
  Mic,
  Settings,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface SidebarProps {
  /**
   * User stats for quick display
   */
  stats?: {
    credits?: number;
    generationsThisMonth?: number;
    totalGenerations?: number;
  };
  /**
   * Custom className
   */
  className?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generate Voice', href: '/dashboard/generate', icon: Mic },
  { name: 'My Projects', href: '/dashboard/projects', icon: FolderOpen },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'Favorites', href: '/dashboard/favorites', icon: Star },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

/**
 * Sidebar - Dashboard navigation sidebar
 *
 * Features:
 * - Dashboard navigation links
 * - Quick stats (credits, generations this month)
 * - Active link highlighting
 * - Collapsible on mobile
 * - Glassmorphism styling
 * - Accessible navigation
 *
 * @example
 * ```tsx
 * <Sidebar stats={{ credits: 1000, generationsThisMonth: 45 }} />
 * ```
 */
export function Sidebar({ stats, className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActivePath = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <aside
      className={cn('hidden w-64 flex-shrink-0 md:block', isCollapsed && 'w-20', className)}
      aria-label="Dashboard navigation"
    >
      <div className="glass-card sticky top-20 flex h-[calc(100vh-6rem)] flex-col overflow-y-auto border border-white/10 scrollbar-thin">
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          {!isCollapsed && <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Menu</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="glass-card ml-auto rounded-lg p-2 transition-all duration-200 hover:scale-110 hover:bg-white/10"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-white" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-white" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4" role="navigation">
          {navigation.map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center space-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/30 to-primary-500/30 text-white shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                  isCollapsed && 'justify-center space-x-0',
                )}
                title={isCollapsed ? item.name : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary-400' : 'text-white/50 group-hover:text-white/70',
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {stats && !isCollapsed && (
          <div className="border-t border-white/10 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/70">Quick Stats</h3>
            <div className="flex flex-col gap-3">
              {/* Credits */}
              {typeof stats.credits === 'number' && (
                <Link
                  href="/dashboard/billing"
                  className="glass-card group flex items-center justify-between rounded-lg p-3 transition-all duration-200 hover:scale-105 hover:shadow-glass-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-accent-warm/20 p-2">
                      <Coins className="h-4 w-4 text-accent-warm" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Credits</p>
                      <p className="text-lg font-bold text-white">{stats.credits.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Generations This Month */}
              {typeof stats.generationsThisMonth === 'number' && (
                <div className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-secondary-500/20 p-2">
                      <FileText className="h-4 w-4 text-secondary-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">This Month</p>
                      <p className="text-lg font-bold text-white">{stats.generationsThisMonth}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Generations */}
              {typeof stats.totalGenerations === 'number' && (
                <div className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary-500/20 p-2">
                      <BarChart3 className="h-4 w-4 text-primary-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">Total Generated</p>
                      <p className="text-lg font-bold text-white">{stats.totalGenerations.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsed Stats */}
        {stats && isCollapsed && (
          <div className="border-t border-white/10 p-3">
            <div className="flex flex-col items-center gap-3">
              {typeof stats.credits === 'number' && (
                <Link
                  href="/dashboard/billing"
                  className="glass-card group flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-glass-lg"
                  title={`${stats.credits} credits`}
                  aria-label={`${stats.credits} credits available`}
                >
                  <Coins className="h-5 w-5 text-accent-warm" />
                </Link>
              )}
              {typeof stats.generationsThisMonth === 'number' && (
                <div
                  className="glass-card flex h-12 w-12 items-center justify-center rounded-lg"
                  title={`${stats.generationsThisMonth} this month`}
                  aria-label={`${stats.generationsThisMonth} generations this month`}
                >
                  <FileText className="h-5 w-5 text-secondary-500" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        {!isCollapsed && (
          <div className="m-4 rounded-lg bg-gradient-to-br from-accent-warm/20 to-orange-600/20 p-4">
            <div className="mb-2 flex items-center space-x-2">
              <Star className="h-5 w-5 text-accent-warm" />
              <h3 className="font-semibold text-white">Upgrade to Pro</h3>
            </div>
            <p className="mb-3 text-xs text-white/80">Get unlimited credits and access to premium voices</p>
            <Link href="/dashboard/billing">
              <button className="w-full rounded-lg bg-gradient-to-r from-accent-warm to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
                Upgrade Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
