

'use client';

import { useState } from 'react';
import { Download, CheckCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DownloadFile {
  id: string;
  name: string;
  url: string;
  size?: number;
}

interface BatchDownloadProps {
  files: DownloadFile[];
  className?: string;
}

export function BatchDownload({ files, className }: BatchDownloadProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set(files.map(f => f.id)));
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());

  const toggleFileSelection = (id: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const downloadSingleFile = async (file: DownloadFile) => {
    setDownloadingFiles(prev => new Set(prev).add(file.id));
    
    try {
      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch the file here
      // const response = await fetch(file.url);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCompletedFiles(prev => new Set(prev).add(file.id));
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      toast.error(`Failed to download ${file.name}`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const downloadAllSelected = async () => {
    const filesToDownload = files.filter(f => selectedFiles.has(f.id));
    
    if (filesToDownload.length === 0) {
      toast.error('Please select at least one file to download');
      return;
    }

    toast.info(`Downloading ${filesToDownload.length} file${filesToDownload.length > 1 ? 's' : ''}...`);

    for (const file of filesToDownload) {
      await downloadSingleFile(file);
      // Add a small delay between downloads to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    toast.success(`All ${filesToDownload.length} files downloaded successfully!`);
  };

  const downloadProgress = (completedFiles.size / files.length) * 100;

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Download Files</h3>
                <p className="text-sm text-slate-400">
                  {selectedFiles.size} of {files.length} selected
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{selectedFiles.size === files.length ? 'Deselect all files' : 'Select all files'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={downloadAllSelected}
                      disabled={selectedFiles.size === 0 || downloadingFiles.size > 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {downloadingFiles.size > 0 ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Selected
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download all selected files</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Progress Bar */}
          {completedFiles.size > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-green-400 font-medium">
                  {completedFiles.size} / {files.length} completed
                </span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          {/* File List */}
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {files.map((file) => {
              const isSelected = selectedFiles.has(file.id);
              const isDownloading = downloadingFiles.has(file.id);
              const isCompleted = completedFiles.has(file.id);

              return (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all",
                    isSelected ? "bg-slate-700/50 border-blue-500/50" : "bg-slate-900/50 border-slate-700",
                    isCompleted && "bg-green-900/20 border-green-700/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleFileSelection(file.id)}
                    disabled={isDownloading}
                    className="border-slate-500"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    {file.size && (
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadSingleFile(file)}
                          disabled={isDownloading}
                          className="h-8 px-3"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download this file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
