# SmartCamp.AI Branding Implementation Guide

This document provides practical implementation guidelines for integrating the SmartCamp.AI brand identity into the AI Voice Generator application.

## Table of Contents
- [Tailwind Configuration](#tailwind-configuration)
- [CSS Variables](#css-variables)
- [Glassmorphism Patterns](#glassmorphism-patterns)
- [Jungle Background](#jungle-background)
- [Typography Setup](#typography-setup)
- [Component Examples](#component-examples)
- [Footer Requirement](#footer-requirement)
- [Accessibility](#accessibility)

---

## Tailwind Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Primary Colors (Green)
        brand: {
          primary: {
            50: '#D2F5E4',
            100: '#D2F5E4',
            200: '#A5E5C7',
            300: '#78D5AA',
            400: '#4BC58D',
            500: '#1EB571', // Primary Green
            600: '#1A9661',
            700: '#167850',
            800: '#115940',
            900: '#0D3B2F',
          },
          // Secondary Colors (Teal/Cyan)
          secondary: {
            50: '#E0F2FE',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0EA5E9', // Sky Blue
            600: '#0284C7',
            700: '#0369A1',
            800: '#075985',
            900: '#0C4A6E',
          },
          // Accent Colors
          accent: {
            warm: '#F59E0B',    // Amber - CTAs, highlights
            hot: '#EF4444',     // Red - errors, urgent alerts
            cool: '#8B5CF6',    // Purple - premium features
            success: '#10B981', // Green - success states
          },
        },
        // Neutral Colors
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],
        'h6': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
        '32': '8rem',    // 128px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px - default
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '300ms',
        'slow': '500ms',
      },
      backdropBlur: {
        'glass': '10px',
        'glass-intense': '20px',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## CSS Variables

### src/styles/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Primary Colors */
  --brand-primary-900: #0D3B2F;
  --brand-primary-800: #115940;
  --brand-primary-700: #167850;
  --brand-primary-600: #1A9661;
  --brand-primary-500: #1EB571;
  --brand-primary-400: #4BC58D;
  --brand-primary-300: #78D5AA;
  --brand-primary-200: #A5E5C7;
  --brand-primary-100: #D2F5E4;

  /* Secondary Colors */
  --brand-secondary-900: #0C4A6E;
  --brand-secondary-800: #075985;
  --brand-secondary-700: #0369A1;
  --brand-secondary-600: #0284C7;
  --brand-secondary-500: #0EA5E9;
  --brand-secondary-400: #38BDF8;
  --brand-secondary-300: #7DD3FC;
  --brand-secondary-200: #BAE6FD;
  --brand-secondary-100: #E0F2FE;

  /* Accent Colors */
  --brand-accent-warm: #F59E0B;
  --brand-accent-hot: #EF4444;
  --brand-accent-cool: #8B5CF6;
  --brand-accent-success: #10B981;

  /* Neutral Colors */
  --neutral-900: #171717;
  --neutral-800: #262626;
  --neutral-700: #404040;
  --neutral-600: #525252;
  --neutral-500: #737373;
  --neutral-400: #A3A3A3;
  --neutral-300: #D4D4D4;
  --neutral-200: #E5E5E5;
  --neutral-100: #F5F5F5;
  --neutral-50: #FAFAFA;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 300ms;
  --transition-slow: 500ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: 'Jost', sans-serif;
}

body {
  color: var(--neutral-900);
  background: linear-gradient(135deg, rgba(13, 59, 47, 0.7) 0%, rgba(30, 181, 113, 0.5) 100%);
}

a {
  color: inherit;
  text-decoration: none;
}
```

---

## Glassmorphism Patterns

### src/styles/branding.css

```css
/* Standard Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
}

/* Dark Glass Variant */
.glass-card-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
}

/* Intense Glass (for modals, overlays) */
.glass-intense {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
}

/* Glass Input Field */
.glass-input {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  transition: all var(--transition-base) var(--ease-in-out);
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--brand-primary-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 181, 113, 0.1);
}

/* Glass Button */
.glass-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base) var(--ease-in-out);
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## Jungle Background

### Layout Component with Jungle Background

```tsx
// src/components/layout/JungleLayout.tsx
export function JungleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jungle-bg min-h-screen">
      <div className="jungle-overlay" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

### CSS for Jungle Background

```css
/* src/styles/branding.css */

.jungle-bg {
  position: relative;
  background-image: url('/images/jungle-background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.jungle-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(13, 59, 47, 0.7) 0%,
    rgba(30, 181, 113, 0.5) 100%
  );
  z-index: 1;
}

.jungle-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}

/* Alternative: Blurred variant for better text readability */
.jungle-bg-blur {
  background-image: url('/images/jungle-background-blur.jpg');
}

/* Mobile optimization */
@media (max-width: 768px) {
  .jungle-bg {
    background-attachment: scroll;
  }
}
```

---

## Typography Setup

### Google Fonts Import

Add to `src/app/layout.tsx`:

```tsx
import { Jost } from 'next/font/google'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="font-jost">
        {children}
      </body>
    </html>
  )
}
```

### Typography Utility Classes

```css
/* src/styles/typography.css */

