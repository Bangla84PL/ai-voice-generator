import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Voice Generator - SmartCamp.AI',
    template: '%s | SmartCamp.AI',
  },
  description:
    'Transform text into natural-sounding speech with AI-powered voices. Create professional voiceovers, audiobooks, and more with SmartCamp.AI Voice Generator.',
  keywords: [
    'AI voice generator',
    'text to speech',
    'TTS',
    'voice synthesis',
    'audio generation',
    'voiceover',
    'SmartCamp.AI',
  ],
  authors: [{ name: 'SmartCamp.AI' }],
  creator: 'SmartCamp.AI',
  publisher: 'SmartCamp.AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://smartcamp.ai'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Voice Generator - SmartCamp.AI',
    description:
      'Transform text into natural-sounding speech with AI-powered voices.',
    siteName: 'SmartCamp.AI',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SmartCamp.AI Voice Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Voice Generator - SmartCamp.AI',
    description:
      'Transform text into natural-sounding speech with AI-powered voices.',
    images: ['/images/og-image.jpg'],
    creator: '@SmartCampAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.variable}>
      <head>
        {/* Plausible Analytics */}
        <script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'smartcamp.ai'}
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {/* Jungle background wrapper */}
        <div className="jungle-bg min-h-screen">
          {children}
        </div>

        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
