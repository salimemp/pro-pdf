
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { BatchDownload } from "@/components/batch-download";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Scissors, ArrowRight, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function SplitPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadFiles, setDownloadFiles] = useState<any[]>([]);
  const [splitMethod, setSplitMethod] = useState<'pages' | 'ranges'>('pages');
  const [pageNumbers, setPageNumbers] = useState('');

  const parsePageInput = (input: string, method: 'pages' | 'ranges'): number[] | { start: number; end: number }[] => {
    if (method === 'pages') {
      // Parse comma-separated page numbers: "1,3,5" => [1,3,5]
      return input.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    } else {
      // Parse ranges: "1-5,10-15" => [{start:1, end:5}, {start:10, end:15}]
      const ranges = input.split(',').map(r => {
        const [start, end] = r.trim().split('-').map(p => parseInt(p.trim()));
        return { start: start || 1, end: end || start || 1 };
      }).filter(r => !isNaN(r.start) && !isNaN(r.end));
      return ranges;
    }
  };

  const handleSplit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to split");
      return;
    }

    if (!pageNumbers.trim()) {
      toast.error("Please specify page numbers or ranges");
      return;
    }

    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      let splitPdfs: Uint8Array[];

      if (splitMethod === 'pages') {
        // Extract specific pages
        const pages = parsePageInput(pageNumbers, 'pages') as number[];
        if (pages.length === 0) {
          throw new Error('Invalid page numbers');
        }
        splitPdfs = await Promise.all(
          pages.map(async (pageNum) => {
            return await PDFProcessor.extractPages(file, [pageNum]);
          })
        );
      } else {
        // Split by ranges
        const ranges = parsePageInput(pageNumbers, 'ranges') as { start: number; end: number }[];
        if (ranges.length === 0) {
          throw new Error('Invalid page ranges');
        }
        splitPdfs = await PDFProcessor.splitPDFByRanges(file, ranges);
      }

      // Create download files
      const files = splitPdfs.map((pdfBytes, index) => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        return {
          id: `${index + 1}`,
          name: `split-document-part-${index + 1}.pdf`,
          url,
          size: pdfBytes.byteLength,
          blob,
        };
      });
      
      setDownloadFiles(files);
      toast.success(`PDF split into ${files.length} part${files.length > 1 ? 's' : ''} successfully!`);
    } catch (error) {
      console.error('Split error:', error);
      toast.error("Failed to split PDF. Please check your page numbers and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Top Ad */}
          <AdPlaceholder variant="banner" />
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Scissors className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">Split PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Extract specific pages or split your PDF into multiple documents.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>Upload PDF File</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload a single PDF file to split</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                acceptedTypes={['application/pdf']}
                allowReorder={false}
              />
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>Split Options</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Choose how to split your PDF by pages or ranges</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200">Split Method</Label>
                  <div className="flex space-x-4 mt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="splitMethod"
                              value="pages"
                              checked={splitMethod === 'pages'}
                              onChange={(e) => setSplitMethod(e.target.value as 'pages')}
                              className="text-blue-600"
                            />
                            <span className="text-slate-300">Specific pages</span>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Extract individual pages (e.g., 1,3,5)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="splitMethod"
                              value="ranges"
                              checked={splitMethod === 'ranges'}
                              onChange={(e) => setSplitMethod(e.target.value as 'ranges')}
                              className="text-blue-600"
                            />
                            <span className="text-slate-300">Page ranges</span>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Extract page ranges (e.g., 1-5,10-15)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pageNumbers" className="text-slate-200 flex items-center space-x-2">
                    <span>
                      {splitMethod === 'pages' ? 'Page Numbers' : 'Page Ranges'}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3 h-3 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{splitMethod === 'pages' 
                            ? 'Enter comma-separated page numbers (e.g., 1,3,5,7)'
                            : 'Enter comma-separated page ranges (e.g., 1-5,10-15)'
                          }</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="pageNumbers"
                    value={pageNumbers}
                    onChange={(e) => setPageNumbers(e.target.value)}
                    placeholder={splitMethod === 'pages' ? '1,3,5,7' : '1-5,10-15'}
                    className="bg-slate-900/50 border-slate-600 text-white mt-2"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    "Splitting PDF..."
                  ) : (
                    <>
                      Split PDF
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {downloadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-green-900/20 text-green-400 px-4 py-2 rounded-full border border-green-700/50">
                  <span className="text-lg font-semibold">
                    PDF split successfully!
                  </span>
                </div>
              </div>

              <BatchDownload files={downloadFiles} />

              <div className="flex justify-center">
                <ShareDialog
                  fileName={`split-document-parts.zip`}
                  trigger={
                    <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20">
                      <Share2 className="mr-2 w-4 h-4" />
                      Share All Parts
                    </Button>
                  }
                />
              </div>
            </div>
          )}
          
          {/* Bottom Ad */}
          <AdPlaceholder variant="rectangle" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
