import { useState, useCallback } from 'react';
import { extractFrames, getSectionFrameOptions } from '../lib/frame-extractor';
import { analyzeFrame, selectBestFrames } from '../lib/quality-metrics';

/**
 * Hook that manages frame extraction and quality analysis for a video.
 * Runs analysis on the main thread (simpler, avoids worker serialization issues with ImageData).
 */
export function useFrameAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | extracting | analyzing | done | error
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });
  const [frames, setFrames] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [bestFrames, setBestFrames] = useState([]);
  const [error, setError] = useState(null);

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

      setFrames(extractedFrames);
      setStatus('analyzing');

      // Step 2: Analyze each frame's quality
      const results = [];
      for (let i = 0; i < extractedFrames.length; i++) {
        const frame = extractedFrames[i];
        const metrics = analyzeFrame(frame.imageData);
        results.push({ index: i, time: frame.time, metrics });

        setProgress({
          step: 'Analisando qualidade',
          current: i + 1,
          total: extractedFrames.length,
        });

        // Yield to main thread every few frames to keep UI responsive
        if (i % 5 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }

      setAnalysis(results);

      // Step 3: Select best frames for Gemini
      const best = selectBestFrames(results, 8);
      setBestFrames(best);

      setStatus('done');
      return { frames: extractedFrames, analysis: results, bestFrames: best };
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
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
