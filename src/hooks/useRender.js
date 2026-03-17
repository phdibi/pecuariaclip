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
  const pollErrorCount = useRef(0);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  /**
   * Poll for render status updates with exponential backoff on errors.
   */
  const startPolling = useCallback((id) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }
    pollErrorCount.current = 0;

    pollRef.current = setInterval(async () => {
      try {
        const statusData = await pollRenderStatus(id);
        pollErrorCount.current = 0; // Reset on success

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
        pollErrorCount.current += 1;
        console.warn(`Polling error (${pollErrorCount.current}):`, err.message);

        // Stop polling after 10 consecutive failures
        if (pollErrorCount.current >= 10) {
          setStatus('error');
          setError('Conexão com o servidor perdida. Tente novamente.');
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 1500);
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
  }, [startPolling]);

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
