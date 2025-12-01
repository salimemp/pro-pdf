"use client";

import React, { useState, useRef } from "react";
import { PenTool, Upload, Download, Type, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PDFDocument, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import SignatureCanvas from "react-signature-canvas";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf-worker.js`;

interface FormField {
  id: string;
  type: "text" | "signature" | "date" | "checkbox";
  x: number;
  y: number;
  page: number;
  value: string;
  width?: number;
  height?: number;
}

export default function FillSignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedTool, setSelectedTool] = useState<"text" | "signature" | "date" | "checkbox">("text");
  const [textInput, setTextInput] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureRef = useRef<SignatureCanvas>(null);

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

    // Render fields
    renderFields(context, pageNum);
  };

  const renderFields = (context: CanvasRenderingContext2D, pageNum: number) => {
    const pageFields = fields.filter(f => f.page === pageNum);
    
    pageFields.forEach(field => {
      context.strokeStyle = "#2196F3";
      context.lineWidth = 2;
      
      switch (field.type) {
        case "text":
          context.strokeRect(field.x, field.y, field.width || 200, field.height || 30);
          if (field.value) {
            context.fillStyle = "#000";
            context.font = "14px Arial";
            context.fillText(field.value, field.x + 5, field.y + 20);
          }
          break;
        case "signature":
          context.strokeRect(field.x, field.y, field.width || 200, field.height || 60);
          if (field.value) {
            const img = new Image();
            img.src = field.value;
            img.onload = () => {
              context.drawImage(img, field.x + 5, field.y + 5, (field.width || 200) - 10, (field.height || 60) - 10);
            };
          }
          break;
        case "date":
          context.strokeRect(field.x, field.y, field.width || 150, field.height || 30);
          if (field.value) {
            context.fillStyle = "#000";
            context.font = "14px Arial";
            context.fillText(field.value, field.x + 5, field.y + 20);
          }
          break;
        case "checkbox":
          context.strokeRect(field.x, field.y, 20, 20);
          if (field.value === "checked") {
            context.strokeStyle = "#4CAF50";
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(field.x + 5, field.y + 10);
            context.lineTo(field.x + 8, field.y + 15);
            context.lineTo(field.x + 15, field.y + 5);
            context.stroke();
          }
          break;
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !pdfDoc) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        addField({
          id: Date.now().toString(),
          type: "text",
          x,
          y,
          page: currentPage,
          value: text,
          width: 200,
          height: 30,
        });
      }
    } else if (selectedTool === "date") {
      const today = new Date().toLocaleDateString();
      addField({
        id: Date.now().toString(),
        type: "date",
        x,
        y,
        page: currentPage,
        value: today,
        width: 150,
        height: 30,
      });
    } else if (selectedTool === "checkbox") {
      addField({
        id: Date.now().toString(),
        type: "checkbox",
        x,
        y,
        page: currentPage,
        value: "checked",
        width: 20,
        height: 20,
      });
    } else if (selectedTool === "signature") {
      if (savedSignature) {
        addField({
          id: Date.now().toString(),
          type: "signature",
          x,
          y,
          page: currentPage,
          value: savedSignature,
          width: 200,
          height: 60,
        });
      } else {
        setShowSignatureModal(true);
      }
    }
  };

  const addField = (field: FormField) => {
    setFields([...fields, field]);
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    toast.success("Field added!");
  };

  const saveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Please draw your signature");
      return;
    }

    const signatureData = signatureRef.current.toDataURL();
    setSavedSignature(signatureData);
    setShowSignatureModal(false);
    toast.success("Signature saved!");
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && pdfDoc) {
      setCurrentPage(newPage);
      renderPage(pdfDoc, newPage);
    }
  };

  const downloadFilledPDF = async () => {
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Add fields to PDF
      for (const field of fields) {
        const page = pages[field.page - 1];
        if (!page) continue;

        const { height } = page.getSize();
        
        switch (field.type) {
          case "text":
            page.drawText(field.value, {
              x: field.x,
              y: height - field.y - 20,
              size: 12,
              color: rgb(0, 0, 0),
            });
            break;
          case "date":
            page.drawText(field.value, {
              x: field.x,
              y: height - field.y - 20,
              size: 12,
              color: rgb(0, 0, 0),
            });
            break;
          case "signature":
            try {
              const signatureBytes = await fetch(field.value).then(r => r.arrayBuffer());
              const signatureImage = await pdfDoc.embedPng(signatureBytes);
              page.drawImage(signatureImage, {
                x: field.x,
                y: height - field.y - (field.height || 60),
                width: field.width || 200,
                height: field.height || 60,
              });
            } catch (e) {
              console.error("Error embedding signature:", e);
            }
            break;
          case "checkbox":
            if (field.value === "checked") {
              page.drawText("✓", {
                x: field.x,
                y: height - field.y - 15,
                size: 16,
                color: rgb(0.2, 0.7, 0.3),
              });
            }
            break;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filled-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Filled PDF downloaded!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to download filled PDF");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
            <PenTool className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Fill & Sign PDF</h1>
          <p className="text-muted-foreground">
            Fill form fields and add your digital signature to PDFs
          </p>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-6">
          {/* Left Sidebar */}
          <Card className="p-6 h-fit">
            <h2 className="font-semibold mb-4">Form Tools</h2>
            
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
                {/* Tools */}
                <div className="space-y-2 mb-6">
                  <p className="text-sm font-medium mb-2">Select Tool</p>
                  {[
                    { icon: Type, label: "Add Text", value: "text" },
                    { icon: PenTool, label: "Add Signature", value: "signature" },
                    { icon: Calendar, label: "Add Date", value: "date" },
                    { icon: Check, label: "Add Checkbox", value: "checkbox" },
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

                {/* Signature Management */}
                <div className="mb-6">
                  <Label className="mb-2">Your Signature</Label>
                  {savedSignature ? (
                    <div className="space-y-2">
                      <div className="border rounded p-2 bg-white">
                        <img src={savedSignature} alt="Signature" className="w-full h-16 object-contain" />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowSignatureModal(true)}
                      >
                        Change Signature
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSignatureModal(true)}
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      Create Signature
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  <p className="text-sm font-medium mb-1">Fields Added</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{fields.length}</span>
                    <Badge variant="secondary">
                      {fields.filter(f => f.page === currentPage).length} on this page
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
                <p className="text-muted-foreground">Upload a PDF file to start filling and signing</p>
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
                    className="mx-auto cursor-pointer shadow-lg"
                  />
                </div>

                {/* Download */}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={downloadFilledPDF}
                    disabled={fields.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Filled PDF ({fields.length} fields)
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Draw Your Signature</h3>
            <div className="border rounded bg-white mb-4">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 150,
                  className: "w-full",
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearSignature} className="flex-1">
                Clear
              </Button>
              <Button onClick={saveSignature} className="flex-1">
                Save Signature
              </Button>
              <Button variant="ghost" onClick={() => setShowSignatureModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
