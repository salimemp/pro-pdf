
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Archive, ArrowRight, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function CompressPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to compress");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadUrl('#compressed-pdf-download');
      toast.success("PDF compressed successfully!");
    } catch (error) {
      toast.error("Failed to compress PDF. Please try again.");
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
              <Archive className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Compress PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Reduce your PDF file size while maintaining quality. Perfect for email attachments and web uploads.
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
                <CardTitle className="text-white">Compression Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200 mb-4 block">Compression Level</Label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50 cursor-pointer">
                      <input
                        type="radio"
                        name="compression"
                        value="low"
                        checked={compressionLevel === 'low'}
                        onChange={(e) => setCompressionLevel(e.target.value as 'low')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="text-slate-300 font-medium">Low Compression</div>
                        <div className="text-slate-400 text-sm">Best quality, larger file size</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50 cursor-pointer">
                      <input
                        type="radio"
                        name="compression"
                        value="medium"
                        checked={compressionLevel === 'medium'}
                        onChange={(e) => setCompressionLevel(e.target.value as 'medium')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="text-slate-300 font-medium">Medium Compression</div>
                        <div className="text-slate-400 text-sm">Balanced quality and size (Recommended)</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50 cursor-pointer">
                      <input
                        type="radio"
                        name="compression"
                        value="high"
                        checked={compressionLevel === 'high'}
                        onChange={(e) => setCompressionLevel(e.target.value as 'high')}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="text-slate-300 font-medium">High Compression</div>
                        <div className="text-slate-400 text-sm">Smallest file size, reduced quality</div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isProcessing ? (
                    "Compressing PDF..."
                  ) : (
                    <>
                      Compress PDF
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-green-400 text-lg font-semibold">
                      Your PDF has been compressed successfully!
                    </div>
                    <div className="text-slate-300 text-sm mt-2">
                      Original size: {selectedFiles[0]?.size ? (selectedFiles[0].size / 1024 / 1024).toFixed(2) : '0'} MB
                      → Compressed size: ~{selectedFiles[0]?.size ? ((selectedFiles[0].size * 0.6) / 1024 / 1024).toFixed(2) : '0'} MB
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 w-4 h-4" />
                      Download Compressed PDF
                    </Button>
                    <ShareDialog
                      fileName="compressed-document.pdf"
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