.text-display {
  font-size: 4.5rem;
  line-height: 1.1;
  font-weight: 700;
}

.text-h1 {
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 700;
}

.text-h2 {
  font-size: 2.25rem;
  line-height: 1.3;
  font-weight: 600;
}

.text-h3 {
  font-size: 1.875rem;
  line-height: 1.3;
  font-weight: 600;
}

.text-h4 {
  font-size: 1.5rem;
  line-height: 1.4;
  font-weight: 600;
}

.text-body-lg {
  font-size: 1.125rem;
  line-height: 1.7;
  font-weight: 400;
}

.text-body {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
}

@media (max-width: 768px) {
  .text-display {
    font-size: 2.5rem;
  }

  .text-h1 {
    font-size: 2rem;
  }

  .text-h2 {
    font-size: 1.75rem;
  }
}
```

---

## Component Examples

### Button Component

```tsx
// src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'glass'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variants = {
      primary: 'bg-gradient-to-r from-brand-primary-600 to-brand-primary-500 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-brand-primary-500',
      secondary: 'bg-brand-secondary-500 text-white hover:bg-brand-secondary-600 hover:shadow-lg hover:-translate-y-0.5 focus:ring-brand-secondary-500',
      accent: 'bg-gradient-to-r from-brand-accent-warm to-orange-500 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-brand-accent-warm',
      glass: 'glass-button text-white',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
```

### Card Component

```tsx
// src/components/ui/card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-dark' | 'glass-intense'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => {
    const variants = {
      glass: 'glass-card',
      'glass-dark': 'glass-card-dark',
      'glass-intense': 'glass-intense',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], 'p-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-h4 text-white', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-white/90', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }
