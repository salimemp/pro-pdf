
'use client';

import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pen, Upload, RotateCcw, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SignaturePadProps {
  onSignatureChange?: (signature: string | null) => void;
}

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('draw');

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      onSignatureChange?.(null);
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const dataUrl = signatureRef.current.toDataURL();
      onSignatureChange?.(dataUrl);
      toast.success('Signature saved successfully');
      return dataUrl;
    }
    toast.error('Please draw your signature first');
    return null;
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedSignature(dataUrl);
        onSignatureChange?.(dataUrl);
        toast.success('Signature uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveUpload = () => {
    setUploadedSignature(null);
    onSignatureChange?.(null);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-900">
            <TabsTrigger value="draw" className="data-[state=active]:bg-purple-600">
              <Pen className="w-4 h-4 mr-2" />
              Draw Signature
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-slate-200">Draw your signature below</Label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-48 cursor-crosshair',
                  }}
                  backgroundColor="white"
                  penColor="black"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex-1 border-slate-600 hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Save Signature
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-6">
            {!uploadedSignature ? (
              <div className="space-y-4">
                <Label className="text-slate-200">Upload a signature image</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    id="signature-upload"
                  />
                  <label
                    htmlFor="signature-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-200 font-medium">
                        Click to upload signature image
                      </p>
                      <p className="text-sm text-slate-400">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Label className="text-slate-200">Uploaded Signature</Label>
                <div className="border-2 border-slate-600 rounded-lg p-4 bg-white">
                  <img
                    src={uploadedSignature}
                    alt="Uploaded signature"
                    className="max-h-48 mx-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveUpload}
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                  <label htmlFor="signature-upload" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-600 hover:bg-slate-700"
                      onClick={() => document.getElementById('signature-upload')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Replace
                    </Button>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    id="signature-upload"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
