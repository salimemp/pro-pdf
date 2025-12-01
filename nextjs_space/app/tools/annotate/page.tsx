"use client";

import React, { useState, useRef } from "react";
import { FileText, MessageSquare, Highlighter, Square, Circle, Type, ArrowRight, Download, Upload, Trash2, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf-worker.js`;

interface Annotation {
  id: string;
  type: "comment" | "highlight" | "rectangle" | "circle" | "arrow" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  page: number;
}

export default function AnnotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<"comment" | "highlight" | "rectangle" | "circle" | "arrow" | "text">("comment");
  const [selectedColor, setSelectedColor] = useState("#FFEB3B");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: "Yellow", value: "#FFEB3B" },
    { name: "Green", value: "#4CAF50" },
    { name: "Blue", value: "#2196F3" },
    { name: "Red", value: "#F44336" },
    { name: "Purple", value: "#9C27B0" },
    { name: "Orange", value: "#FF9800" },
  ];

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

    // Redraw annotations for current page
    renderAnnotations(context, pageNum);
  };

  const renderAnnotations = (context: CanvasRenderingContext2D, pageNum: number) => {
    const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
    
    pageAnnotations.forEach(ann => {
      context.strokeStyle = ann.color;
      context.fillStyle = ann.color;
      context.lineWidth = 2;

      switch (ann.type) {
        case "highlight":
          context.globalAlpha = 0.3;
          context.fillRect(ann.x, ann.y, ann.width || 100, ann.height || 20);
          context.globalAlpha = 1.0;
          break;
        case "rectangle":
          context.strokeRect(ann.x, ann.y, ann.width || 100, ann.height || 100);
          break;
        case "circle":
          context.beginPath();
          const radius = Math.min(ann.width || 50, ann.height || 50) / 2;
          context.arc(ann.x + radius, ann.y + radius, radius, 0, 2 * Math.PI);
          context.stroke();
          break;
        case "arrow":
          context.beginPath();
          context.moveTo(ann.x, ann.y);
          const endX = ann.x + (ann.width || 100);
          const endY = ann.y + (ann.height || 0);
          context.lineTo(endX, endY);
          context.stroke();
          // Arrow head
          const angle = Math.atan2(endY - ann.y, endX - ann.x);
          context.beginPath();
          context.moveTo(endX, endY);
          context.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
          context.moveTo(endX, endY);
          context.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
          context.stroke();
          break;
        case "comment":
          // Draw comment icon
          context.fillStyle = ann.color;
          context.fillRect(ann.x, ann.y, 30, 30);
          context.fillStyle = "white";
          context.font = "20px Arial";
          context.fillText("💬", ann.x + 5, ann.y + 23);
          break;
        case "text":
          context.fillStyle = ann.color;
          context.font = "16px Arial";
          context.fillText(ann.text || "", ann.x, ann.y);
          break;
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfDoc) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === "comment") {
      const comment = prompt("Enter your comment:");
      if (comment) {
        addAnnotation({
          id: Date.now().toString(),
          type: "comment",
          x,
          y,
          text: comment,
          color: selectedColor,
          page: currentPage,
        });
      }
    } else if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        addAnnotation({
          id: Date.now().toString(),
          type: "text",
          x,
          y,
          text,
          color: selectedColor,
          page: currentPage,
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || selectedTool === "comment" || selectedTool === "text") return;

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

    addAnnotation({
      id: Date.now().toString(),
      type: selectedTool,
      x: startPos.x,
      y: startPos.y,
      width: endX - startPos.x,
      height: endY - startPos.y,
      color: selectedColor,
      page: currentPage,
    });

    setIsDrawing(false);
  };

  const addAnnotation = (annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAnnotations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    toast.success("Annotation added!");
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAnnotations(history[historyIndex - 1]);
      if (pdfDoc) {
        renderPage(pdfDoc, currentPage);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAnnotations(history[historyIndex + 1]);
      if (pdfDoc) {
        renderPage(pdfDoc, currentPage);
      }
    }
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    setHistory([]);
    setHistoryIndex(-1);
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    toast.success("All annotations cleared");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const downloadAnnotatedPDF = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Add annotations to PDF
      annotations.forEach(ann => {
        const page = pages[ann.page - 1];
        if (!page) return;

        const { height } = page.getSize();
        const colorRgb = hexToRgb(ann.color);

        switch (ann.type) {
          case "text":
            page.drawText(ann.text || "", {
              x: ann.x,
              y: height - ann.y,
              size: 12,
              color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
            });
            break;
          case "rectangle":
            page.drawRectangle({
              x: ann.x,
              y: height - ann.y - (ann.height || 0),
              width: ann.width || 0,
              height: ann.height || 0,
              borderColor: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
              borderWidth: 2,
            });
            break;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Annotated PDF downloaded!");
    } catch (error) {
      toast.error("Failed to download annotated PDF");
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 1, g: 1, b: 0 };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">PDF Annotations & Comments</h1>
          <p className="text-muted-foreground">Add comments, highlights, shapes, and text to your PDFs</p>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          {/* Left Sidebar - Tools */}
          <Card className="p-6 h-fit">
            <h2 className="font-semibold mb-4">Annotation Tools</h2>
            
            {/* File Upload */}
            {!file && (
              <div className="mb-6">
                <label htmlFor="file-upload" className="block mb-2 text-sm font-medium">
                  Upload PDF
                </label>
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
                {/* Tools */}
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium mb-2">Select Tool</p>
                  {[
                    { icon: MessageSquare, label: "Comment", value: "comment" },
                    { icon: Highlighter, label: "Highlight", value: "highlight" },
                    { icon: Square, label: "Rectangle", value: "rectangle" },
                    { icon: Circle, label: "Circle", value: "circle" },
                    { icon: ArrowRight, label: "Arrow", value: "arrow" },
                    { icon: Type, label: "Text", value: "text" },
                  ].map(({ icon: Icon, label, value }) => (
                    <Button
                      key={value}
                      variant={selectedTool === value ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedTool(value as any)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Colors */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Color</p>
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map(color => (
                      <button
                        key={color.value}
                        className={`w-full h-10 rounded border-2 transition-all ${
                          selectedColor === color.value ? "border-primary scale-110" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <Redo className="h-4 w-4 mr-2" />
                    Redo
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600"
                    onClick={clearAnnotations}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
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
                <p className="text-muted-foreground">Upload a PDF file to start annotating</p>
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
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    className="mx-auto cursor-crosshair shadow-lg"
                  />
                </div>

                {/* Download */}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={downloadAnnotatedPDF}
                    disabled={annotations.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Annotated PDF ({annotations.length} annotations)
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Annotations List */}
        {annotations.length > 0 && (
          <Card className="p-6 mt-6">
            <h3 className="font-semibold mb-4">Annotations ({annotations.length})</h3>
            <div className="space-y-2">
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  className="flex items-center justify-between p-3 rounded border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: ann.color }}
                    />
                    <span className="text-sm font-medium">{ann.type}</span>
                    {ann.text && <span className="text-sm text-muted-foreground">: {ann.text}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">Page {ann.page}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
