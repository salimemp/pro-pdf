'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EncryptedFileUpload } from "@/components/encrypted-file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Crop, Download } from "lucide-react";
import { toast } from "sonner";
import { PDFProcessor } from "@/lib/pdf-utils";

export default function CropPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  const handleCrop = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    setIsProcessing(true);
    
    try {
      const croppedBytes = await PDFProcessor.cropPDF(selectedFiles[0], margins);

      const blob = new Blob([croppedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      toast.success("PDF cropped successfully!");
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to crop PDF. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center">
              <Crop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Crop PDF</h1>
              <p className="text-slate-400">Adjust page margins</p>
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

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Crop Margins (in pixels)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Top</Label>
                <Input
                  type="number"
                  value={margins.top}
                  onChange={(e) => setMargins({ ...margins, top: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Bottom</Label>
                <Input
                  type="number"
                  value={margins.bottom}
                  onChange={(e) => setMargins({ ...margins, bottom: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Left</Label>
                <Input
                  type="number"
                  value={margins.left}
                  onChange={(e) => setMargins({ ...margins, left: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Right</Label>
                <Input
                  type="number"
                  value={margins.right}
                  onChange={(e) => setMargins({ ...margins, right: parseInt(e.target.value) || 0 })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            onClick={handleCrop}
            disabled={isProcessing || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white"
          >
            {isProcessing ? "Processing..." : "Crop PDF"}
          </Button>

          {downloadUrl && (
            <Button
              size="lg"
              asChild
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <a href={downloadUrl} download={`cropped_${selectedFiles[0]?.name || 'document.pdf'}`}>
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
