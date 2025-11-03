
// Web Worker Manager for PDF processing
export type WorkerMessageType = 
  | 'RENDER_PAGE'
  | 'MERGE_PDFS'
  | 'COMPRESS_PDF'
  | 'ADD_SIGNATURE';

export interface WorkerMessage {
  type: WorkerMessageType;
  payload: any;
}

export interface WorkerResponse {
  type: string;
  progress?: number;
  message?: string;
  error?: string;
  data?: any;
}

export class PDFWorkerManager {
  private worker: Worker | null = null;
  private messageHandlers: Map<string, (response: WorkerResponse) => void> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWorker();
    }
  }

  private initWorker() {
    try {
      this.worker = new Worker('/workers/pdf-worker.js');
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type } = event.data;
        const handler = this.messageHandlers.get(type);
        if (handler) {
          handler(event.data);
        }
      };
    } catch (error) {
      console.error('Failed to initialize PDF worker:', error);
    }
  }

  public postMessage(message: WorkerMessage, onResponse: (response: WorkerResponse) => void) {
    if (!this.worker) {
      console.warn('Worker not initialized, falling back to main thread');
      onResponse({ type: 'ERROR', error: 'Worker not available' });
      return;
    }

    // Register response handlers
    const responseTypes = this.getResponseTypes(message.type);
    responseTypes.forEach(type => {
      this.messageHandlers.set(type, onResponse);
    });

    this.worker.postMessage(message);
  }

  private getResponseTypes(messageType: WorkerMessageType): string[] {
    switch (messageType) {
      case 'RENDER_PAGE':
        return ['RENDER_PROGRESS', 'RENDER_COMPLETE', 'ERROR'];
      case 'MERGE_PDFS':
        return ['MERGE_PROGRESS', 'MERGE_COMPLETE', 'ERROR'];
      case 'COMPRESS_PDF':
        return ['COMPRESS_PROGRESS', 'COMPRESS_COMPLETE', 'ERROR'];
      case 'ADD_SIGNATURE':
        return ['SIGNATURE_PROGRESS', 'SIGNATURE_COMPLETE', 'ERROR'];
      default:
        return ['ERROR'];
    }
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.messageHandlers.clear();
  }
}

// Singleton instance
let workerInstance: PDFWorkerManager | null = null;

export function getPDFWorker(): PDFWorkerManager {
  if (!workerInstance) {
    workerInstance = new PDFWorkerManager();
  }
  return workerInstance;
}
