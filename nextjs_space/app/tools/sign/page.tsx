
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FileUpload } from '@/components/file-upload';
import { SignaturePad } from '@/components/signature-pad';
import { PDFPreview } from '@/components/pdf-preview';
import { ShareDialog } from '@/components/share-dialog';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSignature, Download, Share2, MousePointer, MoveIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PDFProcessor } from '@/lib/pdf-utils';

interface SignaturePosition {
  x: number;
  y: number;
  pageNumber: number;
  width: number;
  height: number;
}

export default function SignPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedFileUrl, setSignedFileUrl] = useState<string>('');
  const [signedFileBlob, setSignedFileBlob] = useState<Blob | null>(null);
  
  // Signature positioning
  const [isPositioning, setIsPositioning] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null);
  const [signatureSize, setSignatureSize] = useState<number>(150); // Width in pixels
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const handlePageClick = (x: number, y: number, pageNumber: number) => {
    if (!isPositioning || !signature) return;

    const aspectRatio = 0.4; // Height is 40% of width
    setSignaturePosition({
      x,
      y,
      pageNumber,
      width: signatureSize,
      height: signatureSize * aspectRatio,
    });

    toast.success(`Signature positioned on page ${pageNumber}`);
  };

  const handleStartPositioning = () => {
    if (!signature) {
      toast.error('Please create or upload your signature first');
      return;
    }
    setIsPositioning(true);
    toast.info('Click on the PDF preview to position your signature');
  };

  const handleSign = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select a PDF file to sign');
      return;
    }

    if (!signature) {
      toast.error('Please create or upload your signature');
      return;
    }

    if (!signaturePosition) {
      toast.error('Please position your signature on the document');
      return;
    }

    setIsProcessing(true);
    try {
      // Use pdf-lib to add signature to PDF
      const pdfBytes = await PDFProcessor.addSignatureToPDF(
        selectedFiles[0],
        {
          signatureImage: signature,
          pageNumber: signaturePosition.pageNumber,
          x: signaturePosition.x,
          y: signaturePosition.y,
          width: signaturePosition.width,
          height: signaturePosition.height,
        }
      );

      // Create blob and download URL
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setSignedFileUrl(url);
      setSignedFileBlob(blob);
      setIsPositioning(false);
      
      toast.success('Document signed successfully!');
    } catch (error) {
      console.error('Signing error:', error);
      toast.error('Failed to sign document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!signedFileUrl || !signedFileBlob) return;

    const fileName = selectedFiles[0]?.name.replace('.pdf', '-signed.pdf') || 'signed-document.pdf';
    const link = document.createElement('a');
    link.href = signedFileUrl;
    link.download = fileName;
    link.click();
    
    toast.success('Download started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Top Ad */}
          <AdPlaceholder variant="banner" />
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileSignature className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Advanced PDF Signing</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Add your digital signature to PDFs with precise positioning and preview
            </p>
          </div>

          {/* Upload PDF */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">1. Upload Document</CardTitle>
              <CardDescription className="text-slate-400">
                Select the PDF document you want to sign
              </CardDescription>
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

          {/* Signature Pad */}
          {selectedFiles.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">2. Create Your Signature</CardTitle>
                <CardDescription className="text-slate-400">
                  Draw or upload your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignaturePad onSignatureChange={setSignature} />
              </CardContent>
            </Card>
          )}

          {/* Position Signature */}
          {selectedFiles.length > 0 && signature && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Preview Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">3. Position Signature</CardTitle>
                  <CardDescription className="text-slate-400">
                    {isPositioning 
                      ? 'Click on the document to place your signature' 
                      : 'Enable positioning mode and click to place signature'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PDFPreview 
                    file={selectedFiles[0]} 
                    interactive={isPositioning}
                    onPageClick={handlePageClick}
                  />
                </CardContent>
              </Card>

              {/* Controls Panel */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Signature Settings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Customize signature appearance and position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Signature Preview */}
                  {signature && (
                    <div className="space-y-2">
                      <Label className="text-slate-200">Signature Preview</Label>
                      <div className="border-2 border-slate-600 rounded-lg p-4 bg-white">
                        <img 
                          src={signature} 
                          alt="Signature preview" 
                          className="max-h-24 mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Size Control */}
                  <div className="space-y-2">
                    <Label className="text-slate-200">
                      Signature Size: {signatureSize}px
                    </Label>
                    <Slider
                      value={[signatureSize]}
                      onValueChange={(value) => setSignatureSize(value[0])}
                      min={80}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Position Status */}
                  {signaturePosition && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <p className="text-green-400 text-sm font-medium">
                        ✓ Signature positioned on page {signaturePosition.pageNumber}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Position: ({Math.round(signaturePosition.x)}, {Math.round(signaturePosition.y)})
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    {!isPositioning ? (
                      <Button
                        onClick={handleStartPositioning}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="lg"
                      >
                        <MousePointer className="mr-2 w-5 h-5" />
                        Enable Positioning Mode
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setIsPositioning(false)}
                        variant="outline"
                        className="w-full border-slate-600"
                        size="lg"
                      >
                        Disable Positioning Mode
                      </Button>
                    )}

                    <Button
                      onClick={handleSign}
                      disabled={!signaturePosition || isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                          Signing Document...
                        </>
                      ) : (
                        <>
                          <FileSignature className="mr-2 w-5 h-5" />
                          Sign Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success State */}
          {signedFileUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center text-green-400 text-lg font-semibold">
                    🎉 Your document has been signed successfully!
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Download Signed PDF
                    </Button>
                    <ShareDialog
                      fileName={selectedFiles[0]?.name.replace('.pdf', '-signed.pdf') || 'signed-document.pdf'}
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
