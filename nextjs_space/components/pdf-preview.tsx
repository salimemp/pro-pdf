
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFPreviewProps {
  file: File;
  className?: string;
  showControls?: boolean;
}

export function PDFPreview({ file, className, showControls = true }: PDFPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file || file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      setLoading(false);
      return;
    }

    // Create a high-quality thumbnail preview
    const generatePreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamically import PDF.js to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const fileUrl = URL.createObjectURL(file);
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        setNumPages(pdf.numPages);

        // Render first page as preview
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: scale * 2 }); // Higher scale for better quality

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Create thumbnail URL from canvas
        const url = canvas.toDataURL('image/png', 1.0); // Maximum quality
        setThumbnailUrl(url);
        setLoading(false);

        // Cleanup
        URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.error('Error generating PDF preview:', err);
        setError('Failed to generate preview');
        setLoading(false);
      }
    };

    generatePreview();
  }, [file, currentPage, scale]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, numPages));
  };

  if (loading) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="text-slate-300">Generating high-quality preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <FileText className="w-12 h-12 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Preview Canvas (hidden, used for rendering) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Preview Image */}
          {thumbnailUrl && (
            <div className="relative bg-slate-900 rounded-lg overflow-hidden">
              <div className="max-h-[600px] overflow-auto">
                <img 
                  src={thumbnailUrl} 
                  alt={`PDF Preview - Page ${currentPage}`}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Controls */}
          {showControls && numPages > 0 && (
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Previous page</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-sm text-slate-300 min-w-[80px] text-center">
                  {currentPage} / {numPages}
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === numPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Next page</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zoom out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="text-sm text-slate-300 min-w-[50px] text-center">
                  {Math.round(scale * 100)}%
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        disabled={scale >= 3.0}
                        className="h-8 w-8 p-0"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zoom in</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
