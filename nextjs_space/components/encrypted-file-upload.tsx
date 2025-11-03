
'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { FileUpload } from './file-upload';
import { EncryptionManager } from './encryption-manager';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  encryptFile,
  createEncryptedBundle,
  retrieveKeyFromBrowser,
  generateEncryptionKey,
  storeKeyInBrowser,
  generateKeyId,
} from '@/lib/encryption';

interface EncryptedFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onEncryptedFilesReady?: (files: { file: File; encrypted: boolean }[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  allowReorder?: boolean;
  enableEncryption?: boolean;
}

export function EncryptedFileUpload({
  onFilesSelected,
  onEncryptedFilesReady,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
  acceptedTypes = ['application/pdf', 'image/*', '.docx', '.xlsx', '.pptx'],
  className,
  allowReorder = true,
  enableEncryption = false,
}: EncryptedFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [showEncryptionManager, setShowEncryptionManager] = useState(false);
  const [hasEncryptionKey, setHasEncryptionKey] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [currentKeyId, setCurrentKeyId] = useState<string | null>(null);

  useEffect(() => {
    checkForEncryptionKey();
  }, []);

  const checkForEncryptionKey = async () => {
    const keyId = localStorage.getItem('current_encryption_key_id');
    if (keyId) {
      const key = await retrieveKeyFromBrowser(keyId);
      if (key) {
        setHasEncryptionKey(true);
        setCurrentKeyId(keyId);
      }
    }
  };

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    
    if (!enableEncryption) {
      onFilesSelected(selectedFiles);
      if (onEncryptedFilesReady) {
        onEncryptedFilesReady(selectedFiles.map(f => ({ file: f, encrypted: false })));
      }
      return;
    }

    // If encryption is enabled, wait for encryption before calling callbacks
  }, [onFilesSelected, onEncryptedFilesReady, enableEncryption]);

  const handleEncryptFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to encrypt');
      return;
    }

    let keyId = currentKeyId;
    let key = keyId ? await retrieveKeyFromBrowser(keyId) : null;

    // Generate key if not exists
    if (!key) {
      try {
        key = await generateEncryptionKey();
        keyId = generateKeyId();
        await storeKeyInBrowser(keyId, key);
        localStorage.setItem('current_encryption_key_id', keyId);
        setCurrentKeyId(keyId);
        setHasEncryptionKey(true);
        toast.success('Encryption key generated');
      } catch (error) {
        console.error('Failed to generate key:', error);
        toast.error('Failed to generate encryption key');
        return;
      }
    }

    if (!key) {
      toast.error('No encryption key available');
      return;
    }

    setIsEncrypting(true);
    setEncryptionProgress(0);

    const encryptedFiles: { file: File; encrypted: boolean }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Encrypt the file
        const { encryptedData, iv } = await encryptFile(
          file,
          key,
          (progress) => {
            const overallProgress = ((i + progress / 100) / files.length) * 100;
            setEncryptionProgress(Math.round(overallProgress));
          }
        );

        // Create encrypted bundle
        const bundle = createEncryptedBundle(encryptedData, iv, {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        // Create new File from encrypted bundle
        const encryptedFile = new File(
          [bundle],
          `${file.name}.encrypted`,
          { type: 'application/octet-stream' }
        );

        encryptedFiles.push({ file: encryptedFile, encrypted: true });
      }

      toast.success(`${files.length} file(s) encrypted successfully`);

      if (onEncryptedFilesReady) {
        onEncryptedFilesReady(encryptedFiles);
      }

      onFilesSelected(encryptedFiles.map(ef => ef.file));
    } catch (error) {
      console.error('Encryption failed:', error);
      toast.error('Failed to encrypt files');
    } finally {
      setIsEncrypting(false);
      setEncryptionProgress(0);
    }
  };

  return (
    <div className={className}>
      {/* Encryption Status */}
      {enableEncryption && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Zero-Knowledge Encryption
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEncryptionManager(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Manage Keys
            </Button>
          </div>

          {hasEncryptionKey ? (
            <Alert className="bg-green-900/20 border-green-700/50">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300 text-sm">
                Encryption is active. Your files will be encrypted before upload.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-yellow-900/20 border-yellow-700/50">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300 text-sm">
                No encryption key found. Click "Manage Keys" to generate one.
              </AlertDescription>
            </Alert>
          )}

          {/* Encryption Progress */}
          {isEncrypting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Encrypting files...</span>
                <span className="text-blue-400 font-semibold">{encryptionProgress}%</span>
              </div>
              <Progress value={encryptionProgress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* File Upload */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        maxFiles={maxFiles}
        maxSize={maxSize}
        acceptedTypes={acceptedTypes}
        allowReorder={allowReorder}
      />

      {/* Encrypt Button */}
      {enableEncryption && files.length > 0 && hasEncryptionKey && !isEncrypting && (
        <div className="mt-4">
          <Button
            onClick={handleEncryptFiles}
            className="w-full"
            size="lg"
          >
            <Lock className="w-4 h-4 mr-2" />
            Encrypt & Process Files
          </Button>
        </div>
      )}

      {/* Encryption Manager Dialog */}
      <EncryptionManager
        open={showEncryptionManager}
        onOpenChange={setShowEncryptionManager}
        onKeyReady={(keyId) => {
          setCurrentKeyId(keyId);
          setHasEncryptionKey(true);
        }}
      />
    </div>
  );
}
