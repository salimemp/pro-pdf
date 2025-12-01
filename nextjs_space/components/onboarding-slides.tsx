
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Merge, 
  Scissors, 
  Archive, 
  FileSignature,
  Cloud,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    icon: <FileText className="w-16 h-16" />,
    title: 'Welcome to PRO PDF',
    description: 'Your all-in-one professional PDF toolkit. Convert, edit, and manage your documents with military-grade security.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: <Merge className="w-16 h-16" />,
    title: 'Merge & Split PDFs',
    description: 'Combine multiple PDFs into one or split large documents into smaller files. Simple drag-and-drop interface.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: <Archive className="w-16 h-16" />,
    title: 'Compress & Convert',
    description: 'Reduce file sizes without losing quality. Convert between PDF, Word, Excel, PowerPoint, and image formats effortlessly.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: <FileSignature className="w-16 h-16" />,
    title: 'Sign & Share',
    description: 'Add digital signatures with scribble or upload options. Create shareable links with document control and expiration.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: <Cloud className="w-16 h-16" />,
    title: 'Cloud Storage',
    description: 'Premium users get secure cloud storage for all conversions. Access your files anytime, anywhere with full encryption.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: <Shield className="w-16 h-16" />,
    title: 'Zero-Knowledge Security',
    description: 'Your files are encrypted end-to-end. We never see your data. Guest files auto-delete when you close the browser.',
    gradient: 'from-pink-500 to-rose-500'
  }
];

export function OnboardingSlides() {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding (client-side only)
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('pro_pdf_onboarding_completed');
      if (!hasSeenOnboarding) {
        // Show onboarding after a short delay for better UX
        const timer = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Listen for custom event to manually trigger onboarding
  useEffect(() => {
    const handleShowOnboarding = () => {
      setCurrentSlide(0);
      setOpen(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('showOnboarding', handleShowOnboarding);
      return () => window.removeEventListener('showOnboarding', handleShowOnboarding);
    }
  }, []);

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pro_pdf_onboarding_completed', 'true');
    }
    setOpen(false);
    setCurrentSlide(0); // Reset for next time
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Prevent closing the dialog by clicking outside or pressing Escape
  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing - user must use Skip or complete the tour
    return;
  };

  const slide = slides[currentSlide];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-2xl bg-slate-900 border-slate-700 text-white p-0 overflow-hidden"
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>{slide.title}</DialogTitle>
        </VisuallyHidden>

        <div className="relative min-h-[500px] flex flex-col">
          {/* Slide Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br",
              slide.gradient,
              "text-white shadow-2xl"
            )}>
              {slide.icon}
            </div>

            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                {slide.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-slate-800/50 p-6 border-t border-slate-700">
            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentSlide
                        ? "bg-purple-500 w-8"
                        : "bg-slate-600 hover:bg-slate-500"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex space-x-3">
                {/* Skip button - always visible */}
                {currentSlide < slides.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Skip
                  </Button>
                )}
                
                {/* Previous button - only show after first slide */}
                {currentSlide > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
                
                {/* Next/Get Started button */}
                <Button
                  onClick={handleNext}
                  className={cn(
                    "bg-gradient-to-r text-white",
                    slide.gradient
                  )}
                >
                  {currentSlide < slides.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
