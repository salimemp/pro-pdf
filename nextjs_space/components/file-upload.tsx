
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedTypes = ['application/pdf', 'image/*', '.docx', '.xlsx', '.pptx'],
  className
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ errors }) => 
        errors.map((error: any) => error.message).join(', ')
      ).join('; ');
      setError(`Some files were rejected: ${errors}`);
    }

    if (acceptedFiles.length > 0) {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const,
        id: Math.random().toString(36).substr(2, 9)
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((uploadedFile, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadedFile.id 
                  ? { ...f, progress: 100, status: 'completed' as const }
                  : f
              )
            );
          } else {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadedFile.id 
                  ? { ...f, progress: Math.round(progress) }
                  : f
              )
            );
          }
        }, 200);
      });

      // Notify parent component
      const allFiles = [...uploadedFiles.map(uf => uf.file), ...acceptedFiles];
      onFilesSelected(allFiles);
    }
  }, [uploadedFiles, maxFiles, onFilesSelected]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true
  });

  const removeFile = (id: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === id);
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    
    if (fileToRemove) {
      const remainingFiles = uploadedFiles
        .filter(f => f.id !== id)
        .map(f => f.file);
      onFilesSelected(remainingFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          "hover:border-blue-500 hover:bg-blue-50/5",
          isDragActive && !isDragReject && "border-blue-500 bg-blue-50/10",
          isDragReject && "border-red-500 bg-red-50/10",
          "border-slate-600"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          
          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-lg font-medium text-blue-400">
                Drop your files here...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium text-slate-200">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-sm text-slate-400">
                  Supports PDF, Word, Excel, PowerPoint, and images
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
            <span>Max {maxFiles} files</span>
            <span>•</span>
            <span>Up to {formatFileSize(maxSize)} each</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-3 bg-slate-800/50 rounded-lg p-3"
              >
                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="h-6 w-6 p-0 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {formatFileSize(uploadedFile.file.size)}
                    </span>
                    <span className={cn(
                      "font-medium",
                      uploadedFile.status === 'completed' && "text-green-400",
                      uploadedFile.status === 'uploading' && "text-blue-400",
                      uploadedFile.status === 'error' && "text-red-400"
                    )}>
                      {uploadedFile.status === 'completed' && 'Ready'}
                      {uploadedFile.status === 'uploading' && `${uploadedFile.progress}%`}
                      {uploadedFile.status === 'error' && 'Error'}
                    </span>
                  </div>
                  
                  {uploadedFile.status === 'uploading' && (
                    <Progress 
                      value={uploadedFile.progress} 
                      className="h-1"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
