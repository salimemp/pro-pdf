
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RotateCw, ArrowRight, Download, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function RotatePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [rotatedPdfBlob, setRotatedPdfBlob] = useState<Blob | null>(null);

  const handleRotate = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to rotate");
      return;
    }

    setIsProcessing(true);
    setShowProgress(true);
    
    try {
      // Create a job for rotation
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Rotate ${selectedFiles[0].name}`,
          type: 'rotate',
          inputFiles: selectedFiles.map(f => f.name),
          settings: { rotation },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const job = await response.json();
      setCurrentJobId(job.id);

      // Rotate PDF
      const rotatedBytes = await PDFProcessor.rotatePDF(selectedFiles[0], rotation);

      // Update job progress
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      });

      // Create blob and download URL
      const blob = new Blob([rotatedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setRotatedPdfBlob(blob);
      setDownloadUrl(url);
      setShowProgress(false);
      toast.success("PDF rotated successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Rotation error:', error);
      toast.error("Failed to rotate PDF. Please try again.");
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

  const handleReset = () => {
    setSelectedFiles([]);
    setDownloadUrl('');
    setRotatedPdfBlob(null);
    setRotation(90);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left Column - Upload & Settings */}
          <div className="space-y-6">
            {/* Top Ad */}
            <AdPlaceholder variant="rectangle" />

            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <RotateCw className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Rotate PDF</h1>
                  <p className="text-sm md:text-base text-slate-400">Rotate your PDF pages 90°, 180°, or 270°</p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg">Upload PDF</CardTitle>
              </CardHeader>
              <CardContent>
                <EncryptedFileUpload
                  onFilesSelected={setSelectedFiles}
                  acceptedTypes={["application/pdf"]}
                  maxFiles={1}
                  maxSize={10 * 1024 * 1024}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-300 truncate">
                      Selected: {selectedFiles[0].name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                  <span>Rotation Settings</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Choose the rotation angle for all pages</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-slate-200 text-sm md:text-base">Rotation Angle</Label>
                  <RadioGroup value={rotation.toString()} onValueChange={(v) => setRotation(parseInt(v) as 90 | 180 | 270)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="90" id="90" />
                      <Label htmlFor="90" className="text-slate-300 cursor-pointer">90° Clockwise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="180" id="180" />
                      <Label htmlFor="180" className="text-slate-300 cursor-pointer">180° (Upside down)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="270" id="270" />
                      <Label htmlFor="270" className="text-slate-300 cursor-pointer">270° Counter-clockwise</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleRotate}
                disabled={isProcessing || selectedFiles.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Rotate PDF
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              {downloadUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleReset}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Progress & Download */}
          <div className="space-y-6">
            {/* Progress Indicator */}
            {showProgress && currentJobId && (
              <RealtimeProgressIndicator jobId={currentJobId} />
            )}

            {/* Download Section */}
            {downloadUrl && !showProgress && (
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-base md:text-lg">✓ PDF Rotated Successfully</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      asChild
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a href={downloadUrl} download={`rotated_${selectedFiles[0]?.name || 'document.pdf'}`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    
                    <ShareDialog fileUrl={downloadUrl} fileName={`rotated_${selectedFiles[0]?.name || 'document.pdf'}`} trigger={
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    }/>
                  </div>
                  
                  <p className="text-xs text-slate-400 text-center">
                    Your rotated PDF is ready to download
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Info Cards */}
            {!downloadUrl && (
              <>
                <Card className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="pt-6">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3">How it works</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                      <li className="flex items-start">
                        <span className="mr-2">1.</span>
                        <span>Upload your PDF document</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">2.</span>
                        <span>Select the rotation angle (90°, 180°, or 270°)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        <span>Click "Rotate PDF" to process</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        <span>Download your rotated PDF instantly</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/30">
                  <CardContent className="pt-6">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3">Features</h3>
                    <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Rotate all pages at once</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Maintain document quality</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Multiple rotation angles</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Fast and secure processing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Bottom Ad */}
            <AdPlaceholder variant="rectangle" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
