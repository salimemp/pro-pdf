
'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, FileText, X, AlertCircle, GripVertical, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  allowReorder?: boolean;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  id: string;
}

interface SortableFileItemProps {
  uploadedFile: UploadedFile;
  onRemove: (id: string) => void;
  formatFileSize: (bytes: number) => number;
  allowReorder: boolean;
}

function SortableFileItem({ uploadedFile, onRemove, formatFileSize, allowReorder }: SortableFileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: uploadedFile.id, disabled: !allowReorder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center space-x-3 bg-slate-800/50 rounded-lg p-3 transition-all",
        isDragging && "shadow-lg ring-2 ring-blue-500/50"
      )}
    >
      {allowReorder && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-slate-500 hover:text-slate-300" />
        </div>
      )}
      
      <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm font-medium text-slate-200 truncate">
                  {uploadedFile.file.name}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{uploadedFile.file.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(uploadedFile.id)}
                  className="h-6 w-6 p-0 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {formatFileSize(uploadedFile.file.size)} MB
          </span>
          <span className={cn(
            "font-medium flex items-center space-x-1",
            uploadedFile.status === 'completed' && "text-green-400",
            uploadedFile.status === 'uploading' && "text-blue-400",
            uploadedFile.status === 'error' && "text-red-400"
          )}>
            {uploadedFile.status === 'uploading' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{uploadedFile.progress}%</span>
              </>
            )}
            {uploadedFile.status === 'completed' && 'Ready'}
            {uploadedFile.status === 'error' && 'Error'}
          </span>
        </div>
        
        {uploadedFile.status === 'uploading' && (
          <Progress 
            value={uploadedFile.progress} 
            className="h-1.5"
          />
        )}
      </div>
    </div>
  );
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  acceptedTypes = ['application/pdf', 'image/*', '.docx', '.xlsx', '.pptx'],
  className,
  allowReorder = true
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const isMountedRef = useRef(true);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cleanup all intervals on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear all running intervals
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      intervalsRef.current.clear();
    };
  }, []);

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
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);

      // Simulate upload progress with proper cleanup
      newFiles.forEach((uploadedFile) => {
        let progress = 0;
        const interval = setInterval(() => {
          // Check if component is still mounted
          if (!isMountedRef.current) {
            clearInterval(interval);
            intervalsRef.current.delete(uploadedFile.id);
            return;
          }

          progress += Math.random() * 25 + 10; // More consistent progress
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            intervalsRef.current.delete(uploadedFile.id);
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
        }, 300);
        
        // Store interval reference for cleanup
        intervalsRef.current.set(uploadedFile.id, interval);
      });
    }
  }, [uploadedFiles, maxFiles]);

  // Update parent component whenever files change
  // Using useRef to avoid infinite re-render loop
  const onFilesSelectedRef = useRef(onFilesSelected);
  useEffect(() => {
    onFilesSelectedRef.current = onFilesSelected;
  }, [onFilesSelected]);

  useEffect(() => {
    onFilesSelectedRef.current(uploadedFiles.map(uf => uf.file));
  }, [uploadedFiles]);

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
    multiple: true,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (id: string) => {
    // Clear the interval for this file if it exists
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 0;
    const mb = bytes / (1024 * 1024);
    return parseFloat(mb.toFixed(2));
  };

  const formatFileSizeLabel = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setUploadedFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Filter files based on search query
  const filteredFiles = uploadedFiles.filter(file =>
    file.file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          "hover:border-blue-500 hover:bg-blue-50/5",
          isDragActive && !isDragReject && "border-blue-500 bg-blue-50/10 scale-[1.02]",
          isDragReject && "border-red-500 bg-red-50/10",
          "border-slate-600"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100/10 rounded-full flex items-center justify-center">
            <Upload className={cn(
              "w-8 h-8 text-blue-400 transition-transform",
              isDragActive && "scale-110"
            )} />
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
            <span>Up to {formatFileSizeLabel(maxSize)} each</span>
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            {allowReorder && uploadedFiles.length > 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-slate-500 flex items-center space-x-1">
                      <GripVertical className="w-3 h-3" />
                      <span>Drag to reorder</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Files will be processed in this order</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Search Bar */}
          {uploadedFiles.length > 3 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          )}
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredFiles.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No files found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredFiles.map((uploadedFile) => (
                    <SortableFileItem
                      key={uploadedFile.id}
                      uploadedFile={uploadedFile}
                      onRemove={removeFile}
                      formatFileSize={formatFileSize}
                      allowReorder={allowReorder}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
