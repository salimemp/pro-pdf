
'use client';

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  variant?: 'banner' | 'sidebar' | 'rectangle' | 'small';
  className?: string;
  label?: string;
}

export function AdPlaceholder({ 
  variant = 'banner', 
  className,
  label = 'Advertisement'
}: AdPlaceholderProps) {
  const variants = {
    banner: 'w-full h-24 md:h-32',
    sidebar: 'w-full h-[600px]',
    rectangle: 'w-full h-64',
    small: 'w-full h-20'
  };

  return (
    <Card className={cn(
      "flex items-center justify-center border-2 border-dashed border-slate-700/50 bg-slate-900/30",
      variants[variant],
      className
    )}>
      <div className="text-center space-y-2">
        <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
          {label}
        </div>
        <div className="text-sm text-slate-600">
          {variant === 'banner' && '728 × 90'}
          {variant === 'sidebar' && '300 × 600'}
          {variant === 'rectangle' && '336 × 280'}
          {variant === 'small' && '468 × 60'}
        </div>
      </div>
    </Card>
  );
}
