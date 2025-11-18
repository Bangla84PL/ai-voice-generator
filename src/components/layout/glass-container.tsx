import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

export interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the glass container
   * - default: Standard glass effect with white/10 opacity
   * - dark: Darker glass with black/30 opacity
   * - intense: Stronger glass effect with more blur
   */
  variant?: 'default' | 'dark' | 'intense';
  /**
   * Whether to add hover effects
   */
  hover?: boolean;
  /**
   * Whether to add padding
   */
  noPadding?: boolean;
}

/**
 * GlassContainer - A reusable glassmorphism container component
 *
 * Features:
 * - Multiple variants for different use cases
 * - Optional hover effects
 * - Customizable padding
 * - Accessible and semantic HTML
 *
 * @example
 * ```tsx
 * <GlassContainer variant="intense">
 *   <h2>Content here</h2>
 * </GlassContainer>
 * ```
 */
export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ className, variant = 'default', hover = false, noPadding = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'glass-card',
      dark: 'glass-card-dark',
      intense: 'glass-intense',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          !noPadding && 'p-6',
          hover && 'transition-transform duration-300 hover:scale-[1.02] hover:shadow-glass-lg',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassContainer.displayName = 'GlassContainer';
