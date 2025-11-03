
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ProgressData {
  jobId: string;
  progress: number;
  status: string;
  timestamp: number;
}

export function useProgressStream(jobId: string | null) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!jobId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`/api/jobs/${jobId}/progress`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data);
        } catch (err) {
          console.error('Failed to parse progress data:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        setError('Connection lost. Retrying...');
        eventSource.close();
        
        // Retry connection after 3 seconds
        setTimeout(() => {
          if (jobId) {
            connect();
          }
        }, 3000);
      };
    } catch (err) {
      setError('Failed to establish connection');
      console.error('EventSource error:', err);
    }
  }, [jobId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (jobId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [jobId, connect, disconnect]);

  return {
    progress,
    isConnected,
    error,
    reconnect: connect,
  };
}
