
'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { BatchProgress } from "@/components/batch-progress";
import { PDFPreview } from "@/components/pdf-preview";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileImage, ArrowRight, Download, Share2, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

const conversionOptions = [
  { value: 'image-to-pdf', label: 'Images to PDF (Recommended)', from: 'Images', to: 'PDF', supported: true },
  { value: 'pdf-to-image', label: 'PDF to Images (PNG) - Coming Soon', from: 'PDF', to: 'Images', supported: false },
  { value: 'pdf-to-word', label: 'PDF to Word (DOCX) - Coming Soon', from: 'PDF', to: 'Word', supported: false },
  { value: 'pdf-to-excel', label: 'PDF to Excel (XLSX) - Coming Soon', from: 'PDF', to: 'Excel', supported: false },
  { value: 'pdf-to-powerpoint', label: 'PDF to PowerPoint (PPTX) - Coming Soon', from: 'PDF', to: 'PowerPoint', supported: false },
  { value: 'word-to-pdf', label: 'Word to PDF - Coming Soon', from: 'Word', to: 'PDF', supported: false },
  { value: 'excel-to-pdf', label: 'Excel to PDF - Coming Soon', from: 'Excel', to: 'PDF', supported: false },
  { value: 'powerpoint-to-pdf', label: 'PowerPoint to PDF - Coming Soon', from: 'PowerPoint', to: 'PDF', supported: false },
];

interface BatchFile {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function ConvertPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [conversionType, setConversionType] = useState<string>('');
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [convertedPdfBlob, setConvertedPdfBlob] = useState<Blob | null>(null);

  // Update batch files when selected files change
  useEffect(() => {
    if (selectedFiles.length > 0 && !isProcessing) {
      setBatchFiles(selectedFiles.map((file, index) => ({
        id: `file-${index}`,
        name: file.name,
        status: 'pending' as const,
        progress: 0,
      })));
    }
  }, [selectedFiles, isProcessing]);

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file to convert");
      return;
    }

    if (!conversionType) {
      toast.error("Please select a conversion type");
      return;
    }

    const selectedOption = conversionOptions.find(opt => opt.value === conversionType);
    
    // Check if conversion type is supported
    if (!selectedOption?.supported) {
      toast.error("This conversion type is coming soon. Please try Images to PDF instead.");
      return;
    }

    setIsProcessing(true);
    setTotalProgress(0);
    
    try {
      if (conversionType === 'image-to-pdf') {
        // Use real image-to-PDF conversion
        setTotalProgress(30);
        
        const convertedBytes = await PDFProcessor.imagesToPDF(selectedFiles);
        
        setTotalProgress(80);
        
        // Create blob and download URL
        const blob = new Blob([convertedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setConvertedPdfBlob(blob);
        setDownloadUrl(url);
        setTotalProgress(100);
        
        toast.success(`${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} converted to PDF successfully!`);
      } else {
        // For unsupported conversions (shouldn't reach here due to earlier check)
        throw new Error('Unsupported conversion type');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error("Failed to convert file. Please check your files and try again.");
      setBatchFiles(prev => prev.map(f => 
        f.status === 'processing' 
          ? { ...f, status: 'error' as const, error: 'Conversion failed' } 
          : f
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !convertedPdfBlob) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `converted-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAcceptedTypes = () => {
    if (!conversionType) return ['*/*'];
    
    if (conversionType.startsWith('pdf-')) {
      return ['application/pdf'];
    } else if (conversionType.startsWith('word-')) {
      return ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    } else if (conversionType.startsWith('excel-')) {
      return ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    } else if (conversionType.startsWith('powerpoint-')) {
      return ['application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    } else if (conversionType.startsWith('image-')) {
      return ['image/*'];
    }
    return ['*/*'];
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
              <FileImage className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Convert Files</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Convert between PDF, Word, Excel, PowerPoint, and image formats with ease.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Select Conversion Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="conversionType" className="text-slate-200">Conversion Format</Label>
                  <Select value={conversionType} onValueChange={setConversionType}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white mt-2">
                      <SelectValue placeholder="Choose conversion type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {conversionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white focus:bg-slate-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {conversionType && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Upload File</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesSelected={setSelectedFiles}
                  maxFiles={conversionType === 'image-to-pdf' ? 10 : 1}
                  maxSize={50 * 1024 * 1024}
                  acceptedTypes={getAcceptedTypes()}
                />
              </CardContent>
            </Card>
          )}

          {selectedFiles.length > 0 && conversionType && !isProcessing && !downloadUrl && (
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                    >
                      Convert to {conversionOptions.find(opt => opt.value === conversionType)?.to}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start the conversion process</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Batch Progress */}
          {isProcessing && batchFiles.length > 0 && (
            <BatchProgress
              files={batchFiles}
              totalProgress={totalProgress}
              estimatedTimeRemaining={estimatedTime}
            />
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center text-green-400 text-lg font-semibold">
                    Your file has been converted successfully!
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 w-4 h-4" />
                      Download Converted File
                    </Button>
                    <ShareDialog
                      fileName={`converted-${selectedFiles[0]?.name || 'document'}`}
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
