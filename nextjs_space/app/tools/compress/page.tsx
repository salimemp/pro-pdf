
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EncryptedFileUpload } from "@/components/encrypted-file-upload";
import { RealtimeProgressIndicator } from "@/components/realtime-progress-indicator";
import { ShareDialog } from "@/components/share-dialog";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Archive, ArrowRight, Download, Share2, Info, Lock } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function CompressPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [compressedPdfBlob, setCompressedPdfBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to compress");
      return;
    }

    setIsProcessing(true);
    setShowProgress(true);
    setOriginalSize(selectedFiles[0].size);
    
    try {
      // Create a job for compression
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Compress ${selectedFiles[0].name}`,
          type: 'compress',
          inputFiles: selectedFiles.map(f => f.name),
          settings: { compressionLevel, encrypted: enableEncryption },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const job = await response.json();
      setCurrentJobId(job.id);

      // Use real PDF compression
      const compressedBytes = await PDFProcessor.compressPDF(selectedFiles[0], {
        quality: compressionLevel,
        removeMetadata: true,
      });

      // Update job progress
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      });

      // Create blob and download URL
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setCompressedPdfBlob(blob);
      setCompressedSize(compressedBytes.byteLength);
      setDownloadUrl(url);
      setShowProgress(false);
      toast.success("PDF compressed successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error("Failed to compress PDF. Please try again.");
      setIsProcessing(false);
      setShowProgress(false);
      
      // Update job to failed
      if (currentJobId) {
        await fetch(`/api/jobs/${currentJobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed', progress: 0 }),
        });
      }
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !compressedPdfBlob) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `compressed-${selectedFiles[0]?.name || 'document.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Archive className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Compress PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Reduce your PDF file size while maintaining quality. Perfect for email attachments and web uploads.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>Upload PDF File</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload a single PDF file to compress</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Encryption Toggle */}
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-blue-400" />
                          <Label htmlFor="encryption-toggle" className="text-sm text-slate-300 cursor-pointer">
                            Enable Encryption
                          </Label>
                          <Switch
                            id="encryption-toggle"
                            checked={enableEncryption}
                            onCheckedChange={setEnableEncryption}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enable client-side zero-knowledge encryption</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EncryptedFileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                acceptedTypes={['application/pdf']}
                allowReorder={false}
                enableEncryption={enableEncryption}
              />
            </CardContent>
          </Card>

          {/* Real-time Progress Indicator */}
          {showProgress && currentJobId && (
            <RealtimeProgressIndicator
              jobId={currentJobId}
              fileName={selectedFiles[0]?.name}
              onComplete={() => {
                setShowProgress(false);
              }}
            />
          )}

          {selectedFiles.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <span>Compression Settings</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Choose your preferred balance between file size and quality</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-200 mb-4 block">Compression Level</Label>
                  <div className="space-y-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reduces file size by ~20-30%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reduces file size by ~40-50%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reduces file size by ~60-70%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start compression with selected settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                      Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB
                      → Compressed size: {(compressedSize / 1024 / 1024).toFixed(2)} MB
                      <span className="text-green-400 ml-2">
                        (Saved {((1 - compressedSize / originalSize) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 w-4 h-4" />
                            Download Compressed PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download your compressed PDF file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

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
          
          {/* Bottom Ad */}
          <AdPlaceholder variant="rectangle" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
