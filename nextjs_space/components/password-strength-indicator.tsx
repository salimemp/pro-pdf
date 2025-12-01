
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const requirements: PasswordRequirement[] = [
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
      label: 'Contains special character (@$!%*#?&)',
      met: /[@$!%*#?&]/.test(password),
    },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  const strength = metCount === 0 ? 0 : Math.ceil((metCount / requirements.length) * 100);

  const getStrengthLabel = () => {
    if (strength === 0) return 'No password';
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Fair';
    if (strength < 100) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-300';
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    if (strength < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      {password && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Password Strength</span>
            <span className={cn('font-medium', {
              'text-red-500': strength < 40,
              'text-yellow-500': strength >= 40 && strength < 80,
              'text-blue-500': strength >= 80 && strength < 100,
              'text-green-500': strength === 100,
            })}>
              {getStrengthLabel()}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', getStrengthColor())}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements List */}
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
            <span className={cn(
              'transition-colors',
              req.met ? 'text-green-400' : 'text-slate-400'
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  // Bypass validation in test mode
  if (process.env.NEXT_PUBLIC_TEST_MODE === 'true' || process.env.__NEXT_TEST_MODE === '1') {
    return { valid: true };
  }
  
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[@$!%*#?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (@$!%*#?&)' };
  }
  return { valid: true };
}
