
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Loader2, AlertCircle, FileText, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatchProgressFile {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  size?: number; // in bytes
}

interface BatchProgressProps {
  files: BatchProgressFile[];
  totalProgress: number;
  className?: string;
  estimatedTimeRemaining?: number; // in seconds
}

export function BatchProgress({ 
  files, 
  totalProgress, 
  className,
  estimatedTimeRemaining 
}: BatchProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (totalProgress < 100) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [totalProgress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    } else if (kb >= 1) {
      return `${kb.toFixed(2)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const processingCount = files.filter(f => f.status === 'processing').length;
  
  // Calculate throughput
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const processedSize = files
    .filter(f => f.status === 'completed')
    .reduce((sum, f) => sum + (f.size || 0), 0);
  const throughput = elapsedTime > 0 ? processedSize / elapsedTime : 0;

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Batch Processing</h3>
              <p className="text-sm font-normal text-slate-400">
                {completedCount} of {files.length} files completed
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(estimatedTimeRemaining)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated time remaining</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300 font-medium">Overall Progress</span>
            <span className="text-blue-400 font-semibold">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          
          {/* Stats Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{completedCount} completed</span>
              </span>
              {processingCount > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>{processingCount} processing</span>
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{errorCount} failed</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {totalSize > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-slate-400">
                        {formatFileSize(processedSize)} / {formatFileSize(totalSize)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Data processed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {throughput > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-blue-400">
                        {formatFileSize(throughput)}/s
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Processing speed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Individual File Progress */}
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                file.status === 'completed' && "bg-green-900/20 border-green-700/50",
                file.status === 'processing' && "bg-blue-900/20 border-blue-700/50",
                file.status === 'error' && "bg-red-900/20 border-red-700/50",
                file.status === 'pending' && "bg-slate-900/50 border-slate-700"
              )}
            >
              <div className="flex items-center space-x-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'completed' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Completed successfully</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {file.status === 'processing' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Processing in progress</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {file.status === 'error' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.error || 'Processing failed'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {file.status === 'pending' && (
                    <FileText className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              file.status === 'completed' && "text-green-300",
                              file.status === 'processing' && "text-blue-300",
                              file.status === 'error' && "text-red-300",
                              file.status === 'pending' && "text-slate-400"
                            )}>
                              {file.name}
                            </p>
                            {file.size && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatFileSize(file.size)}
                              </p>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{file.name}</p>
                          {file.size && <p className="text-xs">{formatFileSize(file.size)}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {file.status === 'processing' && (
                      <span className="text-xs text-blue-400 font-medium ml-2 flex-shrink-0">
                        {file.progress}%
                      </span>
                    )}
                    {file.status === 'completed' && file.size && (
                      <span className="text-xs text-green-400 ml-2 flex-shrink-0">
                        ✓ Done
                      </span>
                    )}
                  </div>

                  {/* Progress Bar for Processing Files */}
                  {file.status === 'processing' && (
                    <Progress value={file.progress} className="h-1.5" />
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-400">{file.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
