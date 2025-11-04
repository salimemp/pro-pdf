'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Code, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

export default function HtmlToPdfPage() {
  const [htmlContent, setHtmlContent] = useState('<!DOCTYPE html>\n<html>\n<head>\n  <title>My Document</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a sample HTML document.</p>\n</body>\n</html>');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleConvert = async () => {
    if (!htmlContent.trim()) {
      toast.error("Please enter HTML content");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Parse HTML and extract text (simplified version)
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
      const textContent = htmlDoc.body.textContent || '';
      
      // Split text into lines and add to PDF
      const lines = doc.splitTextToSize(textContent, 180);
      doc.text(lines, 15, 15);
      
      // Generate blob and create download URL
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      toast.success("HTML converted to PDF successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to convert. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">HTML to PDF</h1>
              <p className="text-slate-400">Convert HTML content to PDF format</p>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">HTML Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Enter your HTML code below</Label>
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white font-mono h-64"
                  placeholder="<html><body><h1>Hello World</h1></body></html>"
                />
                <p className="text-xs text-slate-400">Note: This tool extracts text content from HTML. For complex layouts, consider using a PDF design tool.</p>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </Button>

          {downloadUrl && (
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={downloadUrl} download="converted.pdf">
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
