
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'accepted', { 
      expires: 365,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    setShow(false);
  };

  const handleDecline = () => {
    Cookies.set('cookie-consent', 'declined', { 
      expires: 365,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none">
      <div className="container mx-auto max-w-6xl pointer-events-auto">
        <div className={cn(
          "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900",
          "border border-slate-700 rounded-xl shadow-2xl",
          "backdrop-blur-lg",
          "animate-in slide-in-from-bottom-5 duration-500"
        )}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-purple-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  We care about your privacy 🍪
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized content, 
                  and analyze our traffic. Your documents are always encrypted and secure. 
                  By clicking "Accept", you consent to our use of cookies.{' '}
                  <Link 
                    href="/privacy" 
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                  >
                    Learn more about our privacy policy
                  </Link>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAccept}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Accept All Cookies
                </Button>
              </div>

              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecline}
                className="absolute top-2 right-2 md:hidden text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
