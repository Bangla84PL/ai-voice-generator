'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema
const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Too weak',
    color: 'bg-red-500',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  // Watch password field for strength indicator
  const watchPassword = watch('password', '');

  useEffect(() => {
    setPassword(watchPassword);
    calculatePasswordStrength(watchPassword);
  }, [watchPassword]);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;

    if (!pwd) {
      setPasswordStrength({ score: 0, label: 'Too weak', color: 'bg-red-500' });
      return;
    }

    // Length check
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&]/.test(pwd)) score++;

    // Set strength based on score
    if (score <= 2) {
      setPasswordStrength({ score: 1, label: 'Weak', color: 'bg-red-500' });
    } else if (score <= 4) {
      setPasswordStrength({ score: 2, label: 'Fair', color: 'bg-orange-500' });
    } else if (score <= 5) {
      setPasswordStrength({ score: 3, label: 'Good', color: 'bg-yellow-500' });
    } else {
      setPasswordStrength({ score: 4, label: 'Strong', color: 'bg-green-500' });
    }
  };

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update password. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });

      // Redirect to dashboard after successful password update
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
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

  // Password requirements checklist
  const requirements = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character (@$!%*?&)',
      met: /[@$!%*?&]/.test(password),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Update Your Password
        </h2>
        <p className="text-white/70 text-sm">
          Choose a strong password to secure your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              className="pl-10"
              {...register('password')}
              disabled={isLoading}
              autoFocus
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">
              {errors.password.message}
            </p>
          )}

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Password strength:</span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    passwordStrength.score === 1 && 'text-red-400',
                    passwordStrength.score === 2 && 'text-orange-400',
                    passwordStrength.score === 3 && 'text-yellow-400',
                    passwordStrength.score === 4 && 'text-green-400'
                  )}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-300',
                      level <= passwordStrength.score
                        ? passwordStrength.color
                        : 'bg-white/20'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirm New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              className="pl-10"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password Requirements Checklist */}
        {password && (
          <div className="space-y-2 p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs font-medium text-white/80 mb-2">
              Password must contain:
            </p>
            <div className="space-y-1.5">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  {req.met ? (
                    <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-xs transition-colors',
                      req.met ? 'text-white/90' : 'text-white/50'
                    )}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating password...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </form>

      {/* Security Note */}
      <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
        <p className="text-xs text-white/70 text-center">
          For your security, you'll be automatically signed in after updating your password.
        </p>
      </div>
    </div>
  );
}
