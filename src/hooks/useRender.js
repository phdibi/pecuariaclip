import { useState, useCallback, useRef, useEffect } from 'react';
import { startRender, pollRenderStatus } from '../lib/render-client';

/**
 * Hook to manage the rendering pipeline.
 * Triggers Cloud Functions and polls for status updates.
 */
export function useRender() {
  const [status, setStatus] = useState('idle'); // idle | queued | processing | done | error
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const pollRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  /**
   * Start rendering a video.
   */
  const render = useCallback(async ({ timeline, overlaySettings, animalData, outputQuality }) => {
    setStatus('queued');
    setProgress(0);
    setProgressMessage('Iniciando renderização...');
    setOutputUrl(null);
    setError(null);

    try {
      const result = await startRender({ timeline, overlaySettings, animalData, outputQuality });

      if (!result?.jobId) {
        throw new Error('Falha ao iniciar o job de renderização.');
      }

      setJobId(result.jobId);
      setStatus('processing');

      // Start polling for status updates
      startPolling(result.jobId);

    } catch (err) {
      setStatus('error');
      setError(err.message);
      setProgress(0);
      setProgressMessage('');
    }
  }, []);

  /**
   * Poll for render status updates.
   */
  const startPolling = useCallback((id) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(async () => {
      try {
        const statusData = await pollRenderStatus(id);

        setProgress(statusData.progress || 0);
        setProgressMessage(statusData.progressMessage || '');

        if (statusData.status === 'done') {
          setStatus('done');
          setOutputUrl(statusData.outputUrl);
          clearInterval(pollRef.current);
          pollRef.current = null;
        } else if (statusData.status === 'error') {
          setStatus('error');
          setError(statusData.error || 'Erro desconhecido na renderização.');
          clearInterval(pollRef.current);
          pollRef.current = null;
        } else {
          setStatus(statusData.status || 'processing');
        }
      } catch (err) {
        console.warn('Polling error:', err.message);
        // Don't stop polling on transient errors
      }
    }, 1500); // Poll every 1.5 seconds
  }, []);

  /**
   * Reset the render state.
   */
  const reset = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setProgressMessage('');
    setOutputUrl(null);
    setError(null);
    setJobId(null);
  }, []);

  return {
    status,
    progress,
    progressMessage,
    outputUrl,
    error,
    jobId,
    render,
    reset,
  };
}
