
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Download, 
  Copy, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  storeKeyInBrowser,
  retrieveKeyFromBrowser,
  deleteKeyFromBrowser,
  generateKeyId,
} from '@/lib/encryption';
import { toast } from 'sonner';

interface EncryptionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onKeyReady?: (keyId: string, key: CryptoKey) => void;
}

export function EncryptionManager({ open, onOpenChange, onKeyReady }: EncryptionManagerProps) {
  const [hasKey, setHasKey] = useState(false);
  const [currentKeyId, setCurrentKeyId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [exportedKey, setExportedKey] = useState<string>('');
  const [importKeyString, setImportKeyString] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkForExistingKey();
  }, []);

  const checkForExistingKey = () => {
    const storedKeyId = localStorage.getItem('current_encryption_key_id');
    if (storedKeyId) {
      setCurrentKeyId(storedKeyId);
      setHasKey(true);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setLoading(true);
      const key = await generateEncryptionKey();
      const keyId = generateKeyId();
      
      await storeKeyInBrowser(keyId, key);
      localStorage.setItem('current_encryption_key_id', keyId);
      
      setCurrentKeyId(keyId);
      setHasKey(true);
      
      const exported = await exportKey(key);
      setExportedKey(exported);
      
      toast.success('Encryption key generated successfully');
      
      if (onKeyReady) {
        onKeyReady(keyId, key);
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
      toast.error('Failed to generate encryption key');
    } finally {
      setLoading(false);
    }
  };

  const handleExportKey = async () => {
    if (!currentKeyId) return;
    
    try {
      const key = await retrieveKeyFromBrowser(currentKeyId);
      if (!key) {
        toast.error('Encryption key not found');
        return;
      }
      
      const exported = await exportKey(key);
      setExportedKey(exported);
      setShowKey(true);
    } catch (error) {
      console.error('Failed to export key:', error);
      toast.error('Failed to export encryption key');
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(exportedKey);
    toast.success('Encryption key copied to clipboard');
  };

  const handleDownloadKey = () => {
    const blob = new Blob([exportedKey], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encryption-key-${currentKeyId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Encryption key downloaded');
  };

  const handleImportKey = async () => {
    if (!importKeyString.trim()) {
      toast.error('Please paste your encryption key');
      return;
    }
    
    try {
      setLoading(true);
      const key = await importKey(importKeyString);
      const keyId = generateKeyId();
      
      await storeKeyInBrowser(keyId, key);
      localStorage.setItem('current_encryption_key_id', keyId);
      
      setCurrentKeyId(keyId);
      setHasKey(true);
      setImportKeyString('');
      
      toast.success('Encryption key imported successfully');
      
      if (onKeyReady) {
        onKeyReady(keyId, key);
      }
    } catch (error) {
      console.error('Failed to import key:', error);
      toast.error('Failed to import encryption key. Please check the key format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = () => {
    if (!currentKeyId) return;
    
    if (confirm('Are you sure you want to delete your encryption key? You will not be able to decrypt any files encrypted with this key.')) {
      deleteKeyFromBrowser(currentKeyId);
      localStorage.removeItem('current_encryption_key_id');
      setCurrentKeyId(null);
      setHasKey(false);
      setExportedKey('');
      toast.success('Encryption key deleted');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span>Zero-Knowledge Encryption</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Your files are encrypted on your device before upload. The server never sees your encryption key or unencrypted data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert className="bg-blue-900/20 border-blue-700/50">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-sm">
              Your encryption key is stored locally in your browser. Make sure to export and backup your key - you'll need it to decrypt your files.
            </AlertDescription>
          </Alert>

          {/* Current Key Status */}
          {hasKey && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Encryption Enabled</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Key ID:</span>
                  <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded">
                    {currentKeyId?.slice(0, 20)}...
                  </code>
                </div>
                
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportKey}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Key
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View your encryption key</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadKey}
                          className="flex-1"
                          disabled={!exportedKey}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download key as file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteKey}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete encryption key</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Show Exported Key */}
                {showKey && exportedKey && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Your Encryption Key</Label>
                    <div className="relative">
                      <textarea
                        readOnly
                        value={exportedKey}
                        className="w-full h-32 bg-slate-900 text-slate-300 text-xs font-mono p-3 rounded border border-slate-700 resize-none"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyKey}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Alert className="bg-yellow-900/20 border-yellow-700/50">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-300 text-xs">
                        Save this key in a secure location. Without it, you cannot decrypt your files.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate New Key */}
          {!hasKey && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span>Generate Encryption Key</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Create a new encryption key for securing your files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGenerateKey}
                  disabled={loading}
                  className="w-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Import Key */}
          {!hasKey && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span>Import Existing Key</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Restore your encryption key from a backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="import-key" className="text-slate-300">
                    Paste your encryption key
                  </Label>
                  <textarea
                    id="import-key"
                    value={importKeyString}
                    onChange={(e) => setImportKeyString(e.target.value)}
                    placeholder='{"kty":"oct","k":"...","alg":"A256GCM",...}'
                    className="w-full h-24 bg-slate-900 text-slate-300 text-xs font-mono p-3 rounded border border-slate-700 resize-none mt-2"
                  />
                </div>
                <Button
                  onClick={handleImportKey}
                  disabled={loading || !importKeyString.trim()}
                  className="w-full"
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  Import Key
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
