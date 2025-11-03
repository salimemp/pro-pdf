
/**
 * Real-Time Progress Tracking Utilities
 * Manages progress updates for file processing operations
 */

export interface ProgressUpdate {
  jobId: string;
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  error?: string;
  timestamp: number;
}

export interface BatchProgress {
  jobId: string;
  totalFiles: number;
  completedFiles: number;
  overallProgress: number;
  files: ProgressUpdate[];
  startTime: number;
  estimatedTimeRemaining?: number;
}

class ProgressTracker {
  private listeners: Map<string, Set<(update: ProgressUpdate) => void>> = new Map();
  private batchListeners: Map<string, Set<(update: BatchProgress) => void>> = new Map();
  private progressData: Map<string, BatchProgress> = new Map();

  // Subscribe to progress updates for a specific job
  subscribe(jobId: string, callback: (update: ProgressUpdate) => void): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    
    this.listeners.get(jobId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(jobId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(jobId);
        }
      }
    };
  }

  // Subscribe to batch progress updates
  subscribeToBatch(jobId: string, callback: (update: BatchProgress) => void): () => void {
    if (!this.batchListeners.has(jobId)) {
      this.batchListeners.set(jobId, new Set());
    }
    
    this.batchListeners.get(jobId)!.add(callback);
    
    // Return current progress if available
    const currentProgress = this.progressData.get(jobId);
    if (currentProgress) {
      callback(currentProgress);
    }
    
    // Return unsubscribe function
    return () => {
      const listeners = this.batchListeners.get(jobId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.batchListeners.delete(jobId);
        }
      }
    };
  }

  // Emit progress update for a file
  emitProgress(update: ProgressUpdate): void {
    const listeners = this.listeners.get(update.jobId);
    if (listeners) {
      listeners.forEach(callback => callback(update));
    }
    
    // Update batch progress
    this.updateBatchProgress(update);
  }

  // Update batch progress
  private updateBatchProgress(update: ProgressUpdate): void {
    let batchProgress = this.progressData.get(update.jobId);
    
    if (!batchProgress) {
      batchProgress = {
        jobId: update.jobId,
        totalFiles: 0,
        completedFiles: 0,
        overallProgress: 0,
        files: [],
        startTime: Date.now(),
      };
      this.progressData.set(update.jobId, batchProgress);
    }
    
    // Update or add file progress
    const fileIndex = batchProgress.files.findIndex(f => f.fileId === update.fileId);
    if (fileIndex >= 0) {
      batchProgress.files[fileIndex] = update;
    } else {
      batchProgress.files.push(update);
    }
    
    // Calculate overall progress
    batchProgress.totalFiles = batchProgress.files.length;
    batchProgress.completedFiles = batchProgress.files.filter(
      f => f.status === 'completed' || f.status === 'error'
    ).length;
    
    const totalProgress = batchProgress.files.reduce((sum, f) => sum + f.progress, 0);
    batchProgress.overallProgress = batchProgress.totalFiles > 0 
      ? totalProgress / batchProgress.totalFiles 
      : 0;
    
    // Calculate estimated time remaining
    const elapsed = Date.now() - batchProgress.startTime;
    if (batchProgress.overallProgress > 0 && batchProgress.overallProgress < 100) {
      const estimatedTotal = (elapsed / batchProgress.overallProgress) * 100;
      batchProgress.estimatedTimeRemaining = Math.round((estimatedTotal - elapsed) / 1000);
    }
    
    // Emit batch progress update
    const batchListeners = this.batchListeners.get(update.jobId);
    if (batchListeners) {
      batchListeners.forEach(callback => callback(batchProgress!));
    }
  }

  // Initialize batch job
  initializeBatch(jobId: string, fileNames: string[]): void {
    const batchProgress: BatchProgress = {
      jobId,
      totalFiles: fileNames.length,
      completedFiles: 0,
      overallProgress: 0,
      files: fileNames.map((name, index) => ({
        jobId,
        fileId: `${jobId}_file_${index}`,
        fileName: name,
        progress: 0,
        status: 'pending',
        timestamp: Date.now(),
      })),
      startTime: Date.now(),
    };
    
    this.progressData.set(jobId, batchProgress);
    
    // Emit initial batch progress
    const batchListeners = this.batchListeners.get(jobId);
    if (batchListeners) {
      batchListeners.forEach(callback => callback(batchProgress));
    }
  }

  // Get current batch progress
  getBatchProgress(jobId: string): BatchProgress | undefined {
    return this.progressData.get(jobId);
  }

  // Clear batch progress
  clearBatch(jobId: string): void {
    this.progressData.delete(jobId);
    this.listeners.delete(jobId);
    this.batchListeners.delete(jobId);
  }
}

// Singleton instance
export const progressTracker = new ProgressTracker();
