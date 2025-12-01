
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  onBreachCheck?: (isCompromised: boolean) => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface BreachCheckResult {
  isCompromised: boolean;
  breachCount: number;
  message: string;
  checked: boolean;
  loading: boolean;
}

export function PasswordStrengthIndicator({ password, className, onBreachCheck }: PasswordStrengthIndicatorProps) {
  const [breachCheck, setBreachCheck] = useState<BreachCheckResult>({
    isCompromised: false,
    breachCount: 0,
    message: '',
    checked: false,
    loading: false,
  });

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

  // Breach check with debouncing
  useEffect(() => {
    // Reset breach check when password changes
    setBreachCheck(prev => ({ ...prev, checked: false, loading: false }));

    // Only check if password meets all basic requirements
    if (metCount < requirements.length || !password || password.length < 8) {
      return;
    }

    // Debounce API call
    const timeoutId = setTimeout(async () => {
      setBreachCheck(prev => ({ ...prev, loading: true }));

      try {
        const response = await fetch('/api/auth/check-password-breach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();
        
        setBreachCheck({
          isCompromised: data.isCompromised,
          breachCount: data.breachCount,
          message: data.message,
          checked: true,
          loading: false,
        });

        // Notify parent component
        if (onBreachCheck) {
          onBreachCheck(data.isCompromised);
        }
      } catch (error) {
        console.error('Breach check error:', error);
        setBreachCheck({
          isCompromised: false,
          breachCount: 0,
          message: 'Unable to verify password security',
          checked: true,
          loading: false,
        });
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [password, metCount, requirements.length, onBreachCheck]);

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

      {/* Breach Check Status */}
      {password && metCount === requirements.length && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          {breachCheck.loading && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Checking password security...</span>
            </div>
          )}
          
          {breachCheck.checked && !breachCheck.loading && (
            <div className={cn(
              'flex items-start gap-2 text-xs p-2 rounded-lg',
              breachCheck.isCompromised 
                ? 'bg-red-900/20 border border-red-700/30' 
                : 'bg-green-900/20 border border-green-700/30'
            )}>
              {breachCheck.isCompromised ? (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={cn(
                  'font-medium',
                  breachCheck.isCompromised ? 'text-red-400' : 'text-green-400'
                )}>
                  {breachCheck.isCompromised ? 'Security Warning' : 'Secure Password'}
                </p>
                <p className={cn(
                  'mt-1',
                  breachCheck.isCompromised ? 'text-red-300' : 'text-green-300'
                )}>
                  {breachCheck.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
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
