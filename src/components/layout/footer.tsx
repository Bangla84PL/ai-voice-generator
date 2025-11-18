import { cn } from '@/lib/utils';
import { Facebook, Github, Heart, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export interface FooterProps {
  /**
   * Custom className
   */
  className?: string;
  /**
   * Whether to use a glass background
   */
  glass?: boolean;
}

const footerLinks = {
  product: [
    { label: 'Generate', href: '/generate' },
    { label: 'Library', href: '/library' },
    { label: 'Projects', href: '/projects' },
    { label: 'Pricing', href: '/pricing' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Support', href: '/support' },
    { label: 'Status', href: 'https://status.smartcamp.ai' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Acceptable Use', href: '/acceptable-use' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
};

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com/smartcampai', icon: Twitter },
  { label: 'Facebook', href: 'https://facebook.com/smartcampai', icon: Facebook },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/smartcampai', icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/smartcampai', icon: Github },
];

/**
 * Footer - Main footer component
 *
 * Features:
 * - SmartCamp.AI attribution (required)
 * - Links to privacy, terms, docs, support
 * - Social media links
 * - Dynamic copyright year
 * - Responsive grid layout
 * - Glassmorphism styling option
 * - Accessible navigation
 *
 * @example
 * ```tsx
 * <Footer glass />
 * ```
 */
export function Footer({ className, glass = true }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'border-t border-white/10 py-12',
        glass && 'glass-card-dark backdrop-blur-lg',
        !glass && 'bg-neutral-900',
        className,
      )}
      role="contentinfo"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 transition-transform duration-200 hover:scale-105"
              aria-label="SmartCamp.AI Voice Generator Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 shadow-md">
                <span className="text-xl font-bold text-white">SC</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                SmartCamp<span className="text-primary-500">.AI</span>
              </span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Transform text into natural-sounding speech with AI-powered voice generation.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 hover:bg-primary-500/20"
                    aria-label={`Visit SmartCamp.AI on ${social.label}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Product</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Resources</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-500"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {currentYear} SmartCamp.AI. All rights reserved.
            </p>

            {/* Required Attribution */}
            <p className="flex items-center gap-1 text-sm font-medium text-foreground">
              Created with <Heart className="h-4 w-4 fill-red-500 text-red-500" aria-label="love" /> by{' '}
              <a
                href="https://smartcamp.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-500 transition-colors hover:text-primary-400"
              >
                SmartCamp.AI
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
