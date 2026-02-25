import { useState, useCallback } from 'react';
import { analyzeClipWithGemini, getEditRecommendation, isGeminiConfigured } from '../lib/gemini-client';

/**
 * Hook to manage Gemini AI analysis for video clips.
 */
export function useAiAnalysis() {
  const [status, setStatus] = useState('idle'); // idle | analyzing | done | error | no-key
  const [clipResults, setClipResults] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, step: '' });

  /**
   * Analyze multiple clips for a section.
   * @param {string} sectionId
   * @param {Array} clips - Array of { clipIndex, bestFrameDataUrls: string[] }
   */
  const analyzeSection = useCallback(async (sectionId, clips) => {
    if (!isGeminiConfigured()) {
      setStatus('no-key');
      setError('API do Gemini não configurada. Adicione VITE_GEMINI_API_KEY no .env.local');
      return null;
    }

    setStatus('analyzing');
    setError(null);
    setClipResults([]);
    setEditPlan(null);

    try {
      // Stage 1: Analyze each clip
      const results = [];
      setProgress({ current: 0, total: clips.length, step: 'Analisando clips com IA' });

      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        setProgress({ current: i + 1, total: clips.length, step: `Analisando clip ${i + 1} de ${clips.length}` });

        const analysis = await analyzeClipWithGemini(sectionId, clip.bestFrameDataUrls);
        results.push({ clipIndex: clip.clipIndex, analysis });
      }

      setClipResults(results);

      // Stage 2: Get edit recommendation
      setProgress({ current: 0, total: 1, step: 'Gerando plano de edição com IA' });
      const plan = await getEditRecommendation(sectionId, results);
      setEditPlan(plan);

      setStatus('done');
      return { clipResults: results, editPlan: plan };
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
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
    reset,
  };
}
