
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Loader2,
  RotateCw,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFPreviewProps {
  file: File;
  className?: string;
  showControls?: boolean;
  onPageClick?: (x: number, y: number, pageNumber: number) => void;
  interactive?: boolean;
}

export function PDFPreview({ 
  file, 
  className, 
  showControls = true,
  onPageClick,
  interactive = false 
}: PDFPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF document
  useEffect(() => {
    if (!file || file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF file.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const fileUrl = URL.createObjectURL(file);
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        if (!isMounted) {
          URL.revokeObjectURL(fileUrl);
          return;
        }

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
        
        URL.revokeObjectURL(fileUrl);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError('Failed to load PDF');
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [file]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    try {
      // Cancel any ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(currentPage);
      
      // Calculate viewport with rotation and scale
      const viewport = page.getViewport({ 
        scale: scale,
        rotation: rotation 
      });

      // Set canvas dimensions for high-DPI displays
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Scale context for high-DPI
      const transform = outputScale !== 1 
        ? [outputScale, 0, 0, outputScale, 0, 0] 
        : undefined;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform,
      } as any;

      // Render the page
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [pdfDoc, currentPage, scale, rotation]);

  // Trigger render when dependencies change
  useEffect(() => {
    if (pdfDoc) {
      renderPage();
    }
  }, [pdfDoc, renderPage]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4.0));
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

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onPageClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to PDF coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pdfX = x * scaleX;
    const pdfY = y * scaleY;

    onPageClick(pdfX, pdfY, currentPage);
  };

  if (loading) {
    return (
      <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            <p className="text-slate-300">Loading high-fidelity preview...</p>
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
          {/* PDF Canvas */}
          <div 
            ref={containerRef}
            className="relative bg-slate-900 rounded-lg overflow-auto flex items-center justify-center p-4"
          >
            <canvas 
              ref={canvasRef} 
              className={cn(
                "max-w-full h-auto shadow-2xl",
                interactive && "cursor-crosshair"
              )}
              onClick={handleCanvasClick}
            />
          </div>

          {/* Controls */}
          {showControls && numPages > 0 && (
            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg gap-4">
              {/* Page Navigation */}
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

              {/* Zoom Controls */}
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
                        disabled={scale >= 4.0}
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

              {/* Rotate Control */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRotate}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rotate page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="truncate">{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
