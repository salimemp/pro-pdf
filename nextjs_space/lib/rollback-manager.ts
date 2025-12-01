/**
 * Rollback Manager - Handles undo/redo functionality for file operations
 * Stores operation history and allows reverting to previous states
 */

export interface FileOperation {
  id: string;
  type: 'convert' | 'merge' | 'split' | 'compress' | 'encrypt' | 'decrypt' | 'rotate' | 'watermark' | 'sign' | 'edit' | 'organize';
  timestamp: number;
  files: {
    original: {
      name: string;
      size: number;
      data?: ArrayBuffer; // Stored temporarily
    };
    processed?: {
      name: string;
      size: number;
      data?: ArrayBuffer;
    };
  }[];
  metadata?: any;
}

export class RollbackManager {
  private static readonly MAX_HISTORY = 10; // Max operations to keep in history
  private static readonly STORAGE_KEY = 'pro_pdf_operation_history';

  /**
   * Add a new operation to history
   */
  static addOperation(operation: Omit<FileOperation, 'id' | 'timestamp'>): string {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOperation: FileOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
    };

    // Get current history
    const history = this.getHistory();

    // Add new operation
    history.unshift(newOperation);

    // Keep only last MAX_HISTORY operations
    const trimmedHistory = history.slice(0, this.MAX_HISTORY);

    // Save to localStorage
    this.saveHistory(trimmedHistory);

    return id;
  }

  /**
   * Get operation history
   */
  static getHistory(): FileOperation[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error loading operation history:', error);
      return [];
    }
  }

  /**
   * Save history to localStorage
   */
  private static saveHistory(history: FileOperation[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving operation history:', error);
    }
  }

  /**
   * Get a specific operation by ID
   */
  static getOperation(id: string): FileOperation | null {
    const history = this.getHistory();
    return history.find(op => op.id === id) || null;
  }

  /**
   * Remove an operation from history
   */
  static removeOperation(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter(op => op.id !== id);
    this.saveHistory(filtered);
  }

  /**
   * Clear all history
   */
  static clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get operations from the last N minutes
   */
  static getRecentOperations(minutes: number = 30): FileOperation[] {
    const history = this.getHistory();
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return history.filter(op => op.timestamp >= cutoff);
  }

  /**
   * Check if an operation can be undone
   */
  static canUndo(id: string): boolean {
    const operation = this.getOperation(id);
    if (!operation) return false;

    // Check if operation is recent (within 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return operation.timestamp >= oneHourAgo;
  }
}

/**
 * Hook for using rollback functionality in components
 */
export function useRollbackManager() {
  const addOperation = (operation: Omit<FileOperation, 'id' | 'timestamp'>) => {
    return RollbackManager.addOperation(operation);
  };

  const getHistory = () => {
    return RollbackManager.getHistory();
  };

  const getRecentOperations = (minutes?: number) => {
    return RollbackManager.getRecentOperations(minutes);
  };

  const canUndo = (id: string) => {
    return RollbackManager.canUndo(id);
  };

  const removeOperation = (id: string) => {
    RollbackManager.removeOperation(id);
  };

  const clearHistory = () => {
    RollbackManager.clearHistory();
  };

  return {
    addOperation,
    getHistory,
    getRecentOperations,
    canUndo,
    removeOperation,
    clearHistory,
  };
}
