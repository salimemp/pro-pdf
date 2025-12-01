"use client";

import React, { useState, useRef } from "react";
import { FileCheck, Upload, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/workers/pdf-worker.js`;

interface Difference {
  page: number;
  type: "added" | "removed" | "modified";
  description: string;
}

export default function ComparePage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [pdf1, setPdf1] = useState<any>(null);
  const [pdf2, setPdf2] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [differences, setDifferences] = useState<Difference[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile1Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setFile1(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    setPdf1(pdf);
    setTotalPages(Math.max(pdf.numPages, pdf2?.numPages || 0));
    if (pdf2) {
      setCurrentPage(1);
      renderPages(1);
    }
    toast.success("Document 1 loaded!");
  };

  const handleFile2Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setFile2(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    setPdf2(pdf);
    setTotalPages(Math.max(pdf1?.numPages || 0, pdf.numPages));
    if (pdf1) {
      setCurrentPage(1);
      renderPages(1);
    }
    toast.success("Document 2 loaded!");
  };

  const renderPages = async (pageNum: number) => {
    if (pdf1 && pageNum <= pdf1.numPages) {
      await renderPage(pdf1, canvas1Ref.current, pageNum);
    } else if (canvas1Ref.current) {
      const ctx = canvas1Ref.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas1Ref.current.width, canvas1Ref.current.height);
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas1Ref.current.width, canvas1Ref.current.height);
        ctx.fillStyle = "#666";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Page not available", canvas1Ref.current.width / 2, canvas1Ref.current.height / 2);
      }
    }

    if (pdf2 && pageNum <= pdf2.numPages) {
      await renderPage(pdf2, canvas2Ref.current, pageNum);
    } else if (canvas2Ref.current) {
      const ctx = canvas2Ref.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas2Ref.current.width, canvas2Ref.current.height);
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas2Ref.current.width, canvas2Ref.current.height);
        ctx.fillStyle = "#666";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Page not available", canvas2Ref.current.width / 2, canvas2Ref.current.height / 2);
      }
    }

    // Compare and highlight differences
    if (pdf1 && pdf2 && pageNum <= Math.min(pdf1.numPages, pdf2.numPages)) {
      await comparePages(pageNum);
    }
  };

  const renderPage = async (pdf: any, canvas: HTMLCanvasElement | null, pageNum: number) => {
    if (!canvas) return;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  };

  const comparePages = async (pageNum: number) => {
    if (!canvas1Ref.current || !canvas2Ref.current || !diffCanvasRef.current) return;

    const ctx1 = canvas1Ref.current.getContext("2d");
    const ctx2 = canvas2Ref.current.getContext("2d");
    const diffCtx = diffCanvasRef.current.getContext("2d");

    if (!ctx1 || !ctx2 || !diffCtx) return;

    const width = Math.max(canvas1Ref.current.width, canvas2Ref.current.width);
    const height = Math.max(canvas1Ref.current.height, canvas2Ref.current.height);

    diffCanvasRef.current.width = width;
    diffCanvasRef.current.height = height;

    const imageData1 = ctx1.getImageData(0, 0, canvas1Ref.current.width, canvas1Ref.current.height);
    const imageData2 = ctx2.getImageData(0, 0, canvas2Ref.current.width, canvas2Ref.current.height);
    const diffImageData = diffCtx.createImageData(width, height);

    let differenceCount = 0;
    const threshold = 30; // Sensitivity threshold

    for (let i = 0; i < Math.min(imageData1.data.length, imageData2.data.length); i += 4) {
      const r1 = imageData1.data[i];
      const g1 = imageData1.data[i + 1];
      const b1 = imageData1.data[i + 2];

      const r2 = imageData2.data[i];
      const g2 = imageData2.data[i + 1];
      const b2 = imageData2.data[i + 2];

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

      if (diff > threshold) {
        // Highlight difference in red
        diffImageData.data[i] = 255; // R
        diffImageData.data[i + 1] = 0; // G
        diffImageData.data[i + 2] = 0; // B
        diffImageData.data[i + 3] = 150; // A
        differenceCount++;
      } else {
        diffImageData.data[i] = r2;
        diffImageData.data[i + 1] = g2;
        diffImageData.data[i + 2] = b2;
        diffImageData.data[i + 3] = imageData2.data[i + 3];
      }
    }

    diffCtx.putImageData(diffImageData, 0, 0);

    // Update differences list
    if (differenceCount > 1000) {
      const existingDiff = differences.find(d => d.page === pageNum);
      if (!existingDiff) {
        setDifferences(prev => [
          ...prev,
          {
            page: pageNum,
            type: "modified",
            description: `${Math.floor(differenceCount / 1000)}K pixels differ`,
          },
        ]);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      renderPages(newPage);
    }
  };

  const compareDocuments = async () => {
    if (!pdf1 || !pdf2) return;

    setIsComparing(true);
    setDifferences([]);

    try {
      // Check page count differences
      if (pdf1.numPages !== pdf2.numPages) {
        setDifferences(prev => [
          ...prev,
          {
            page: 0,
            type: "modified",
            description: `Page count differs: ${pdf1.numPages} vs ${pdf2.numPages}`,
          },
        ]);
      }

      // Compare each page
      const maxPages = Math.min(pdf1.numPages, pdf2.numPages);
      for (let i = 1; i <= maxPages; i++) {
        setCurrentPage(i);
        await renderPages(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
      }

      toast.success("Comparison complete!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  const downloadReport = () => {
    const report = `
PDF Comparison Report
====================

Document 1: ${file1?.name}
Document 2: ${file2?.name}

Total Differences: ${differences.length}

Details:
${differences.map((diff, i) => `${i + 1}. Page ${diff.page}: ${diff.type.toUpperCase()} - ${diff.description}`).join("\n")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comparison-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-4">
            <FileCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">PDF Comparison</h1>
          <p className="text-muted-foreground">
            Compare two PDF documents side-by-side and identify differences
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="file1" className="mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Document 1 (Original)
              </Label>
              <Input
                id="file1"
                type="file"
                accept=".pdf"
                onChange={handleFile1Change}
                className="cursor-pointer mb-2"
              />
              {file1 && (
                <Badge variant="outline" className="mt-2">
                  {file1.name}
                </Badge>
              )}
            </div>
            <div>
              <Label htmlFor="file2" className="mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Document 2 (Revised)
              </Label>
              <Input
                id="file2"
                type="file"
                accept=".pdf"
                onChange={handleFile2Change}
                className="cursor-pointer mb-2"
              />
              {file2 && (
                <Badge variant="outline" className="mt-2">
                  {file2.name}
                </Badge>
              )}
            </div>
          </div>

          {file1 && file2 && (
            <div className="mt-6">
              <Button
                onClick={compareDocuments}
                disabled={isComparing}
                className="w-full"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {isComparing ? "Comparing..." : "Compare Documents"}
              </Button>
            </div>
          )}
        </Card>

        {/* Comparison View */}
        {pdf1 && pdf2 && (
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                {differences.filter(d => d.page === currentPage).length > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Differences found
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

            {/* Side-by-Side Comparison */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 text-center">Document 1</h3>
                <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-2 max-h-[600px]">
                  <canvas ref={canvas1Ref} className="mx-auto" />
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 text-center">Document 2</h3>
                <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-2 max-h-[600px]">
                  <canvas ref={canvas2Ref} className="mx-auto" />
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 text-center flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Differences
                </h3>
                <div className="border rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-2 max-h-[600px]">
                  <canvas ref={diffCanvasRef} className="mx-auto" />
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Differences Summary */}
        {differences.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Differences Found ({differences.length})
              </h3>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
            <div className="space-y-2">
              {differences.map((diff, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-accent"
                  onClick={() => {
                    if (diff.page > 0) {
                      handlePageChange(diff.page);
                    }
                  }}
                >
                  <Badge
                    variant={diff.type === "modified" ? "destructive" : "secondary"}
                    className="mt-0.5"
                  >
                    {diff.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {diff.page > 0 ? `Page ${diff.page}` : "Document Level"}
                    </p>
                    <p className="text-sm text-muted-foreground">{diff.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
