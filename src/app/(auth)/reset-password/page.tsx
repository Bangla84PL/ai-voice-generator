'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset email. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: 'Success',
        description: 'Password reset email sent. Please check your inbox.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
          <p className="text-white/70 text-sm">
            We've sent a password reset link to
          </p>
          <p className="text-white font-medium">{getValues('email')}</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-white/60 text-sm">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>

          <div className="pt-2">
            <p className="text-white/60 text-sm mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setIsLoading(false);
              }}
            >
              Try Another Email
            </Button>
          </div>
        </div>

        <div className="pt-6">
          <Link
            href="/signin"
            className="inline-flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-white/70 text-sm">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register('email')}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      {/* Back to Sign In Link */}
      <div className="text-center pt-4">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
