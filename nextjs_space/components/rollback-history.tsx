'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Undo, 
  Download, 
  Trash2, 
  Clock, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { RollbackManager, type FileOperation } from '@/lib/rollback-manager';
import { formatDistanceToNow } from 'date-fns';

interface RollbackHistoryProps {
  onRestore?: (operation: FileOperation) => void;
}

export function RollbackHistory({ onRestore }: RollbackHistoryProps) {
  const [history, setHistory] = useState<FileOperation[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const recentOps = RollbackManager.getRecentOperations(60); // Last 60 minutes
    setHistory(recentOps);
  };

  const handleUndo = async (operation: FileOperation) => {
    if (!RollbackManager.canUndo(operation.id)) {
      toast.error('This operation is too old to undo');
      return;
    }

    setLoading(operation.id);

    try {
      // Restore original files
      if (onRestore) {
        onRestore(operation);
      }

      toast.success(`Reverted ${operation.type} operation`);
      RollbackManager.removeOperation(operation.id);
      loadHistory();
    } catch (error) {
      console.error('Undo error:', error);
      toast.error('Failed to undo operation');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadOriginal = (operation: FileOperation) => {
    try {
      operation.files.forEach((file) => {
        if (file.original.data) {
          const blob = new Blob([file.original.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.original.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
      toast.success('Original files downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download original files');
    }
  };

  const handleClearHistory = () => {
    RollbackManager.clearHistory();
    loadHistory();
    toast.success('History cleared');
  };

  const getOperationIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const getOperationLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (history.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Recent Operations</h3>
          <p className="text-sm text-slate-400">
            Your recent file operations will appear here, allowing you to undo changes within the last hour.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Operation History</h3>
          <span className="text-xs text-slate-400">({history.length})</span>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 space-y-3">
          {history.map((operation) => (
            <div
              key={operation.id}
              className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getOperationIcon(operation.type)}
                    <span className="font-medium text-white">
                      {getOperationLabel(operation.type)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(operation.timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  <div className="text-sm text-slate-400">
                    {operation.files.length} file{operation.files.length !== 1 ? 's' : ''} processed
                  </div>

                  {!RollbackManager.canUndo(operation.id) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      <span>Too old to undo</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {operation.files.some(f => f.original.data) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadOriginal(operation)}
                      className="border-blue-700 text-blue-400 hover:bg-blue-900/20"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}

                  {RollbackManager.canUndo(operation.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndo(operation)}
                      disabled={loading === operation.id}
                      className="border-green-700 text-green-400 hover:bg-green-900/20"
                    >
                      {loading === operation.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Undo className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700 bg-slate-900/30">
        <p className="text-xs text-slate-400 text-center">
          💡 You can undo operations within the last hour. Original files are temporarily stored locally.
        </p>
      </div>
    </Card>
  );
}
