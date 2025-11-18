import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        secondary:
          'glass-card text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        accent:
          'bg-gradient-to-r from-accent-warm to-orange-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        outline:
          'border-2 border-white/30 bg-transparent text-white hover:bg-white/10',
        ghost: 'hover:bg-white/10 text-white',
        link: 'text-primary-500 underline-offset-4 hover:underline',
        destructive:
          'bg-red-500 text-white shadow-md hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-12 px-8 py-4 text-base',
        xl: 'h-14 px-10 py-5 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
