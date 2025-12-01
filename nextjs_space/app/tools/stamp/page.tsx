"use client";

import React, { useState, useRef } from "react";
import { Stamp, Upload, Download, Check, X, FileText, Calendar, User, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf-worker.js`;

interface StampConfig {
  type: "predefined" | "custom" | "image";
  text?: string;
  color: string;
  includeDate: boolean;
  includeUser: boolean;
  userName?: string;
  image?: string;
}

interface PlacedStamp {
  x: number;
  y: number;
  page: number;
  config: StampConfig;
}

export default function StampPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stamps, setStamps] = useState<PlacedStamp[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<StampConfig>({
    type: "predefined",
    text: "APPROVED",
    color: "#4CAF50",
    includeDate: true,
    includeUser: false,
  });
  const [customText, setCustomText] = useState("");
  const [userName, setUserName] = useState("");
  const [stampImage, setStampImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const predefinedStamps = [
    { text: "APPROVED", color: "#4CAF50", icon: Check },
    { text: "REJECTED", color: "#F44336", icon: X },
    { text: "CONFIDENTIAL", color: "#E91E63", icon: FileText },
    { text: "DRAFT", color: "#FF9800", icon: FileText },
    { text: "REVIEWED", color: "#2196F3", icon: Check },
    { text: "URGENT", color: "#FF5722", icon: FileText },
    { text: "FINAL", color: "#9C27B0", icon: Check },
    { text: "VOID", color: "#757575", icon: X },
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

    // Redraw stamps for current page
    renderStamps(context, pageNum);
  };

  const renderStamps = (context: CanvasRenderingContext2D, pageNum: number) => {
    const pageStamps = stamps.filter(stamp => stamp.page === pageNum);
    
    pageStamps.forEach(stamp => {
      const config = stamp.config;
      
      if (config.type === "image" && config.image) {
        // Draw image stamp
        const img = new Image();
        img.src = config.image;
        img.onload = () => {
          context.drawImage(img, stamp.x, stamp.y, 150, 80);
        };
      } else {
        // Draw text stamp
        const stampText = config.text || "";
        const dateText = config.includeDate ? new Date().toLocaleDateString() : "";
        const userText = config.includeUser && config.userName ? config.userName : "";
        
        // Draw stamp background
        context.save();
        context.translate(stamp.x, stamp.y);
        context.rotate(-15 * Math.PI / 180); // Rotate stamp
        
        // Border
        context.strokeStyle = config.color;
        context.lineWidth = 3;
        context.strokeRect(0, 0, 200, 80);
        
        // Inner border
        context.lineWidth = 1;
        context.strokeRect(5, 5, 190, 70);
        
        // Text
        context.fillStyle = config.color;
        context.font = "bold 24px Arial";
        context.textAlign = "center";
        context.fillText(stampText, 100, 35);
        
        // Date and user
        if (dateText || userText) {
          context.font = "12px Arial";
          const bottomText = [dateText, userText].filter(Boolean).join(" - ");
          context.fillText(bottomText, 100, 60);
        }
        
        context.restore();
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfDoc) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStamp: PlacedStamp = {
      x,
      y,
      page: currentPage,
      config: { ...selectedStamp },
    };

    setStamps([...stamps, newStamp]);
    renderPage(pdfDoc, currentPage);
    toast.success("Stamp added!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setStampImage(imageData);
      setSelectedStamp({
        type: "image",
        color: "#000000",
        includeDate: false,
        includeUser: false,
        image: imageData,
      });
      toast.success("Image loaded!");
    };
    reader.readAsDataURL(file);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const downloadStampedPDF = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Add stamps to PDF
      for (const stamp of stamps) {
        const page = pages[stamp.page - 1];
        if (!page) continue;

        const { height } = page.getSize();
        const config = stamp.config;
        
        if (config.type === "image" && config.image) {
          // Add image stamp
          try {
            const imageBytes = await fetch(config.image).then(r => r.arrayBuffer());
            let image;
            if (config.image.startsWith("data:image/png")) {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              image = await pdfDoc.embedJpg(imageBytes);
            }
            page.drawImage(image, {
              x: stamp.x,
              y: height - stamp.y - 80,
              width: 150,
              height: 80,
            });
          } catch (e) {
            console.error("Error embedding image:", e);
          }
        } else {
          // Add text stamp
          const stampText = config.text || "";
          const dateText = config.includeDate ? new Date().toLocaleDateString() : "";
          const userText = config.includeUser && config.userName ? config.userName : "";
          
          const colorRgb = hexToRgb(config.color);
          
          page.drawRectangle({
            x: stamp.x,
            y: height - stamp.y - 80,
            width: 200,
            height: 80,
            borderColor: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
            borderWidth: 3,
            rotate: degrees(-15),
          });
          
          page.drawText(stampText, {
            x: stamp.x + 50,
            y: height - stamp.y - 40,
            size: 20,
            color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
            rotate: degrees(-15),
          });
          
          if (dateText || userText) {
            const bottomText = [dateText, userText].filter(Boolean).join(" - ");
            page.drawText(bottomText, {
              x: stamp.x + 30,
              y: height - stamp.y - 60,
              size: 10,
              color: rgb(colorRgb.r, colorRgb.g, colorRgb.b),
              rotate: degrees(-15),
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stamped-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Stamped PDF downloaded!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to download stamped PDF");
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
      : { r: 0, g: 0, b: 0 };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
            <Stamp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">PDF Stamps</h1>
          <p className="text-muted-foreground">
            Add professional stamps to your PDFs - predefined, custom, or image stamps
          </p>
        </div>

        <div className="grid md:grid-cols-[350px,1fr] gap-6">
          {/* Left Sidebar - Stamp Options */}
          <Card className="p-6 h-fit">
            <h2 className="font-semibold mb-4">Stamp Options</h2>
            
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
                {/* Predefined Stamps */}
                <div className="mb-6">
                  <Label className="mb-2">Predefined Stamps</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {predefinedStamps.map((stamp) => (
                      <Button
                        key={stamp.text}
                        variant={selectedStamp.text === stamp.text && selectedStamp.type === "predefined" ? "default" : "outline"}
                        className="h-auto py-3 text-xs"
                        style={{
                          borderColor: stamp.color,
                          color: selectedStamp.text === stamp.text && selectedStamp.type === "predefined" ? "white" : stamp.color,
                        }}
                        onClick={() => setSelectedStamp({
                          type: "predefined",
                          text: stamp.text,
                          color: stamp.color,
                          includeDate: true,
                          includeUser: false,
                        })}
                      >
                        {stamp.text}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Text Stamp */}
                <div className="mb-6">
                  <Label htmlFor="custom-text" className="mb-2">
                    Custom Text Stamp
                  </Label>
                  <Input
                    id="custom-text"
                    placeholder="Enter custom text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!customText}
                    onClick={() => setSelectedStamp({
                      type: "custom",
                      text: customText,
                      color: "#2196F3",
                      includeDate: true,
                      includeUser: false,
                    })}
                  >
                    Use Custom Text
                  </Button>
                </div>

                {/* Image Stamp */}
                <div className="mb-6">
                  <Label className="mb-2">Image Stamp</Label>
                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {stampImage && (
                    <div className="mt-2">
                      <img src={stampImage} alt="Stamp preview" className="w-full h-20 object-contain rounded border" />
                    </div>
                  )}
                </div>

                {/* Options */}
                {selectedStamp.type !== "image" && (
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-date" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Include Date
                      </Label>
                      <input
                        type="checkbox"
                        id="include-date"
                        checked={selectedStamp.includeDate}
                        onChange={(e) => setSelectedStamp({ ...selectedStamp, includeDate: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-user" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Include User
                      </Label>
                      <input
                        type="checkbox"
                        id="include-user"
                        checked={selectedStamp.includeUser}
                        onChange={(e) => setSelectedStamp({ ...selectedStamp, includeUser: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                    {selectedStamp.includeUser && (
                      <Input
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => {
                          setUserName(e.target.value);
                          setSelectedStamp({ ...selectedStamp, userName: e.target.value });
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Click anywhere on the PDF to place a stamp
                  </p>
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
                <p className="text-muted-foreground">Upload a PDF file to start adding stamps</p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    {stamps.filter(s => s.page === currentPage).length > 0 && (
                      <Badge variant="secondary">
                        {stamps.filter(s => s.page === currentPage).length} stamps
                      </Badge>
                    )}
                  </div>
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
                    className="mx-auto cursor-pointer shadow-lg"
                  />
                </div>

                {/* Download */}
                <div className="mt-4 flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={downloadStampedPDF}
                    disabled={stamps.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Stamped PDF ({stamps.length} stamps)
                  </Button>
                  {stamps.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStamps([]);
                        renderPage(pdfDoc, currentPage);
                        toast.success("All stamps cleared");
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
