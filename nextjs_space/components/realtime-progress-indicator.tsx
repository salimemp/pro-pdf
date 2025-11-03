
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Loader2, AlertCircle, Clock, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgressStream } from '@/hooks/use-progress-stream';

interface RealtimeProgressIndicatorProps {
  jobId: string;
  fileName?: string;
  onComplete?: () => void;
  className?: string;
}

export function RealtimeProgressIndicator({ 
  jobId, 
  fileName,
  onComplete,
  className 
}: RealtimeProgressIndicatorProps) {
  const { progress, isConnected, error, reconnect } = useProgressStream(jobId);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (progress?.status === 'completed' && onComplete) {
      onComplete();
    }
  }, [progress?.status, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (!progress) return 'text-slate-400';
    switch (progress.status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    if (!progress) return <Clock className="w-4 h-4 text-slate-400" />;
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Processing</h3>
              {fileName && (
                <p className="text-xs font-normal text-slate-400 truncate max-w-xs">
                  {fileName}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <Activity 
                      className={cn(
                        "w-3 h-3",
                        isConnected ? "text-green-400 animate-pulse" : "text-red-400"
                      )} 
                    />
                    <span className={cn(
                      "text-xs",
                      isConnected ? "text-green-400" : "text-red-400"
                    )}>
                      {isConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isConnected ? 'Real-time updates active' : 'Connection lost'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Elapsed Time */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatTime(elapsedTime)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Elapsed time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={cn("font-medium", getStatusColor())}>
                {progress?.status || 'Pending'}
              </span>
            </div>
            <span className="text-blue-400 font-semibold">
              {progress?.progress || 0}%
            </span>
          </div>
          <Progress value={progress?.progress || 0} className="h-2" />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
            <p className="text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Reconnect Button */}
        {!isConnected && (
          <button
            onClick={reconnect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors"
          >
            Reconnect
          </button>
        )}
      </CardContent>
    </Card>
  );
}
