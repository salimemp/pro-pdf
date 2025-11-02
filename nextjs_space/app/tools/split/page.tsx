
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, ArrowRight, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function SplitPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<'pages' | 'ranges'>('pages');
  const [pageNumbers, setPageNumbers] = useState('');

  const handleSplit = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to split");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadUrls(['#split-pdf-1', '#split-pdf-2', '#split-pdf-3']);
      toast.success("PDF split successfully!");
    } catch (error) {
      toast.error("Failed to split PDF. Please try again.");
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
              <Scissors className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">Split PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Extract specific pages or split your PDF into multiple documents.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Upload PDF File</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                acceptedTypes={['application/pdf']}
              />
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Split Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200">Split Method</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
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
                    <label className="flex items-center space-x-2">
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="pageNumbers" className="text-slate-200">
                    {splitMethod === 'pages' ? 'Page Numbers (e.g., 1,3,5)' : 'Page Ranges (e.g., 1-5,10-15)'}
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

          {downloadUrls.length > 0 && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-green-400 text-lg font-semibold text-center">
                    Your PDF has been split successfully!
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {downloadUrls.map((url, index) => (
                      <Button key={index} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 w-4 h-4" />
                        Download Part {index + 1}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-center pt-2">
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
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
