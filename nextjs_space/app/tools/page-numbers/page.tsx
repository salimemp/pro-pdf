'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EncryptedFileUpload } from "@/components/encrypted-file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hash, Download } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function PageNumbersPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [position, setPosition] = useState<string>('bottom-center');
  const [format, setFormat] = useState<string>('page-x-of-y');

  const handleAddPageNumbers = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    setIsProcessing(true);
    
    try {
      const numberedBytes = await PDFProcessor.addPageNumbers(selectedFiles[0], {
        position: position as any,
        format: format as any,
      });

      const blob = new Blob([numberedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      toast.success("Page numbers added successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to add page numbers. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Add Page Numbers</h1>
              <p className="text-slate-400">Add page numbers to your PDF</p>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <EncryptedFileUpload
                onFilesSelected={setSelectedFiles}
                acceptedTypes={["application/pdf"]}
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number only (1, 2, 3...)</SelectItem>
                    <SelectItem value="page-x-of-y">Page X of Y</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={handleAddPageNumbers}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            {isProcessing ? "Processing..." : "Add Page Numbers"}
          </Button>

          {downloadUrl && (
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={downloadUrl} download={`numbered_${selectedFiles[0]?.name || 'document.pdf'}`}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
