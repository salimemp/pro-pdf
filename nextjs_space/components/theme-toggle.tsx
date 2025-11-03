
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-slate-800/50"
          aria-label="Toggle theme"
          aria-haspopup="true"
          aria-expanded="false"
          data-testid="theme-toggle"
          data-state="closed"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme - Current: {theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" role="menu" aria-label="Theme options">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          data-testid="theme-light"
          role="menuitem"
          aria-current={theme === 'light' ? 'true' : 'false'}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          data-testid="theme-dark"
          role="menuitem"
          aria-current={theme === 'dark' ? 'true' : 'false'}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          data-testid="theme-system"
          role="menuitem"
          aria-current={theme === 'system' ? 'true' : 'false'}
        >
          <span className="mr-2">💻</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