```

### Input Component

```tsx
// src/components/ui/input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'glass' | 'solid'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'glass', ...props }, ref) => {
    const variants = {
      glass: 'glass-input text-white placeholder:text-white/60',
      solid: 'bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:border-brand-primary-500',
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-md transition-all duration-300',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
```

### Complete Form Example

```tsx
// Example usage in a form
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function VoiceGenerationForm() {
  return (
    <Card variant="glass" className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate AI Voice</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-white/90 mb-2">
              Enter your text
            </label>
            <textarea
              id="text"
              className="glass-input w-full px-4 py-3 rounded-md text-white placeholder:text-white/60 min-h-[150px]"
              placeholder="Type or paste your text here..."
            />
          </div>

          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-white/90 mb-2">
              Select Voice
            </label>
            <select
              id="voice"
              className="glass-input w-full px-4 py-3 rounded-md text-white"
            >
              <option>Professional Male (US)</option>
              <option>Friendly Female (UK)</option>
              <option>Energetic Young (AU)</option>
            </select>
          </div>

          <div className="flex gap-4">
            <Button variant="primary" className="flex-1">
              Generate Voice
            </Button>
            <Button variant="glass">
              Preview
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## Footer Requirement

### Footer Component

```tsx
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="mt-auto py-8 px-4">
      <div className="container mx-auto">
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Created with{' '}
            <span className="text-red-500">❤️</span> by{' '}
            <a
              href="https://smartcamp.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary-400 hover:text-brand-primary-300 transition-colors font-medium"
            >
              SmartCamp.AI
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Sticky Footer Layout

```tsx
// src/app/layout.tsx
import { Footer } from '@/components/layout/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="jungle-bg flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance Checklist

#### 1. Color Contrast

All text must meet minimum contrast ratios:

```tsx
// ✅ PASS: White text on primary-600 background
<div className="bg-brand-primary-600 text-white">
  High contrast text
</div>

// ✅ PASS: Dark text on light background
<div className="bg-neutral-100 text-neutral-900">
  High contrast text
</div>

// ❌ FAIL: Light text on light background
<div className="bg-brand-primary-200 text-white">
  Low contrast - avoid!
</div>
```

#### 2. Keyboard Navigation

```tsx
// All interactive elements must be keyboard accessible
<button
  className="glass-button"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Accessible Button
</button>

// Focus indicators
<style jsx>{`
  button:focus-visible {
    outline: 2px solid var(--brand-primary-500);
    outline-offset: 2px;
  }
`}</style>
```

#### 3. ARIA Labels

```tsx
// Screen reader support
<button
  aria-label="Generate voice from text"
  className="glass-button"
>
  <PlayIcon aria-hidden="true" />
</button>

// Form labels
<label htmlFor="voice-text" className="sr-only">
  Text to convert to speech
</label>
<textarea
  id="voice-text"
  aria-describedby="voice-text-help"
  placeholder="Enter your text..."
/>
<p id="voice-text-help" className="text-sm text-white/70">
  Maximum 10,000 characters
</p>
```

#### 4. Skip Links

```tsx
// src/components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-brand-primary-600 text-white px-4 py-2 rounded-lg"
    >
      Skip to main content
    </a>
  )
}
```

#### 5. Semantic HTML

```tsx
// Use proper heading hierarchy
<main id="main-content">
  <h1>AI Voice Generator</h1>
  <section>
    <h2>Generate Voice</h2>
    <h3>Select Voice Profile</h3>
  </section>
  <section>
    <h2>Recent Generations</h2>
  </section>
</main>
```

#### 6. Alt Text for Images

```tsx
<img
  src="/images/voice-preview.png"
  alt="Waveform visualization of generated voice showing audio amplitude over time"
  className="w-full"
/>

// Decorative images
<img
  src="/images/jungle-leaf.svg"
  alt=""
  role="presentation"
  aria-hidden="true"
/>
```

#### 7. Focus Management

```tsx
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    firstElement?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    return () => container.removeEventListener('keydown', handleTab)
  }, [isActive])

  return containerRef
}
```

#### 8. Screen Reader Only Utility Class

```css
/* src/styles/globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus-visible {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Accessibility Testing

```bash
# Install accessibility testing tools
npm install -D @axe-core/react eslint-plugin-jsx-a11y

# Add to eslint config
# .eslintrc.json
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"]
}

# Test with Lighthouse (Chrome DevTools)
# 1. Open Chrome DevTools
# 2. Go to Lighthouse tab
# 3. Select "Accessibility" category
# 4. Generate report
# 5. Aim for score > 95
```

---

## Summary

This branding implementation guide provides:

1. **Tailwind Configuration**: Complete color palette, typography, spacing, and utilities
2. **CSS Variables**: Consistent design tokens accessible throughout the app
3. **Glassmorphism**: Ready-to-use glass effect classes for cards, buttons, and inputs
4. **Jungle Background**: Implementation of the signature SmartCamp.AI jungle theme
5. **Typography**: Jost font setup with proper hierarchy
6. **Components**: Production-ready Button, Card, and Input components
7. **Footer**: Required attribution footer component
8. **Accessibility**: WCAG 2.1 AA compliance guidelines and examples

All components are responsive, accessible, and aligned with the SmartCamp.AI brand identity.
