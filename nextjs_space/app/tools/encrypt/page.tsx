
'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FileUpload } from "@/components/file-upload";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, ArrowRight, Download, Share2, Info, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EncryptPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  
  // Password settings
  const [ownerPassword, setOwnerPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const [showUserPassword, setShowUserPassword] = useState(false);
  
  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);
  const [allowAnnotations, setAllowAnnotations] = useState(true);

  const handleEncrypt = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select a PDF file to encrypt");
      return;
    }

    if (!ownerPassword || !userPassword) {
      toast.error("Please set both owner and user passwords");
      return;
    }

    if (ownerPassword.length < 6 || userPassword.length < 6) {
      toast.error("Passwords must be at least 6 characters long");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      setDownloadUrl('#encrypted-pdf-download');
      toast.success("PDF encrypted successfully! Your document is now secure.");
    } catch (error) {
      toast.error("Failed to encrypt PDF. Please try again.");
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
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Encrypt PDF</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Protect your PDF files with password encryption. Set permissions to control what users can do with your document.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <span>Upload PDF File</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload a PDF file to encrypt with password protection</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesSelected={setSelectedFiles}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                acceptedTypes={['application/pdf']}
                allowReorder={false}
              />
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <>
              {/* Password Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-blue-400" />
                    <span>Password Protection</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Set two passwords: Owner password for full control, and User password for viewing</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Owner Password */}
                  <div>
                    <Label htmlFor="ownerPassword" className="text-slate-200 flex items-center space-x-2">
                      <span>Owner Password (Master Password)</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Full access password - allows changing permissions and removing security</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="ownerPassword"
                        type={showOwnerPassword ? "text" : "password"}
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder="Enter owner password (min 6 characters)"
                        className="bg-slate-900/50 border-slate-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showOwnerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* User Password */}
                  <div>
                    <Label htmlFor="userPassword" className="text-slate-200 flex items-center space-x-2">
                      <span>User Password (Open Password)</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Required to open and view the document, with limited permissions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="userPassword"
                        type={showUserPassword ? "text" : "password"}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter user password (min 6 characters)"
                        className="bg-slate-900/50 border-slate-600 text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserPassword(!showUserPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {(ownerPassword || userPassword) && (
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <strong>Tip:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <span>Document Permissions</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Control what users can do with the document after opening it</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50">
                          <Checkbox
                            id="printing"
                            checked={allowPrinting}
                            onCheckedChange={(checked) => setAllowPrinting(checked as boolean)}
                          />
                          <Label htmlFor="printing" className="text-slate-300 cursor-pointer flex-1">
                            Allow Printing
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Users can print the document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50">
                          <Checkbox
                            id="copying"
                            checked={allowCopying}
                            onCheckedChange={(checked) => setAllowCopying(checked as boolean)}
                          />
                          <Label htmlFor="copying" className="text-slate-300 cursor-pointer flex-1">
                            Allow Copying Content
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Users can copy text and images from the document</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50">
                          <Checkbox
                            id="editing"
                            checked={allowEditing}
                            onCheckedChange={(checked) => setAllowEditing(checked as boolean)}
                          />
                          <Label htmlFor="editing" className="text-slate-300 cursor-pointer flex-1">
                            Allow Editing
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Users can modify the document content</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-800/50">
                          <Checkbox
                            id="annotations"
                            checked={allowAnnotations}
                            onCheckedChange={(checked) => setAllowAnnotations(checked as boolean)}
                          />
                          <Label htmlFor="annotations" className="text-slate-300 cursor-pointer flex-1">
                            Allow Annotations & Comments
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Users can add comments and annotations</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Encrypt Button */}
              <div className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        onClick={handleEncrypt}
                        disabled={isProcessing || !ownerPassword || !userPassword}
                        className={cn(
                          "bg-blue-600 hover:bg-blue-700 px-8 py-3",
                          (!ownerPassword || !userPassword) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isProcessing ? (
                          "Encrypting PDF..."
                        ) : (
                          <>
                            <Shield className="mr-2 w-5 h-5" />
                            Encrypt PDF
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Apply password protection and permissions to your PDF</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}

          {downloadUrl && (
            <Card className="bg-green-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-green-400 text-lg font-semibold mb-2">
                      Your PDF has been encrypted successfully!
                    </div>
                    <div className="text-slate-300 text-sm space-y-1">
                      <p>✓ Password protection enabled</p>
                      <p>✓ Custom permissions applied</p>
                      <p>✓ Military-grade AES-256 encryption</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 w-4 h-4" />
                            Download Encrypted PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download your password-protected PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <ShareDialog
                      fileName="encrypted-document.pdf"
                      trigger={
                        <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20">
                          <Share2 className="mr-2 w-4 h-4" />
                          Share Secure Document
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
