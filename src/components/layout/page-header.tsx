import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;
  /**
   * Optional description below the title
   */
  description?: string;
  /**
   * Breadcrumb navigation items
   */
  breadcrumbs?: Breadcrumb[];
  /**
   * Action buttons to display in the header
   */
  actions?: ReactNode;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Whether to use glass styling
   */
  glass?: boolean;
}

/**
 * PageHeader - Page title and breadcrumb navigation component
 *
 * Features:
 * - Page title with optional description
 * - Breadcrumb navigation
 * - Action buttons area (for CTAs, filters, etc.)
 * - Responsive layout
 * - Optional glassmorphism styling
 * - Accessible navigation
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Voice Library"
 *   description="Manage your generated voice recordings"
 *   breadcrumbs={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Library' }
 *   ]}
 *   actions={
 *     <button className="btn-primary">
 *       <Plus className="h-4 w-4" />
 *       Generate New
 *     </button>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  glass = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-white/10 py-6',
        glass && 'glass-card backdrop-blur-sm',
        !glass && 'bg-transparent',
        className,
      )}
    >
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <li key={index} className="flex items-center gap-2">
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-muted-foreground transition-colors hover:text-primary-500"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={cn('font-medium', isLast ? 'text-foreground' : 'text-muted-foreground')}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Title and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-h1 mb-2 text-foreground">{title}</h1>
            {description && <p className="text-body text-muted-foreground">{description}</p>}
          </div>

          {/* Actions */}
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * SimplePage Header - A minimal page header without breadcrumbs
 *
 * @example
 * ```tsx
 * <SimplePageHeader title="Settings" />
 * ```
 */
export function SimplePageHeader({
  title,
  description,
  actions,
  className,
}: Omit<PageHeaderProps, 'breadcrumbs' | 'glass'>) {
  return (
    <div className={cn('border-b border-white/10 bg-transparent py-6', className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-h1 mb-2 text-foreground">{title}</h1>
            {description && <p className="text-body text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
