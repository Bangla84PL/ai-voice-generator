import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glass card container */}
        <div className="glass-intense p-8 sm:p-10">
          {/* SmartCamp.AI Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              SmartCamp.AI
            </h1>
            <p className="text-white/70 text-sm">
              AI Voice Generator
            </p>
          </div>

          {/* Auth form content */}
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-sm mt-6">
          &copy; {new Date().getFullYear()} SmartCamp.AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
