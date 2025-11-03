
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Unlock, ArrowRight, Download, Share2, Info, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generatePasswordKey, decryptFile, extractEncryptedBundle } from "@/lib/encryption";

export default function DecryptPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [decryptedPdfBlob, setDecryptedPdfBlob] = useState<Blob | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDownloadUrl('');
      setDecryptedPdfBlob(null);
      setMetadata(null);
    }
  };

  const handleDecrypt = async () => {
    if (!selectedFile) {
      toast.error("Please select an encrypted PDF file");
      return;
    }

    if (!password) {
      toast.error("Please enter the decryption password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsProcessing(true);
    try {
      // Read the encrypted file
      const fileBuffer = await selectedFile.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);
      
      // Extract salt (first 16 bytes)
      const salt = fileData.slice(0, 16);
      
      // Extract bundle (rest of the data)
      const bundle = fileData.slice(16).buffer;
      
      // Generate decryption key from password
      const decryptionKey = await generatePasswordKey(password, salt);
      
      // Extract encrypted data, IV, and metadata from bundle
      const { encryptedData, iv, metadata: extractedMetadata } = extractEncryptedBundle(bundle);
      
      setMetadata(extractedMetadata);
      
      // Decrypt the file
      const decryptedData = await decryptFile(
        encryptedData,
        decryptionKey,
        iv,
        (progress) => {
          console.log(`Decryption progress: ${progress}%`);
        }
      );
      
      // Create blob from decrypted data
      const blob = new Blob([decryptedData], { type: extractedMetadata.fileType || 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setDecryptedPdfBlob(blob);
      setDownloadUrl(url);
      toast.success("PDF decrypted successfully!");
    } catch (error) {
      console.error('Decryption error:', error);
      toast.error("Failed to decrypt PDF. Please check your password and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !decryptedPdfBlob) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    const fileName = metadata?.fileName || 'decrypted-document.pdf';
    link.download = fileName.replace('.encrypted.pdf', '') + '-decrypted.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Unlock className="w-8 h-8 text-amber-400" />
              <h1 className="text-4xl font-bold text-white">Decrypt PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Decrypt your password-protected PDF files securely. All decryption happens in your browser.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>Upload Encrypted PDF</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload a PDF file that was encrypted using the Encrypt tool</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".encrypted.pdf,.pdf,application/octet-stream"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <Unlock className="w-12 h-12 text-amber-400 mx-auto" />
                      <div className="text-white font-medium">
                        {selectedFile ? selectedFile.name : 'Click to select encrypted PDF'}
                      </div>
                      <div className="text-slate-400 text-sm">
                        {selectedFile ? `Size: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Max file size: 50 MB'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedFile && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Unlock className="w-5 h-5 text-amber-400" />
                  <span>Enter Decryption Password</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Enter the user password that was used to encrypt this PDF</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-slate-200">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter decryption password"
                      className="bg-slate-900/50 border-slate-600 text-white pr-10"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && password && selectedFile) {
                          handleDecrypt();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="lg"
                          onClick={handleDecrypt}
                          disabled={isProcessing || !password}
                          className={cn(
                            "bg-amber-600 hover:bg-amber-700 px-8 py-3",
                            !password && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isProcessing ? (
                            "Decrypting PDF..."
                          ) : (
                            <>
                              <Unlock className="mr-2 w-5 h-5" />
                              Decrypt PDF
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Decrypt the PDF using your password</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-green-400 text-lg font-semibold mb-2">
                      Your PDF has been decrypted successfully!
                    </div>
                    {metadata && (
                      <div className="text-slate-300 text-sm space-y-1">
                        <p>✓ Original filename: {metadata.fileName}</p>
                        <p>✓ File size: {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        <p>✓ Encryption: {metadata.encryptionMethod}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 w-4 h-4" />
                            Download Decrypted PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download your decrypted PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
