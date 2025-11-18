'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins, FileText, FolderOpen, Home, LayoutDashboard, Library, LogOut, Menu, Settings, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface NavbarProps {
  /**
   * User information
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
    credits?: number;
  };
  /**
   * Whether the navbar should be transparent
   */
  transparent?: boolean;
}

const navLinks = [
  { href: '/generate', label: 'Generate', icon: Home },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/pricing', label: 'Pricing', icon: Coins },
  { href: '/docs', label: 'Docs', icon: FileText },
];

/**
 * Navbar - Main navigation component
 *
 * Features:
 * - Logo with link to home
 * - Navigation links (Generate, Library, Projects, Pricing, Docs)
 * - User menu with avatar (Dashboard, Settings, Logout)
 * - Credit balance display
 * - Mobile responsive with hamburger menu
 * - Glassmorphism styling
 * - Active link highlighting
 *
 * @example
 * ```tsx
 * <Navbar user={{ name: "John Doe", email: "john@example.com", credits: 1000 }} />
 * ```
 */
export function Navbar({ user, transparent = false }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <nav
      className={cn(
        'sticky top-0 z-40 w-full border-b backdrop-blur-lg transition-all duration-300',
        transparent ? 'border-white/10 bg-transparent' : 'glass-card border-white/20',
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
            aria-label="SmartCamp.AI Voice Generator Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
              <span className="text-xl font-bold text-white">SC</span>
            </div>
            <span className="hidden text-lg font-bold text-foreground md:inline-block">
              SmartCamp<span className="text-primary-500">.AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-500/20 text-primary-500'
                      : 'text-muted-foreground hover:bg-white/10 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Credits & User Menu */}
          <div className="flex items-center gap-4">
            {/* Credits Display */}
            {user && typeof user.credits === 'number' && (
              <Link
                href="/pricing"
                className="glass-card hidden items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 hover:scale-105 hover:shadow-glass-lg md:flex"
                aria-label={`${user.credits} credits available`}
              >
                <Coins className="h-4 w-4 text-accent-warm" aria-hidden="true" />
                <span className="font-semibold text-foreground">{user.credits.toLocaleString()}</span>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="glass-card flex items-center gap-2 rounded-full p-1 pr-3 transition-all duration-200 hover:scale-105 hover:shadow-glass-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-sm">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium text-foreground md:inline-block">{user.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-card-dark w-56 rounded-xl p-2" align="end">
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 h-px bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 h-px bg-white/10" />
                  <DropdownMenuItem asChild>
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                      onClick={() => {
                        // Handle logout
                        window.location.href = '/api/auth/logout';
                      }}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 md:inline-block"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="glass-card rounded-lg p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="glass-card-dark mt-2 rounded-xl p-4 md:hidden" role="navigation">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActivePath(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-500/20 text-primary-500'
                        : 'text-muted-foreground hover:bg-white/10 hover:text-foreground',
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                );
              })}

              {user && typeof user.credits === 'number' && (
                <>
                  <div className="my-2 h-px bg-white/10" />
                  <Link
                    href="/pricing"
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-accent-warm" aria-hidden="true" />
                      Credits
                    </span>
                    <span className="font-semibold">{user.credits.toLocaleString()}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
