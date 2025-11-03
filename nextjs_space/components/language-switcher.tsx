
'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n/context';
import { languages } from '@/lib/i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Switch language"
          aria-haspopup="true"
          aria-expanded="false"
          data-state="closed"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language - Current: {currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" role="menu" aria-label="Language options">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent' : ''}
            role="menuitem"
            aria-current={language === lang.code ? 'true' : 'false'}
          >
            <span className="flex items-center gap-2">
              {lang.nativeName}
              {language === lang.code && (
                <span className="text-xs text-muted-foreground">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
