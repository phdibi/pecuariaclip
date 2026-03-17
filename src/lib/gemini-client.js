import { getSceneAnalysisPrompt, getCutRecommendationPrompt } from './prompts/scene-analysis';
import { TIMELINE_SECTIONS } from '../constants/timeline-sections';

let functionsInstance = null;
let functionsImported = false;

/**
 * Get Firebase Functions instance (lazy init) to call Gemini securely via proxy.
 */
async function getFunctionsClient() {
  if (functionsInstance) return functionsInstance;
  if (functionsImported) return null;

  try {
    const [{ getFunctions, connectFunctionsEmulator }, { default: app }] = await Promise.all([
      import('firebase/functions'),
      import('./firebase.js'),
    ]);

    functionsInstance = getFunctions(app, 'us-central1');

    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
    }

    functionsImported = true;
    return functionsInstance;
  } catch {
    functionsImported = true;
    return null;
  }
}

/**
 * Convert a frame dataUrl (JPEG) to base64 for the Gemini API.
 */
function dataUrlToBase64(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

/**
 * Call the Gemini API securely through Cloud Functions proxy.
 * API key stays server-side — never exposed in the browser.
 */
async function callGemini(prompt, frameDataUrls) {
  const functions = await getFunctionsClient();

  if (!functions) {
    throw new Error(
      'Firebase Functions não disponível. Configure o Firebase para usar a IA.'
    );
  }

  const { httpsCallable } = await import('firebase/functions');
  const geminiProxy = httpsCallable(functions, 'geminiProxy', {
    timeout: 120_000,
  });

  const images = frameDataUrls.map(url => ({
    mimeType: 'image/jpeg',
    base64: dataUrlToBase64(url),
  }));

  const response = await geminiProxy({ prompt, images });
  const result = response.data?.result;

  if (!result) {
    throw new Error('Gemini não retornou resposta válida.');
  }

  return result;
}

/**
 * Analyze a single clip's frames using Gemini.
 * @param {string} sectionId - Section of the storyboard
 * @param {string[]} frameDataUrls - Array of JPEG data URLs (best frames from client analysis)
 */
export async function analyzeClipWithGemini(sectionId, frameDataUrls) {
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);
  const prompt = getSceneAnalysisPrompt(sectionId, section?.desc || '');
  return callGemini(prompt, frameDataUrls);
}

/**
 * Get edit recommendations for a section based on analyzed clips.
 * @param {string} sectionId
 * @param {Array} clipAnalyses - Array of { clipIndex, analysis } from analyzeClipWithGemini
 */
export async function getEditRecommendation(sectionId, clipAnalyses) {
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);

  const clipsSummary = clipAnalyses.map((ca, i) =>
    `Clip ${i}: Rating=${ca.analysis.clip.clip_rating}/100, In=${ca.analysis.clip.recommended_in_frame}, Out=${ca.analysis.clip.recommended_out_frame}, Notes="${ca.analysis.clip.notes}"`
  ).join('\n');

  const prompt = getCutRecommendationPrompt(
    sectionId,
    section?.desc || '',
    section?.duration || '5-10s',
    clipsSummary
  );

  // Text-only prompt for edit recommendations (no images needed)
  return callGemini(prompt, []);
}

/**
 * Check if Gemini is available (Firebase Functions must be configured).
 */
export function isGeminiConfigured() {
  return !!import.meta.env.VITE_FIREBASE_API_KEY;
}
