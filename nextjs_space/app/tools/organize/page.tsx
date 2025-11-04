'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EncryptedFileUpload } from "@/components/encrypted-file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function OrganizePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      PDFProcessor.getPDFMetadata(selectedFiles[0]).then(metadata => {
        setTotalPages(metadata.pageCount);
        setPageOrder(Array.from({ length: metadata.pageCount }, (_, i) => i + 1));
      });
    }
  }, [selectedFiles]);

  const movePageUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...pageOrder];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      setPageOrder(newOrder);
    }
  };

  const movePageDown = (index: number) => {
    if (index < pageOrder.length - 1) {
      const newOrder = [...pageOrder];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setPageOrder(newOrder);
    }
  };

  const deletePage = (index: number) => {
    const newOrder = pageOrder.filter((_, i) => i !== index);
    setPageOrder(newOrder);
  };

  const handleOrganize = async () => {
    if (selectedFiles.length === 0 || pageOrder.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    setIsProcessing(true);
    
    try {
      const organizedBytes = await PDFProcessor.organizePDF(selectedFiles[0], pageOrder);

      const blob = new Blob([organizedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      toast.success("PDF organized successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to organize PDF. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Organize PDF</h1>
              <p className="text-slate-400">Reorder or delete pages</p>
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

          {pageOrder.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Page Order ({pageOrder.length} pages)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pageOrder.map((pageNum, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-200">Page {pageNum}</span>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          className="border-slate-600"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => movePageDown(index)}
                          disabled={index === pageOrder.length - 1}
                          className="border-slate-600"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deletePage(index)}
                          className="border-red-600 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            size="lg"
            onClick={handleOrganize}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
          >
            {isProcessing ? "Processing..." : "Organize PDF"}
          </Button>

          {downloadUrl && (
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={downloadUrl} download={`organized_${selectedFiles[0]?.name || 'document.pdf'}`}>
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
