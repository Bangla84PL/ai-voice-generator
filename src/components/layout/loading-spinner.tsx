import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  /**
   * Size variant of the spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Custom className
   */
  className?: string;
  /**
   * Text to display below the spinner
   */
  text?: string;
  /**
   * Whether to center the spinner
   */
  centered?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

/**
 * LoadingSpinner - A branded loading animation component
 *
 * Features:
 * - Multiple size variants (sm, md, lg, xl)
 * - Optional loading text
 * - Centered or inline display
 * - SmartCamp.AI branding colors
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" text="Loading voices..." centered />
 * ```
 */
export function LoadingSpinner({ size = 'md', className, text, centered = false }: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn('inline-flex flex-col items-center justify-center gap-3', centered && 'w-full py-8')}>
      <Loader2
        className={cn('animate-spin text-primary-500', sizeClasses[size], className)}
        aria-label="Loading"
        role="status"
      />
      {text && (
        <p className={cn('font-medium text-muted-foreground', textSizeClasses[size])} aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (centered) {
    return <div className="flex min-h-[200px] w-full items-center justify-center">{spinner}</div>;
  }

  return spinner;
}

/**
 * FullPageLoader - A full-page loading overlay
 *
 * @example
 * ```tsx
 * <FullPageLoader text="Generating voice..." />
 * ```
 */
export function FullPageLoader({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-intense flex flex-col items-center gap-4 rounded-2xl p-8">
        <Loader2 className="h-16 w-16 animate-spin text-primary-500" aria-label="Loading" role="status" />
        {text && <p className="text-lg font-medium text-foreground">{text}</p>}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

/**
 * InlineLoader - A small inline loader for buttons and compact spaces
 *
 * @example
 * ```tsx
 * <button disabled>
 *   <InlineLoader /> Processing...
 * </button>
 * ```
 */
export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin', className)}
      aria-label="Loading"
      role="status"
    />
  );
}
