'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Eye, 
  Pause, 
  Play, 
  SkipForward,
  SkipBack
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  isReading: boolean;
  toggleReading: () => void;
  readText: (text: string) => void;
  stopReading: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynthesis(window.speechSynthesis);
    }

    // Load saved preferences
    const savedHighContrast = localStorage.getItem('pro_pdf_high_contrast') === 'true';
    setHighContrast(savedHighContrast);
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }

    // Add keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + C: Toggle high contrast
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggleHighContrast();
      }

      // Ctrl/Cmd + Shift + R: Toggle read aloud
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        toggleReading();
      }

      // Escape: Stop reading
      if (e.key === 'Escape' && isReading) {
        e.preventDefault();
        stopReading();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isReading]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('pro_pdf_high_contrast', String(newValue));
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      toast.success('High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      toast.success('High contrast mode disabled');
    }
  };

  const readText = (text: string) => {
    if (!synthesis) {
      toast.error('Text-to-speech not supported in this browser');
      return;
    }

    // Stop any current reading
    stopReading();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setIsReading(true);
      setCurrentUtterance(utterance);
    };

    utterance.onend = () => {
      setIsReading(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsReading(false);
      setCurrentUtterance(null);
      toast.error('Failed to read text');
    };

    synthesis.speak(utterance);
  };

  const stopReading = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
    }
  };

  const toggleReading = () => {
    if (isReading) {
      stopReading();
      toast.info('Reading stopped');
    } else {
      // Read the main content
      const mainContent = document.querySelector('main');
      if (mainContent) {
        const text = mainContent.textContent || '';
        readText(text);
        toast.info('Reading started');
      }
    }
  };

  const announceToScreenReader = (message: string) => {
    // Create a temporary live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value: AccessibilityContextType = {
    highContrast,
    toggleHighContrast,
    isReading,
    toggleReading,
    readText,
    stopReading,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Accessibility Toolbar - Floating widget for accessibility controls
 */
export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    highContrast, 
    toggleHighContrast, 
    isReading, 
    toggleReading,
    stopReading,
    readText
  } = useAccessibility();

  const handleReadPageContent = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const headings = Array.from(mainContent.querySelectorAll('h1, h2, h3'));
      const paragraphs = Array.from(mainContent.querySelectorAll('p'));
      
      let text = '';
      headings.forEach(h => {
        text += h.textContent + '. ';
      });
      paragraphs.slice(0, 5).forEach(p => {
        text += p.textContent + '. ';
      });

      if (text) {
        readText(text);
        toast.success('Reading page content');
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
          aria-label="Open accessibility menu"
        >
          <Accessibility className="w-6 h-6" />
        </Button>
      </div>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80">
          <Card className="bg-slate-800 border-slate-700 shadow-xl">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Accessibility
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enhance your experience
              </p>
            </div>

            <div className="p-4 space-y-3">
              {/* High Contrast */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleHighContrast}
              >
                <Eye className="w-4 h-4 mr-2" />
                {highContrast ? 'Disable' : 'Enable'} High Contrast
              </Button>

              {/* Read Aloud Controls */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleReadPageContent}
                  disabled={isReading}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Read Page Content
                </Button>

                {isReading && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={stopReading}
                    >
                      <VolumeX className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <div className="pt-3 border-t border-slate-700">
                <p className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1">
                  <Keyboard className="w-3 h-3" />
                  Keyboard Shortcuts
                </p>
                <div className="space-y-1 text-xs text-slate-400">
                  <div>Ctrl+Shift+C: Toggle Contrast</div>
                  <div>Ctrl+Shift+R: Read Aloud</div>
                  <div>Esc: Stop Reading</div>
                  <div>Tab: Navigate Elements</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

/**
 * Skip Navigation Link - For keyboard users
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
