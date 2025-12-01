"use client";

import React, { useState, useRef } from "react";
import { EyeOff, Upload, Download, Search, Square, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf-worker.js`;

interface RedactionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  id: string;
}

export default function RedactPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [redactions, setRedactions] = useState<RedactionArea[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showWarning, setShowWarning] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    setCurrentPage(1);
    renderPage(pdf, 1);
    toast.success("PDF loaded successfully!");
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Draw redaction boxes
    renderRedactions(context, pageNum);
  };

  const renderRedactions = (context: CanvasRenderingContext2D, pageNum: number) => {
    const pageRedactions = redactions.filter(r => r.page === pageNum);
    
    pageRedactions.forEach(redaction => {
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(redaction.x, redaction.y, redaction.width, redaction.height);
      context.strokeStyle = "#F44336";
      context.lineWidth = 2;
      context.strokeRect(redaction.x, redaction.y, redaction.width, redaction.height);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDrawing(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - startPos.x;
    const height = endY - startPos.y;

    if (Math.abs(width) > 10 && Math.abs(height) > 10) {
      const newRedaction: RedactionArea = {
        id: Date.now().toString(),
        x: Math.min(startPos.x, endX),
        y: Math.min(startPos.y, endY),
        width: Math.abs(width),
        height: Math.abs(height),
        page: currentPage,
      };

      setRedactions([...redactions, newRedaction]);
      if (pdfDoc) {
        renderPage(pdfDoc, currentPage);
      }
      toast.success("Redaction area added!");
    }

    setIsDrawing(false);
  };

  const searchAndRedact = async () => {
    if (!searchTerm || !pdfDoc) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      let foundCount = 0;
      const newRedactions: RedactionArea[] = [];

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.5 });

        textContent.items.forEach((item: any) => {
          if (item.str && item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
            const tx = pdfjsLib.Util.transform(
              viewport.transform,
              item.transform
            );
            
            newRedactions.push({
              id: `${Date.now()}-${foundCount}`,
              x: tx[4],
              y: viewport.height - tx[5] - item.height * 1.5,
              width: item.width,
              height: item.height * 1.5,
              page: pageNum,
            });
            foundCount++;
          }
        });
      }

      if (foundCount > 0) {
        setRedactions([...redactions, ...newRedactions]);
        renderPage(pdfDoc, currentPage);
        toast.success(`Found and marked ${foundCount} instances for redaction`);
      } else {
        toast.info("No matches found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    }
  };

  const removeRedaction = (id: string) => {
    setRedactions(redactions.filter(r => r.id !== id));
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    toast.success("Redaction removed");
  };

  const clearAllRedactions = () => {
    setRedactions([]);
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    toast.success("All redactions cleared");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const downloadRedactedPDF = async () => {
    if (!file || redactions.length === 0) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Apply redactions
      redactions.forEach(redaction => {
        const page = pages[redaction.page - 1];
        if (!page) return;

        const { height } = page.getSize();
        
        // Draw black rectangle over redacted area
        page.drawRectangle({
          x: redaction.x,
          y: height - redaction.y - redaction.height,
          width: redaction.width,
          height: redaction.height,
          color: rgb(0, 0, 0),
          opacity: 1,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Redacted PDF downloaded!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to download redacted PDF");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 mb-4">
            <EyeOff className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">PDF Redaction</h1>
          <p className="text-muted-foreground">
            Permanently remove sensitive information from your PDFs
          </p>
        </div>

        {/* Warning */}
        {showWarning && (
          <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Important: Redaction is Permanent
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Redacted information will be permanently removed and cannot be recovered. Always keep a backup of the original document.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWarning(false)}
                className="text-yellow-600 dark:text-yellow-400"
              >
                Dismiss
              </Button>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-[350px,1fr] gap-6">
          {/* Left Sidebar */}
          <Card className="p-6 h-fit">
            <h2 className="font-semibold mb-4">Redaction Tools</h2>
            
            {/* File Upload */}
            {!file && (
              <div className="mb-6">
                <Label htmlFor="file-upload" className="mb-2">
                  Upload PDF
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            )}

            {file && (
              <>
                {/* Manual Redaction */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2 mb-2">
                    <Square className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        Manual Selection
                      </h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Click and drag on the PDF to mark areas for redaction
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search and Redact */}
                <div className="mb-6">
                  <Label htmlFor="search-term" className="mb-2">
                    Search & Redact
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-term"
                      placeholder="Enter text to find"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchAndRedact()}
                    />
                    <Button onClick={searchAndRedact} size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Find and mark all instances of a specific term
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600"
                    onClick={clearAllRedactions}
                    disabled={redactions.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Redactions
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm font-medium mb-1">Redactions</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{redactions.length}</span>
                    <Badge variant="secondary">
                      {redactions.filter(r => r.page === currentPage).length} on this page
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Main Canvas Area */}
          <Card className="p-6">
            {!file ? (
              <div className="flex flex-col items-center justify-center h-[600px] text-center">
                <Upload className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No PDF Loaded</h3>
                <p className="text-muted-foreground">Upload a PDF file to start redacting sensitive information</p>
              </div>
            ) : (
              <>
                {/* Page Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>

                {/* Canvas */}
                <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-4 max-h-[700px]">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className="mx-auto cursor-crosshair shadow-lg"
                  />
                </div>

                {/* Download */}
                <div className="mt-4">
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={downloadRedactedPDF}
                    disabled={redactions.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Redacted PDF ({redactions.length} redactions)
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Redactions List */}
        {redactions.length > 0 && (
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Redaction Areas ({redactions.length})</h3>
              <Button variant="outline" size="sm" onClick={clearAllRedactions}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {redactions.map(redaction => (
                <div
                  key={redaction.id}
                  className="flex items-center justify-between p-3 rounded border hover:bg-accent cursor-pointer"
                  onClick={() => handlePageChange(redaction.page)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <EyeOff className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Page {redaction.page}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(redaction.width)} × {Math.round(redaction.height)}px
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRedaction(redaction.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
