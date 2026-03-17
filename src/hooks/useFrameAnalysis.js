import { useState, useCallback, useRef } from 'react';
import { extractFrames, getSectionFrameOptions } from '../lib/frame-extractor';

/**
 * Hook that manages frame extraction and quality analysis for a video.
 * Uses a Web Worker to offload CPU-intensive quality analysis off the main thread.
 */
export function useFrameAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | extracting | analyzing | done | error
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });
  const [frames, setFrames] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [bestFrames, setBestFrames] = useState([]);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  const analyze = useCallback(async (videoUrl, sectionId) => {
    setStatus('extracting');
    setError(null);
    setFrames([]);
    setAnalysis([]);
    setBestFrames([]);

    try {
      // Step 1: Extract frames
      const frameOptions = getSectionFrameOptions(sectionId);
      const extractedFrames = await extractFrames(videoUrl, {
        ...frameOptions,
        onProgress: (current, total) => {
          setProgress({ step: 'Extraindo frames', current, total });
        },
      });

      // Store only dataUrl for display (not imageData, which is huge)
      setFrames(extractedFrames.map(f => ({ time: f.time, dataUrl: f.dataUrl })));
      setStatus('analyzing');

      // Step 2: Analyze using Web Worker to keep UI responsive
      const results = await analyzeInWorker(extractedFrames, (current, total) => {
        setProgress({ step: 'Analisando qualidade', current, total });
      }, workerRef);

      setAnalysis(results);

      // Step 3: Select best frames for Gemini
      const { selectBestFrames } = await import('../lib/quality-metrics');
      const best = selectBestFrames(results, 8);
      setBestFrames(best);

      // Clean up imageData from extractedFrames to free memory
      for (const frame of extractedFrames) {
        frame.imageData = null;
      }

      setStatus('done');
      return { frames: extractedFrames, analysis: results, bestFrames: best };
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setStatus('idle');
    setProgress({ step: '', current: 0, total: 0 });
    setFrames([]);
    setAnalysis([]);
    setBestFrames([]);
    setError(null);
  }, []);

  return {
    status,
    progress,
    frames,
    analysis,
    bestFrames,
    error,
    analyze,
    reset,
  };
}

/**
 * Run frame quality analysis in a Web Worker.
 * Transfers imageData buffers for zero-copy performance.
 */
function analyzeInWorker(extractedFrames, onProgress, workerRef) {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(
        new URL('../workers/frame-analysis.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      // Prepare transferable frame data
      const frameData = extractedFrames.map(f => ({
        time: f.time,
        imageData: {
          data: f.imageData.data.buffer,
          width: f.imageData.width,
          height: f.imageData.height,
        },
      }));

      // Collect transferable buffers
      const transfers = frameData.map(f => f.imageData.data);

      worker.onmessage = (e) => {
        const { type, results, current, total } = e.data;
        if (type === 'progress') {
          onProgress(current, total);
        } else if (type === 'results') {
          worker.terminate();
          workerRef.current = null;
          resolve(results);
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        workerRef.current = null;
        reject(new Error(`Worker error: ${err.message}`));
      };

      worker.postMessage({ type: 'analyze', frames: frameData }, transfers);
    } catch {
      // Fallback to main thread if Worker fails to load
      return analyzeOnMainThread(extractedFrames, onProgress).then(resolve, reject);
    }
  });
}

/**
 * Fallback: analyze frames on main thread if Web Worker is unavailable.
 */
async function analyzeOnMainThread(extractedFrames, onProgress) {
  const { analyzeFrame } = await import('../lib/quality-metrics');
  const results = [];
  for (let i = 0; i < extractedFrames.length; i++) {
    const frame = extractedFrames[i];
    const metrics = analyzeFrame(frame.imageData);
    results.push({ index: i, time: frame.time, metrics });
    onProgress(i + 1, extractedFrames.length);
    if (i % 5 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }
  return results;
}
