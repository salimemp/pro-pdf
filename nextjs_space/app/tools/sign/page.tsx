
'use client';

import { useState } from 'react';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Header } from '@/components/header';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Footer } from '@/components/footer';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { FileUpload } from '@/components/file-upload';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { SignaturePad } from '@/components/signature-pad';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { ShareDialog } from '@/components/share-dialog';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Button } from '@/components/ui/button';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { FileSignature, Download, Share2 } from 'lucide-react';
import { AdPlaceholder } from "@/components/ad-placeholder";
import { toast } from 'sonner';
import { AdPlaceholder } from "@/components/ad-placeholder";

export default function SignPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signedFileUrl, setSignedFileUrl] = useState<string>('');

  const handleSign = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select a PDF file to sign');
      return;
    }

    if (!signature) {
      toast.error('Please create or upload your signature');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate signing process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSignedFileUrl('#signed-file');
      toast.success('Document signed successfully!');
    } catch (error) {
      toast.error('Failed to sign document. Please try again.');
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
              <FileSignature className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Sign PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Add your digital signature to PDFs. Draw, type, or upload your signature securely.
            </p>
          </div>

          {/* Upload PDF */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
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
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Create Your Signature</h3>
              <SignaturePad onSignatureChange={setSignature} />
            </div>
          )}

          {/* Sign Button */}
          {selectedFiles.length > 0 && signature && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleSign}
                disabled={isProcessing}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
              >
                {isProcessing ? (
                  'Signing Document...'
                ) : (
                  <>
                    <FileSignature className="mr-2 w-5 h-5" />
                    Sign Document
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success State */}
          {signedFileUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center text-green-400 text-lg font-semibold">
                    Your document has been signed successfully!
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 w-4 h-4" />
                      Download Signed PDF
                    </Button>
                    <ShareDialog
                      fileName={selectedFiles[0]?.name || 'signed-document.pdf'}
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
