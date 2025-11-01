
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileImage, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";

const conversionOptions = [
  { value: 'pdf-to-word', label: 'PDF to Word (DOCX)', from: 'PDF', to: 'Word' },
  { value: 'pdf-to-excel', label: 'PDF to Excel (XLSX)', from: 'PDF', to: 'Excel' },
  { value: 'pdf-to-powerpoint', label: 'PDF to PowerPoint (PPTX)', from: 'PDF', to: 'PowerPoint' },
  { value: 'pdf-to-image', label: 'PDF to Images (PNG)', from: 'PDF', to: 'Images' },
  { value: 'word-to-pdf', label: 'Word to PDF', from: 'Word', to: 'PDF' },
  { value: 'excel-to-pdf', label: 'Excel to PDF', from: 'Excel', to: 'PDF' },
  { value: 'powerpoint-to-pdf', label: 'PowerPoint to PDF', from: 'PowerPoint', to: 'PDF' },
  { value: 'image-to-pdf', label: 'Images to PDF', from: 'Images', to: 'PDF' },
];

export default function ConvertPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [conversionType, setConversionType] = useState<string>('');

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a file to convert");
      return;
    }

    if (!conversionType) {
      toast.error("Please select a conversion type");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadUrl('#converted-file-download');
      toast.success("File converted successfully!");
    } catch (error) {
      toast.error("Failed to convert file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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

          {selectedFiles.length > 0 && conversionType && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
              >
                {isProcessing ? (
                  "Converting File..."
                ) : (
                  <>
                    Convert to {conversionOptions.find(opt => opt.value === conversionType)?.to}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className="text-green-400 text-lg font-semibold">
                    Your file has been converted successfully!
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 w-4 h-4" />
                    Download Converted File
                  </Button>
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
