import { useState, useCallback, useRef } from 'react';
import { analyzeClipWithGemini, getEditRecommendation, isGeminiConfigured } from '../lib/gemini-client';

const MAX_CONCURRENT = 3;

/**
 * Hook to manage Gemini AI analysis for video clips.
 * Supports batched parallel requests for faster analysis.
 */
export function useAiAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | analyzing | done | error | no-key
  const [clipResults, setClipResults] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });
  const abortRef = useRef(false);

  /**
   * Analyze multiple clips for a section with batched parallelism.
   * @param {string} sectionId
   * @param {Array} clips - Array of { clipIndex, bestFrameDataUrls: string[] }
   */
  const analyzeSection = useCallback(async (sectionId, clips) => {
    if (!isGeminiConfigured()) {
      setStatus('no-key');
      setError('Firebase não configurado. Configure o Firebase para usar a IA.');
      return null;
    }

    abortRef.current = false;
    setStatus('analyzing');
    setError(null);
    setClipResults([]);
    setEditPlan(null);

    try {
      // Stage 1: Analyze clips in parallel batches
      const results = [];
      setProgress({ current: 0, total: clips.length, step: 'Analisando clips com IA' });

      for (let i = 0; i < clips.length; i += MAX_CONCURRENT) {
        if (abortRef.current) throw new Error('Análise cancelada.');

        const batch = clips.slice(i, i + MAX_CONCURRENT);
        const batchResults = await Promise.allSettled(
          batch.map(clip =>
            analyzeClipWithGemini(sectionId, clip.bestFrameDataUrls)
              .then(analysis => ({ clipIndex: clip.clipIndex, analysis }))
          )
        );

        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.warn(`Clip ${batch[j].clipIndex} analysis failed:`, result.reason.message);
          }
          setProgress({
            current: results.length,
            total: clips.length,
            step: `Analisando clip ${results.length} de ${clips.length}`,
          });
        }
      }

      if (results.length === 0) {
        throw new Error('Nenhum clip foi analisado com sucesso.');
      }

      setClipResults(results);

      // Stage 2: Get edit recommendation
      if (abortRef.current) throw new Error('Análise cancelada.');
      setProgress({ current: 0, total: 1, step: 'Gerando plano de edição com IA' });
      const plan = await getEditRecommendation(sectionId, results);
      setEditPlan(plan);

      setStatus('done');
      return { clipResults: results, editPlan: plan };
    } catch (err) {
      if (abortRef.current) {
        setStatus('idle');
      } else {
        setError(err.message);
        setStatus('error');
      }
      return null;
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setClipResults([]);
    setEditPlan(null);
    setError(null);
    setProgress({ current: 0, total: 0, step: '' });
  }, []);

  return {
    status,
    clipResults,
    editPlan,
    error,
    progress,
    analyzeSection,
    abort,
    reset,
  };
}
