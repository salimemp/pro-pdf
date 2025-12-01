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
      {/* Floating Button - Professional Design with Label */}
      <div className="fixed bottom-6 left-6 z-40 group">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 px-4 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 hover:border-white/30 rounded-full flex items-center gap-2"
          aria-label="Open accessibility menu"
          title="Accessibility Options"
        >
          {/* Icon with subtle background */}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Accessibility className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          
          {/* Label Text */}
          <span className="font-semibold text-white text-sm pr-1">
            Accessibility
          </span>
        </Button>

        {/* Tooltip for extra clarity */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-purple-500/30">
          ♿ Click to open accessibility options
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-purple-500/30"></div>
        </div>
      </div>

      {/* Accessibility Panel - Professional Design */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-40 w-96 animate-in slide-in-from-bottom-5 duration-300">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 shadow-2xl backdrop-blur-xl">
            {/* Header with Gradient */}
            <div className="p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-indigo-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Accessibility className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Accessibility</h3>
                    <p className="text-xs text-purple-300">
                      Enhance your experience
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white hover:bg-purple-600/20"
                  aria-label="Close accessibility menu"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* High Contrast */}
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-slate-800/50 border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500/50 text-white transition-all duration-200"
                onClick={toggleHighContrast}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">High Contrast Mode</div>
                    <div className="text-xs text-slate-400">
                      {highContrast ? 'Currently enabled' : 'Better visibility'}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    highContrast 
                      ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {highContrast ? 'ON' : 'OFF'}
                  </div>
                </div>
              </Button>

              {/* Read Aloud Controls */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-slate-800/50 border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500/50 text-white transition-all duration-200"
                  onClick={handleReadPageContent}
                  disabled={isReading}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Read Aloud</div>
                      <div className="text-xs text-slate-400">
                        {isReading ? 'Reading...' : 'Listen to page content'}
                      </div>
                    </div>
                  </div>
                </Button>

                {isReading && (
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10 bg-red-900/20 border-red-500/30 hover:bg-red-600/20 text-red-400 hover:text-red-300"
                    onClick={stopReading}
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop Reading
                  </Button>
                )}
              </div>

              {/* Keyboard Shortcuts */}
              <div className="pt-4 border-t border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-semibold text-white">
                    Keyboard Shortcuts
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                    <span className="text-slate-400">Toggle Contrast</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-purple-300 font-mono">Ctrl+Shift+C</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                    <span className="text-slate-400">Read Aloud</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-purple-300 font-mono">Ctrl+Shift+R</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                    <span className="text-slate-400">Stop Reading</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-purple-300 font-mono">Esc</kbd>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                    <span className="text-slate-400">Navigate</span>
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-purple-300 font-mono">Tab</kbd>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="pt-3 border-t border-purple-500/20">
                <p className="text-xs text-center text-slate-400">
                  💡 Designed for everyone, accessible to all
                </p>
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
