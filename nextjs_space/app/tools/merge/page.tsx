
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, ArrowRight, Download, Share2, Info } from "lucide-react";
import { toast } from "sonner";

export default function MergePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadUrl('#merged-pdf-download');
      toast.success("PDFs merged successfully!");
    } catch (error) {
      toast.error("Failed to merge PDFs. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Merge PDFs</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Combine multiple PDF files into a single document. Upload your files and we'll merge them in order.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>Upload PDF Files</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Upload multiple PDF files. You can drag to reorder them before merging.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={10}
                maxSize={50 * 1024 * 1024}
                acceptedTypes={['application/pdf']}
                allowReorder={true}
              />
            </CardContent>
          </Card>

          {selectedFiles.length >= 2 && (
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      onClick={handleMerge}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    >
                      {isProcessing ? (
                        "Merging PDFs..."
                      ) : (
                        <>
                          Merge {selectedFiles.length} PDFs
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Combine all uploaded files into one PDF</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center text-green-400 text-lg font-semibold">
                    Your PDFs have been merged successfully!
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 w-4 h-4" />
                            Download Merged PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download your merged PDF file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <ShareDialog
                      fileName="merged-document.pdf"
                      trigger={
                        <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20">
                          <Share2 className="mr-2 w-4 h-4" />
                          Share Document
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
