
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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Droplet, ArrowRight, Download, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function WatermarkPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [fontSize, setFontSize] = useState(48);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [watermarkedPdfBlob, setWatermarkedPdfBlob] = useState<Blob | null>(null);

  const handleWatermark = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    setIsProcessing(true);
    setShowProgress(true);
    
    try {
      // Create a job for watermarking
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Watermark ${selectedFiles[0].name}`,
          type: 'watermark',
          inputFiles: selectedFiles.map(f => f.name),
          settings: { text: watermarkText, opacity, rotation, fontSize },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job');
      }

      const job = await response.json();
      setCurrentJobId(job.id);

      // Add watermark to PDF
      const watermarkedBytes = await PDFProcessor.addWatermark(
        selectedFiles[0],
        watermarkText,
        {
          opacity,
          rotation,
          fontSize,
          color: { r: 0.5, g: 0.5, b: 0.5 },
        }
      );

      // Update job progress
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', progress: 100 }),
      });

      // Create blob and download URL
      const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedPdfBlob(blob);
      setDownloadUrl(url);
      setShowProgress(false);
      toast.success("Watermark added successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Watermark error:', error);
      toast.error("Failed to add watermark. Please try again.");
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
    setWatermarkedPdfBlob(null);
    setWatermarkText('CONFIDENTIAL');
    setOpacity(0.3);
    setRotation(45);
    setFontSize(48);
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
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Droplet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Add Watermark</h1>
                  <p className="text-sm md:text-base text-slate-400">Add custom text watermark to your PDF</p>
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

            {/* Watermark Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white text-base md:text-lg flex items-center space-x-2">
                  <span>Watermark Settings</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Customize watermark appearance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-200 text-sm md:text-base">Watermark Text</Label>
                  <Input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                    className="bg-slate-700/50 border-slate-600 text-white"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-400">Max 50 characters</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-200 text-sm">Opacity</Label>
                    <span className="text-sm text-slate-400">{Math.round(opacity * 100)}%</span>
                  </div>
                  <Slider
                    value={[opacity]}
                    onValueChange={([value]) => setOpacity(value)}
                    min={0.1}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-200 text-sm">Rotation</Label>
                    <span className="text-sm text-slate-400">{rotation}°</span>
                  </div>
                  <Slider
                    value={[rotation]}
                    onValueChange={([value]) => setRotation(value)}
                    min={0}
                    max={360}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-slate-200 text-sm">Font Size</Label>
                    <span className="text-sm text-slate-400">{fontSize}px</span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={12}
                    max={120}
                    step={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleWatermark}
                disabled={isProcessing || selectedFiles.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Droplet className="mr-2 h-4 w-4" />
                    Add Watermark
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
                  <CardTitle className="text-white text-base md:text-lg">✓ Watermark Added Successfully</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      asChild
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <a href={downloadUrl} download={`watermarked_${selectedFiles[0]?.name || 'document.pdf'}`}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    
                    <ShareDialog fileUrl={downloadUrl} fileName={`watermarked_${selectedFiles[0]?.name || 'document.pdf'}`} trigger={
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
                    Your watermarked PDF is ready to download
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
                        <span>Enter your watermark text</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        <span>Customize opacity, rotation, and font size</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        <span>Click "Add Watermark" and download</span>
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
                        <span>Custom text watermarks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Adjustable opacity and rotation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Multiple font sizes</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Applied to all pages</span>
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
